/**
 * Centralised environment access.
 * Only what the site cannot run without throws at module load in production (warns in dev). Everything else is
 * optional per feature: see lib/features.ts, which reports what is switched off instead of failing the whole site.
 */

import { company } from './company'
import { recordCorrection, reportFeatureConfig } from './features'

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

const REQUIRED: EnvKey[] = ['DATABASE_URL', 'NEXTAUTH_SECRET']

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

// Reported when the production server starts (not during `next build`, which runs without production secrets).
// This only logs. A missing payment, email or app-sync setting disables that one feature, and each feature answers
// for itself (see lib/features.ts); it must never take down sign-in or the pages. Only what the site cannot run
// without (REQUIRED above) throws.
if (typeof window === 'undefined' && isProd && process.env.NEXT_PHASE !== 'phase-production-build') {
  reportFeatureConfig()
}

// The live site must never hand out a localhost or plain-http address: NextAuth reads NEXTAUTH_URL on every request
// for Google's OAuth redirect_uri and its cookies, and the same base feeds email links and the app's sign-in issuer.
// A NEXTAUTH_URL copied from a local .env (http://localhost:3001) sent Google sign-in back to localhost. On a Vercel
// production deploy, fall back to the canonical address and keep reporting it until the setting is fixed. Preview
// and local builds are left alone.
if (typeof window === 'undefined' && process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  const configured = process.env.NEXTAUTH_URL?.trim() ?? ''
  if (configured && (!configured.startsWith('https://') || /localhost|127\.0\.0\.1/.test(configured))) {
    process.env.NEXTAUTH_URL = company.siteUrl
    const msg = `NEXTAUTH_URL is set to a non-public address; using ${company.siteUrl}. Fix it in the Vercel production environment.`
    recordCorrection(msg)
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'error', msg: `config: ${msg}` }))
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
