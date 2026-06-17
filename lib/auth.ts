import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { rateLimit } from './rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { allowed } = rateLimit(`login:${credentials.email.toLowerCase()}`, 5, 15 * 60 * 1000)
        if (!allowed) throw new Error('TooManyRequests')

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { plan: { select: { id: true, name: true } } },
        })
        if (!user) return null
        if (user.status === 'SUSPENDED') throw new Error('AccountSuspended')

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id:       user.id,
          name:     user.name,
          email:    user.email,
          role:     user.role,
          planName: user.plan?.name ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id       = (user as any).id
        token.role     = (user as any).role
        token.planName = (user as any).planName
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id       = token.id as string
        session.user.role     = token.role as string
        session.user.planName = token.planName as string | null
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'arcpem.session',
      options: { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: false },
    },
  },
}
