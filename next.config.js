/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// CSP is applied per-request in middleware.ts (nonce-based).
// These static headers cover routes excluded from the middleware matcher
// (e.g. _next/static) where a nonce isn't needed.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'localhost:3001')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { allowedOrigins },
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = config
