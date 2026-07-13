import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Short-lived, per-post HMAC token for the admin editor's live preview.
 * Token = `${expiryMs}.${hmac}` where hmac = HMAC-SHA256(`${id}.${expiryMs}`, PREVIEW_SECRET).
 * Signed by the admin app, verified here. Keeps the shared secret server-side —
 * only a per-post, time-limited token is ever exposed to the browser.
 */
function hmac(id: string, exp: string, secret: string): string {
  return createHmac('sha256', secret).update(`${id}.${exp}`).digest('hex')
}

export function verifyPreviewToken(id: string, token: string | undefined | null): boolean {
  const secret = process.env.PREVIEW_SECRET
  if (!secret || !token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig) return false
  if (Number(exp) < Date.now()) return false
  const expected = hmac(id, exp, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
