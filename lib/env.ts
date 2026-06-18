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
  | 'BREVO_API_KEY'
  | 'BREVO_SENDER_EMAIL'
  | 'UPSTASH_REDIS_REST_URL'
  | 'UPSTASH_REDIS_REST_TOKEN'

const REQUIRED: EnvKey[] = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']

export const isProd = process.env.NODE_ENV === 'production'

const missing = REQUIRED.filter((k) => !process.env[k] || process.env[k]!.trim() === '')
if (missing.length > 0) {
  const msg = `[env] Missing required environment variables: ${missing.join(', ')}`
  if (isProd) throw new Error(msg)
  // eslint-disable-next-line no-console
  console.warn(`${msg} (continuing in non-production)`)
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
  brevoApiKey: () => get('BREVO_API_KEY'),
  brevoSender: () => get('BREVO_SENDER_EMAIL') ?? 'noreply@arcpem.com',
  upstashUrl: () => get('UPSTASH_REDIS_REST_URL'),
  upstashToken: () => get('UPSTASH_REDIS_REST_TOKEN'),
}
