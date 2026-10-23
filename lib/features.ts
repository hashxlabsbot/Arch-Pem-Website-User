/**
 * What each part of the site needs in order to run, checked independently.
 *
 * A missing setting disables only the feature that uses it: payments return a clear 503, the sign-in provider for the
 * ARC PEM web app answers "unavailable", scheduled jobs refuse unauthenticated calls, and so on. It never stops the
 * site, the pages or owner sign-in from working. The result feeds the startup log and /api/health, so an operator sees
 * exactly what is switched off without reading code.
 *
 * Pure (takes the environment as an argument) so it can be tested without touching process.env.
 */
type Source = Record<string, string | undefined>

export type FeatureId = 'payments' | 'paymentWebhook' | 'appSignIn' | 'appSync' | 'scheduledJobs' | 'email' | 'siteUrl'

export type FeatureStatus = {
  id: FeatureId
  /** Plain-English name, safe to show to an operator. */
  label: string
  ready: boolean
  /** Names of the settings that are absent or invalid. Never values. */
  missing: string[]
}

export const FEATURE_ENV: Record<FeatureId, { label: string; keys: string[] }> = {
  payments: { label: 'Online payments and subscriptions', keys: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'] },
  paymentWebhook: { label: 'Payment confirmations from Razorpay', keys: ['RAZORPAY_WEBHOOK_SECRET'] },
  appSignIn: { label: 'Sign-in to the ARC PEM web app', keys: ['WEB_APP_URL', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_PRIVATE_KEY'] },
  appSync: { label: 'Subscription sync to the ARC PEM web app', keys: ['WEB_APP_URL', 'WEB_APP_WEBHOOK_SECRET'] },
  scheduledJobs: { label: 'Scheduled jobs (retrying undelivered app updates)', keys: ['CRON_SECRET'] },
  email: { label: 'Transactional email', keys: ['SMTP_HOST'] },
  siteUrl: { label: 'Public site address', keys: ['NEXTAUTH_URL'] },
}

const has = (src: Source, k: string) => Boolean(src[k]?.trim())

/** The settings of one feature that are missing or unusable. */
function missingFor(id: FeatureId, src: Source): string[] {
  const missing = FEATURE_ENV[id].keys.filter((k) => !has(src, k))
  if (id === 'appSync' && has(src, 'WEB_APP_WEBHOOK_SECRET') && !src.WEB_APP_WEBHOOK_SECRET!.split(',').some((s) => s.trim().length >= 32)) {
    missing.push('WEB_APP_WEBHOOK_SECRET (needs at least 32 characters)')
  }
  if (id === 'siteUrl' && has(src, 'NEXTAUTH_URL') && !src.NEXTAUTH_URL!.trim().startsWith('https://')) {
    missing.push('NEXTAUTH_URL (must start with https://)')
  }
  return missing
}

export function featureReport(src: Source = process.env): FeatureStatus[] {
  return (Object.keys(FEATURE_ENV) as FeatureId[]).map((id) => {
    const missing = missingFor(id, src)
    return { id, label: FEATURE_ENV[id].label, ready: missing.length === 0, missing }
  })
}

/** Features that cannot run with the current settings. */
export const unavailableFeatures = (src: Source = process.env) => featureReport(src).filter((f) => !f.ready)

/**
 * Warnings about settings that are present but unsafe. These never block anything (a site that is up and warning
 * is better than one that is down), but they are logged at startup and flagged by /api/health.
 */
export function securityWarnings(src: Source = process.env): string[] {
  const out: string[] = []
  const secret = src.NEXTAUTH_SECRET?.trim() ?? ''
  if (secret && /replace|change-?me|secret$/i.test(secret)) out.push('NEXTAUTH_SECRET looks like a placeholder; session tokens could be forged. Set a random value.')
  else if (secret && secret.length < 32) out.push('NEXTAUTH_SECRET is shorter than 32 characters (openssl rand -base64 32).')
  return out
}

/**
 * Settings the server had to correct at startup to stay safe (e.g. a localhost NEXTAUTH_URL on the live site).
 * Kept so /api/health keeps flagging the misconfiguration until the setting itself is fixed.
 */
export const configCorrections: string[] = []
export const recordCorrection = (msg: string) => {
  if (!configCorrections.includes(msg)) configCorrections.push(msg)
}

let reported = false

/**
 * Logs, once per server process, which features are off. Loud (console.error, one JSON line per problem so log
 * drains can alert on it) but never throws.
 */
export function reportFeatureConfig(src: Source = process.env) {
  if (reported) return
  reported = true
  for (const f of unavailableFeatures(src)) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'error', msg: `config: ${f.label} is unavailable`, feature: f.id, missing: f.missing }))
  }
  for (const w of securityWarnings(src)) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'error', msg: `config: ${w}` }))
  }
}
