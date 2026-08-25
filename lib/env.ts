/**
 * Centralised environment access with fail-fast validation.
 * Required vars throw at module load in production; warn in dev.
 */

type EnvKey =
  | 'DATABASE_URL'
  | 'DIRECT_URL'
  | 'NEXTAUTH_SECRET'
  | 'NEXTAUTH_URL'
  | 'ADMIN_APP_URL'
  | 'NEXT_PUBLIC_ADMIN_API'
  | 'RAZORPAY_KEY_ID'
  | 'RAZORPAY_KEY_SECRET'
  | 'RAZORPAY_WEBHOOK_SECRET'
  | 'SMTP_HOST'
  | 'SMTP_PORT'
  | 'SMTP_SECURE'
  | 'SMTP_USER'
  | 'SMTP_PASS'
  | 'MAIL_FROM'
  | 'MAIL_FROM_NAME'
  | 'UPSTASH_REDIS_REST_URL'
  | 'UPSTASH_REDIS_REST_TOKEN'
  | 'NEXT_PUBLIC_GA_MEASUREMENT_ID'
  | 'GOOGLE_SITE_VERIFICATION'
  | 'NEXT_PUBLIC_VAPI_PUBLIC_KEY'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET'
  | 'GOOGLE_CALENDAR_REFRESH_TOKEN'
  | 'GOOGLE_CALENDAR_ID'
  | 'DEMO_LEADS_EMAILS'

const REQUIRED: EnvKey[] = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']

export const isProd = process.env.NODE_ENV === 'production'

if (typeof window === 'undefined') {
  const missing = REQUIRED.filter((k) => !process.env[k] || process.env[k]!.trim() === '')
  if (missing.length > 0) {
    const msg = `[env] Missing required environment variables: ${missing.join(', ')}`
    if (isProd) throw new Error(msg)
    // eslint-disable-next-line no-console
    console.warn(`${msg} (continuing in non-production)`)
  }
}

function get(key: EnvKey): string | undefined {
  const v = process.env[key]
  return v && v.trim() !== '' ? v : undefined
}

function required(key: EnvKey): string {
  const v = get(key)
  if (!v) throw new Error(`[env] Required environment variable not set: ${key}`)
  return v
}

export const env = {
  isProd,
  nextAuthSecret: () => required('NEXTAUTH_SECRET'),
  nextAuthUrl: () => get('NEXTAUTH_URL') ?? 'http://localhost:3001',
  adminAppUrl: () => get('ADMIN_APP_URL') ?? get('NEXT_PUBLIC_ADMIN_API') ?? 'http://localhost:3000',
  adminApi: () => get('NEXT_PUBLIC_ADMIN_API') ?? get('ADMIN_APP_URL') ?? 'http://localhost:3000',
  razorpayKeyId: () => get('RAZORPAY_KEY_ID'),
  razorpayKeySecret: () => get('RAZORPAY_KEY_SECRET'),
  razorpayWebhookSecret: () => get('RAZORPAY_WEBHOOK_SECRET'),
  smtpHost: () => get('SMTP_HOST'),
  smtpPort: () => get('SMTP_PORT'),
  smtpSecure: () => get('SMTP_SECURE'),
  smtpUser: () => get('SMTP_USER') ?? 'info@arcpem.com',
  mailFrom: () => get('MAIL_FROM') ?? get('SMTP_USER') ?? 'info@arcpem.com',
  mailFromName: () => get('MAIL_FROM_NAME') ?? 'ARC PEM',
  upstashUrl: () => get('UPSTASH_REDIS_REST_URL'),
  upstashToken: () => get('UPSTASH_REDIS_REST_TOKEN'),
  gaMeasurementId: () => get('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
  googleSiteVerification: () => get('GOOGLE_SITE_VERIFICATION'),
  vapiPublicKey: () => get('NEXT_PUBLIC_VAPI_PUBLIC_KEY'),
  // Both unset => Google button hidden and provider omitted (see lib/auth.ts).
  googleClientId: () => get('GOOGLE_CLIENT_ID'),
  googleClientSecret: () => get('GOOGLE_CLIENT_SECRET'),
  // Unset => Meet-link generation is skipped; booking still succeeds (see lib/google-calendar.ts).
  googleCalendarRefreshToken: () => get('GOOGLE_CALENDAR_REFRESH_TOKEN'),
  googleCalendarId: () => get('GOOGLE_CALENDAR_ID') ?? 'primary',
  // Comma-separated internal recipients for demo-lead notifications.
  demoLeadsEmails: () => (get('DEMO_LEADS_EMAILS') ?? 'info@arcpem.com').split(',').map((e) => e.trim()).filter(Boolean),
}
