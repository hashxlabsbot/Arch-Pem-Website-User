import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from './db'
import { env, isProd } from './env'
import { rateLimit } from './rate-limit'

// Generic message — never reveal whether the account exists.
const INVALID_MSG = 'Invalid email or password.'

// Re-validate the JWT against the DB at most this often (bounds DB load while
// keeping suspend / logout-everywhere latency low).
const REVALIDATE_INTERVAL_MS = 60 * 1000

// Constant-time fallback hash so login timing doesn't reveal account existence.
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO3Jj9hQ0c8Hn3a3oQ1qE0pXjJ4kqg2Iu'

/** The plan shown in the account: the firm's ARC PEM subscription, else a legacy desktop licence. */
const PLAN_INCLUDE = {
  plan: { select: { name: true } },
  webSubscription: { select: { plan: { select: { name: true } } } },
} as const
function planInfo(u: { plan: { name: string } | null; webSubscription: { plan: { name: string } } | null }) {
  return {
    planName: u.webSubscription ? u.webSubscription.plan.name.replace(/^web\s+/i, '') : u.plan?.name ?? null,
    hasDesktop: Boolean(u.plan),
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error(INVALID_MSG)

        const email = credentials.email.trim().toLowerCase()
        const { allowed } = await rateLimit(`login:${email}`, 5, 15 * 60 * 1000)
        if (!allowed) throw new Error('TooManyRequests')

        const user = await db.user.findUnique({ where: { email }, include: PLAN_INCLUDE })

        // Always run a compare to keep response time constant (anti-enumeration).
        const valid = await bcrypt.compare(credentials.password, user?.password ?? DUMMY_HASH)

        if (!user || !valid) throw new Error(INVALID_MSG)
        if (user.status === 'SUSPENDED') throw new Error('AccountSuspended')

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...planInfo(user),
          tokenVersion: user.tokenVersion,
        } as {
          id: string
          name: string
          email: string
          role: string
          planName: string | null
          hasDesktop: boolean
          tokenVersion: number
        }
      },
    }),
    // Omitted entirely (not just disabled) when unconfigured, so the button
    // can be hidden client-side by checking the providers list.
    ...(env.googleClientId() && env.googleClientSecret()
      ? [
          GoogleProvider({
            clientId: env.googleClientId()!,
            clientSecret: env.googleClientSecret()!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true

      const email = user.email?.trim().toLowerCase()
      if (!email) return false

      // Google only sets this when it's confirmed the address; refuse anything else.
      const googleProfile = profile as { email_verified?: boolean } | undefined
      if (googleProfile?.email_verified === false) return false

      let dbUser = await db.user.findUnique({ where: { email }, include: PLAN_INCLUDE })

      if (!dbUser) {
        // Google users authenticate via OAuth only; this fills the (required,
        // shared-schema) password column with a hash nobody can produce a match for.
        const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12)
        dbUser = await db.user.create({
          data: { name: user.name || email.split('@')[0], email, password: unusablePassword },
          include: PLAN_INCLUDE,
        })
      }

      if (dbUser.status === 'SUSPENDED') return false

      // Carried onto the `user` object into the jwt callback below (initial sign-in branch).
      user.id = dbUser.id
      user.role = dbUser.role
      Object.assign(user, planInfo(dbUser))
      user.tokenVersion = dbUser.tokenVersion

      return true
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in.
      if (user) {
        const u = user as { id: string; role?: string; planName?: string | null; hasDesktop?: boolean; tokenVersion?: number }
        token.id = u.id
        token.role = u.role ?? 'USER'
        token.planName = u.planName ?? null
        token.hasDesktop = u.hasDesktop ?? false
        token.tokenVersion = u.tokenVersion ?? 0
        token.checkedAt = Date.now()
        return token
      }

      if (trigger === 'update' && session?.name) {
        token.name = session.name
      }

      // Periodic re-validation: revoke on suspend / tokenVersion bump / deletion,
      // and pick up plan changes made by the admin.
      const lastChecked = (token.checkedAt as number) ?? 0
      if (Date.now() - lastChecked >= REVALIDATE_INTERVAL_MS) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, tokenVersion: true, ...PLAN_INCLUDE },
        })
        if (
          !dbUser ||
          dbUser.status === 'SUSPENDED' ||
          dbUser.tokenVersion !== (token.tokenVersion as number)
        ) {
          token.role = 'REVOKED'
        } else {
          token.role = dbUser.role
          Object.assign(token, planInfo(dbUser))
        }
        token.checkedAt = Date.now()
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.planName = token.planName as string | null
        session.user.hasDesktop = Boolean(token.hasDesktop)
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: env.nextAuthSecret(),
  cookies: {
    sessionToken: {
      name: 'arcpem.session',
      // Secure cookies in production (HTTPS); host-only in dev.
      options: { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: isProd },
    },
  },
}

/**
 * Use this instead of `getServerSession(authOptions)` everywhere a route or
 * page gates on "is this user actually logged in" — it's the only place that
 * checks for the `REVOKED` role the jwt callback above computes on suspend /
 * password-reset / account deletion. Plain `getServerSession` still returns a
 * truthy session object in that case (only `role` changes), so callers that
 * merely check `if (!session)` were letting revoked sessions through.
 */
export async function getActiveSession() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'REVOKED') return null
  return session
}
