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
  | 'BING_SITE_VERIFICATION'
  | 'YANDEX_SITE_VERIFICATION'
  | 'INDEXNOW_KEY'
  | 'NEXT_PUBLIC_VAPI_PUBLIC_KEY'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET'
  | 'GOOGLE_CALENDAR_REFRESH_TOKEN'
  | 'GOOGLE_CALENDAR_ID'
  | 'DEMO_LEADS_EMAILS'
  | 'WEB_APP_URL'
  | 'WEB_APP_WEBHOOK_SECRET'
  | 'OIDC_CLIENT_ID'
  | 'OIDC_CLIENT_SECRET'
  | 'OIDC_REDIRECT_URIS'
  | 'OIDC_PRIVATE_KEY'
  | 'CRON_SECRET'

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

/**
 * What a live arcpem.com needs to take payments, sign owners in to the ARC PEM app, keep the app in sync and send
 * email. Without any one of these the site still renders, but quietly drops payments, sign-ins, syncs or emails.
 */
const LAUNCH_REQUIRED: EnvKey[] = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'SMTP_HOST',
  'WEB_APP_URL',
  'WEB_APP_WEBHOOK_SECRET',
  'OIDC_CLIENT_ID',
  'OIDC_CLIENT_SECRET',
  'OIDC_PRIVATE_KEY',
  'CRON_SECRET',
]

/** Problems with the production configuration, one readable line each (empty when it is complete). */
export function launchConfigProblems(source: Record<string, string | undefined> = process.env): string[] {
  const has = (k: string) => Boolean(source[k]?.trim())
  const problems = LAUNCH_REQUIRED.filter((k) => !has(k)).map((k) => `${k} is not set`)
  const secret = source.NEXTAUTH_SECRET?.trim() ?? ''
  if (secret && (secret.length < 32 || /replace|change-?me|secret$/i.test(secret)))
    problems.push('NEXTAUTH_SECRET must be a random value of at least 32 characters (openssl rand -base64 32)')
  if (has('WEB_APP_WEBHOOK_SECRET') && !source.WEB_APP_WEBHOOK_SECRET!.split(',').some((s) => s.trim().length >= 32))
    problems.push('WEB_APP_WEBHOOK_SECRET must be at least 32 characters (openssl rand -hex 32)')
  if (has('NEXTAUTH_URL') && !source.NEXTAUTH_URL!.startsWith('https://'))
    problems.push('NEXTAUTH_URL must be the https:// address of the site')
  return problems
}

// Checked when the production server starts, not during `next build` (which runs without production secrets), so a
// deploy missing one fails at once and says which.
if (typeof window === 'undefined' && isProd && process.env.NEXT_PHASE !== 'phase-production-build') {
  const problems = launchConfigProblems()
  if (problems.length > 0) {
    throw new Error(`[env] Production configuration is incomplete:\n  - ${problems.join('\n  - ')}\nSee docs/LAUNCH.md in ARCPEM-Web.`)
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
  // Bing Webmaster Tools (msvalidate.01) — Bing's index also feeds ChatGPT search and Copilot answers.
  bingSiteVerification: () => get('BING_SITE_VERIFICATION'),
  yandexSiteVerification: () => get('YANDEX_SITE_VERIFICATION'),
  // IndexNow key (8–128 chars of a-z, A-Z, 0-9, '-'): served at /indexnow-key.txt; unset => no pings.
  indexNowKey: () => get('INDEXNOW_KEY'),
  vapiPublicKey: () => get('NEXT_PUBLIC_VAPI_PUBLIC_KEY'),
  // Both unset => Google button hidden and provider omitted (see lib/auth.ts).
  googleClientId: () => get('GOOGLE_CLIENT_ID'),
  googleClientSecret: () => get('GOOGLE_CLIENT_SECRET'),
  // Unset => Meet-link generation is skipped; booking still succeeds (see lib/google-calendar.ts).
  googleCalendarRefreshToken: () => get('GOOGLE_CALENDAR_REFRESH_TOKEN'),
  googleCalendarId: () => get('GOOGLE_CALENDAR_ID') ?? 'primary',
  // Comma-separated internal recipients for demo-lead notifications.
  demoLeadsEmails: () => (get('DEMO_LEADS_EMAILS') ?? 'info@arcpem.com').split(',').map((e) => e.trim()).filter(Boolean),

  // ── ARC PEM Web (app.arcpem.com) ──
  // Where the web app lives; subscription changes are pushed to {WEB_APP_URL}/api/webhooks/accounts.
  webAppUrl: () => get('WEB_APP_URL')?.replace(/\/$/, ''),
  // Signs those pushes (same value as ARCPEM_ACCOUNTS_WEBHOOK_SECRET in the web app; first one signs while rotating).
  webAppWebhookSecret: () => get('WEB_APP_WEBHOOK_SECRET')?.split(',')[0]?.trim(),
  // This site is the web app's OpenID Connect provider (owner sign-in). One registered client: the web app.
  oidcClientId: () => get('OIDC_CLIENT_ID'),
  oidcClientSecret: () => get('OIDC_CLIENT_SECRET'),
  // Exact redirect URIs allowed, comma-separated. Defaults to the web app's Auth.js callback.
  oidcRedirectUris: () => get('OIDC_REDIRECT_URIS'),
  // RSA private key (PEM) that signs ID tokens. Required in production; a throwaway key is generated in development.
  oidcPrivateKey: () => get('OIDC_PRIVATE_KEY'),
  // Bearer secret for /api/cron/* (retrying undelivered web-app events).
  cronSecret: () => get('CRON_SECRET'),
}
