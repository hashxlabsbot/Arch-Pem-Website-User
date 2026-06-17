import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const SEC_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options':        'SAMEORIGIN',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
}

function withSecHeaders(res: NextResponse): NextResponse {
  Object.entries(SEC_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret:     process.env.NEXTAUTH_SECRET,
    cookieName: 'arcpem.session',
  })

  const { pathname } = req.nextUrl

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    if (token.role === 'ADMIN') {
      const adminUrl = process.env.ADMIN_APP_URL || 'http://localhost:3000'
      return NextResponse.redirect(new URL('/admin', adminUrl))
    }
  }

  // API user routes require an authenticated session
  if (pathname.startsWith('/api/user/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return withSecHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)',
  ],
}
