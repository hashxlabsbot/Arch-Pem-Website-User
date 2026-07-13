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
//
// Nonce-based CSP only works on routes Next.js renders per-request: there's no
// per-request context to embed a nonce into a statically-generated HTML file,
// so a nonce baked into a static page can never match the fresh nonce this
// middleware sets on the *next* request's header — every script gets blocked
// (Next.js's own docs note nonces disable static rendering for this reason).
// /dashboard and /api stay dynamic (auth-gated per request) and keep the
// strict nonce + 'strict-dynamic' policy below. Every other route is now
// statically generated for caching/TTFB, so it needs the nonce-free, 'self'
// + 'unsafe-inline' policy in buildStaticCSP — still no third-party script
// hosts beyond the same explicit allowlist, just without nonce enforcement.
function buildDynamicCSP(nonce: string): string {
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

function buildStaticCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.vapi.ai https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.razorpay.com https://api.brevo.com https://api.vapi.ai wss://api.vapi.ai https://*.daily.co wss://*.daily.co https://*.google-analytics.com https://*.analytics.google.com https://www.google.com",
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
  const isDynamicRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api')
  // The admin editor's live preview iframes this one route. It must be framable by
  // the admin origin only — everything else keeps frame-ancestors 'none'.
  const isPreviewRoute = pathname.startsWith('/blog/preview')

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
  // (only meaningful on dynamic routes — see buildDynamicCSP/buildStaticCSP above)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  Object.entries(STATIC_HEADERS).forEach(([k, v]) => res.headers.set(k, v))

  let csp = isDynamicRoute ? buildDynamicCSP(nonce) : buildStaticCSP()
  if (isPreviewRoute) {
    // X-Frame-Options can't allowlist a specific cross-origin, so drop it and rely
    // on CSP frame-ancestors, which can. Only the admin origin may frame the preview.
    res.headers.delete('X-Frame-Options')
    const adminOrigin = process.env.ADMIN_ORIGIN || 'http://localhost:3000'
    csp = csp.replace("frame-ancestors 'none'", `frame-ancestors 'self' ${adminOrigin}`)
  }
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)',
  ],
}
