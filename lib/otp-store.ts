/**
 * Email OTP store for registration verification.
 *
 * Backend: Upstash Redis (shared across instances, auto-expiring) when
 * configured, else an in-memory Map for dev. OTPs are generated with a
 * cryptographically secure RNG (NOT Math.random) and compared in constant time.
 */
import crypto from 'crypto'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000 // 60s between sends
const MAX_ATTEMPTS = 5

interface OtpEntry {
  otp: string
  expiresAt: number
  attempts: number
  lastSentAt: number
}

const REDIS_URL = env.upstashUrl()
const REDIS_TOKEN = env.upstashToken()
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN)

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`)
  return ((await res.json()) as { result: unknown }).result
}

const memStore = new Map<string, OtpEntry>()
const key = (email: string) => `otp:${email}`

async function read(email: string): Promise<OtpEntry | null> {
  if (useRedis) {
    const raw = (await redis(['GET', key(email)])) as string | null
    return raw ? (JSON.parse(raw) as OtpEntry) : null
  }
  const e = memStore.get(email)
  if (e && Date.now() > e.expiresAt) {
    memStore.delete(email)
    return null
  }
  return e ?? null
}

async function write(email: string, entry: OtpEntry): Promise<void> {
  if (useRedis) {
    await redis(['SET', key(email), JSON.stringify(entry), 'PX', OTP_TTL_MS])
  } else {
    memStore.set(email, entry)
  }
}

async function remove(email: string): Promise<void> {
  if (useRedis) await redis(['DEL', key(email)])
  else memStore.delete(email)
}

function generate(): string {
  // 6-digit cryptographically secure code (100000–999999).
  return String(crypto.randomInt(100000, 1000000))
}

export async function createOtp(email: string): Promise<{ otp: string; error?: string }> {
  try {
    const now = Date.now()
    const existing = await read(email)
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000)
      return { otp: '', error: `Please wait ${wait}s before requesting another code.` }
    }
    const otp = generate()
    await write(email, { otp, expiresAt: now + OTP_TTL_MS, attempts: 0, lastSentAt: now })
    return { otp }
  } catch (err) {
    logger.error('createOtp failed', err, { email })
    return { otp: '', error: 'Could not generate a code right now. Please try again.' }
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const now = Date.now()
    const entry = await read(email)
    if (!entry) return { valid: false, error: 'Code not found. Please request a new one.' }
    if (now > entry.expiresAt) {
      await remove(email)
      return { valid: false, error: 'Code has expired. Please request a new one.' }
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      await remove(email)
      return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' }
    }

    entry.attempts++

    const candidate = Buffer.from(otp.trim())
    const stored = Buffer.from(entry.otp)
    const ok = candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored)

    if (!ok) {
      await write(email, entry) // persist incremented attempt count
      const left = MAX_ATTEMPTS - entry.attempts
      return { valid: false, error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` }
    }

    await remove(email)
    return { valid: true }
  } catch (err) {
    logger.error('verifyOtp failed', err, { email })
    return { valid: false, error: 'Could not verify the code right now. Please try again.' }
  }
}
