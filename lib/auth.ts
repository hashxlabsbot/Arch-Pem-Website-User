import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
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

        const user = await db.user.findUnique({
          where: { email },
          include: { plan: { select: { id: true, name: true } } },
        })

        // Always run a compare to keep response time constant (anti-enumeration).
        const valid = await bcrypt.compare(credentials.password, user?.password ?? DUMMY_HASH)

        if (!user || !valid) throw new Error(INVALID_MSG)
        if (user.status === 'SUSPENDED') throw new Error('AccountSuspended')

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          planName: user.plan?.name ?? null,
          tokenVersion: user.tokenVersion,
        } as {
          id: string
          name: string
          email: string
          role: string
          planName: string | null
          tokenVersion: number
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in.
      if (user) {
        const u = user as { id: string; role?: string; planName?: string | null; tokenVersion?: number }
        token.id = u.id
        token.role = u.role ?? 'USER'
        token.planName = u.planName ?? null
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
          select: { role: true, status: true, tokenVersion: true, plan: { select: { name: true } } },
        })
        if (
          !dbUser ||
          dbUser.status === 'SUSPENDED' ||
          dbUser.tokenVersion !== (token.tokenVersion as number)
        ) {
          token.role = 'REVOKED'
        } else {
          token.role = dbUser.role
          token.planName = dbUser.plan?.name ?? null
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
