import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Content-Security-Policy. The app relies on inline styles/<style> tags and
// Google Fonts, and Razorpay Checkout loads its script + opens an iframe, so
// those origins are explicitly allowed. ('unsafe-inline'/'unsafe-eval' are
// required by Next's runtime + Razorpay; tighten with nonces later if needed.)
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.razorpay.com https://api.brevo.com",
  "frame-src https://*.razorpay.com https://api.razorpay.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join('; ')

const SEC_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options':        'SAMEORIGIN',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
  'Content-Security-Policy': CSP,
  'Permissions-Policy':     'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
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
