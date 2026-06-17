/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// Razorpay Checkout loads a script and connects/embeds its own domains —
// the CSP must allow them or payments break.
const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com'
const RAZORPAY_CONNECT = 'https://api.razorpay.com https://lumberjack.razorpay.com'
const RAZORPAY_FRAME = 'https://api.razorpay.com https://checkout.razorpay.com'

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is only needed by Next.js in development; drop it in prod.
  `script-src 'self' 'unsafe-inline' ${isProd ? '' : "'unsafe-eval'"} ${RAZORPAY_SCRIPT}`.replace(/\s+/g, ' ').trim(),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${RAZORPAY_CONNECT}`,
  `frame-src ${RAZORPAY_FRAME}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Content-Security-Policy', value: csp },
  // HSTS only in production (don't pin localhost to HTTPS in dev).
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
