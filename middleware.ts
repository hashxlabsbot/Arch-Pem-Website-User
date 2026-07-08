import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const isProd = process.env.NODE_ENV === 'production'

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('base64')
}

// 'strict-dynamic' + nonce replaces 'unsafe-inline': trusted scripts (nonce-bearing)
// can load additional scripts (e.g. Razorpay checkout.js added via createElement).
// Domain allowlist is kept as fallback for older browsers that ignore strict-dynamic.
// 'unsafe-eval' is required even in prod: Vapi's voice widget loads Daily.co's
// call-machine-object-bundle.js, which uses eval() internally to load its WebRTC
// runtime — without it the bundle load fails and the assistant can't connect.
function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://checkout.razorpay.com https://api.vapi.ai`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    // https://*.daily.co / wss://*.daily.co — Vapi's voice widget runs its WebRTC call over Daily.co.
    "connect-src 'self' https://*.razorpay.com https://api.brevo.com https://api.vapi.ai wss://api.vapi.ai https://*.daily.co wss://*.daily.co https://*.google-analytics.com https://*.analytics.google.com https://www.google.com",
    // media-src required for WebRTC audio tracks piped through Daily.co
    "media-src 'self' blob: https://*.daily.co",
    "frame-src https://*.razorpay.com https://api.razorpay.com",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join('; ')
}

const STATIC_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options':        'SAMEORIGIN',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
  'Permissions-Policy':     'camera=(), microphone=(self), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  ...(isProd ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' } : {}),
}

export async function middleware(req: NextRequest) {
  const nonce = generateNonce()

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

  // Forward nonce so Next.js can attach it to its own injected <script> tags
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  Object.entries(STATIC_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  res.headers.set('Content-Security-Policy', buildCSP(nonce))
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)',
  ],
}
