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
  // ARC PEM is now one web product: the old edition page folds into the home page.
  async redirects() {
    return [
      { source: '/web', destination: '/', permanent: true },
      { source: '/compare/arc-pem-desktop-vs-web', destination: '/pricing', permanent: true },
      // Links inside published blog posts that point at URLs that never existed (or were renamed). Kept so visitors and
      // crawlers land on the right page; the post text should still be corrected in the admin editor.
      { source: '/blog/bar-bending-schedule-bbs-explained', destination: '/blog/bar-bending-schedule-mechanism-explained', permanent: true },
      { source: '/tools/gst-contractor-bill-generator', destination: '/tools/contractor-bill-generator', permanent: true },
    ]
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = config
