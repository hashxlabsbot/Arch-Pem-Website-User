/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// CSP is applied per-request in middleware.ts (nonce-based).
// These static headers cover routes excluded from the middleware matcher
// (e.g. _next/static) where a nonce isn't needed.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // X-Frame-Options is set in middleware.ts (SAMEORIGIN everywhere except the
  // /blog/preview route, which the admin editor must be able to iframe). Setting
  // it here too would re-add it on that route and block the preview iframe.
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
  images: {
    // Blog cover images uploaded via the admin editor live on Vercel Blob.
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
  // Internal links inside published blog posts that point at slugs which
  // never existed. Posts live in the CMS database, so redirect rather than
  // edit; the authors can fix the source text whenever convenient.
  async redirects() {
    return [
      { source: '/tools/gst-contractor-bill-generator', destination: '/tools/contractor-bill-generator', permanent: true },
      { source: '/blog/bar-bending-schedule-bbs-explained', destination: '/blog/bar-bending-schedule-mechanism-explained', permanent: true },
    ]
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = config
