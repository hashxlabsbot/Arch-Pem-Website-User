import { company } from '@/lib/company'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

/** Where the key is published; IndexNow fetches it to check we own the host. */
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt'

/**
 * Tells IndexNow-enabled search engines (Bing — which also feeds ChatGPT search
 * and Copilot — Yandex, Seznam, Naver) that these URLs changed, so they are
 * recrawled in minutes instead of days. Best effort: does nothing without
 * INDEXNOW_KEY or outside production, and never throws.
 */
export async function submitToIndexNow(paths: string[]) {
  const key = env.indexNowKey()
  if (!key || !env.isProd || paths.length === 0) return
  const base = company.siteUrl.replace(/\/$/, '')
  const urlList = Array.from(new Set(paths.map((p) => (p.startsWith('http') ? p : `${base}${p}`))))
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(base).host, key, keyLocation: `${base}${INDEXNOW_KEY_PATH}`, urlList }),
      signal: AbortSignal.timeout(8_000),
    })
    // 200 = accepted, 202 = accepted while the key is being validated.
    if (res.status !== 200 && res.status !== 202) {
      logger.warn('IndexNow submission rejected', { status: res.status, urls: urlList.length })
    }
  } catch (err) {
    logger.warn('IndexNow submission failed', { error: String(err) })
  }
}
