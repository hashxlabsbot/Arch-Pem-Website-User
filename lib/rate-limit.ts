/**
 * Fixed-window rate limiter.
 *
 * Backend is pluggable:
 *  - If UPSTASH_REDIS_REST_URL + TOKEN are set, uses Upstash Redis over REST
 *    (shared across every serverless instance — required in production).
 *  - Otherwise falls back to an in-memory Map (single-instance/dev only).
 *
 * Always async. Redis failures fail OPEN (allow) but are logged.
 */
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export interface RateLimitResult {
  allowed: boolean
  retryAfter: number // seconds
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

const rk = (key: string) => `rl:${key}`

async function redisLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const k = rk(key)
  const count = (await redis(['INCR', k])) as number
  if (count === 1) await redis(['PEXPIRE', k, windowMs])
  if (count > limit) {
    const pttl = (await redis(['PTTL', k])) as number
    return { allowed: false, retryAfter: Math.ceil((pttl > 0 ? pttl : windowMs) / 1000) }
  }
  return { allowed: true, retryAfter: 0 }
}

// ── In-memory fallback ──────────────────────────────────────────────────
interface Entry {
  count: number
  resetAt: number
}
const store = new Map<string, Entry>()

function memLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true, retryAfter: 0 }
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (useRedis) {
    try {
      return await redisLimit(key, limit, windowMs)
    } catch (err) {
      logger.error('rate-limit redis failed; allowing request', err, { key })
      return { allowed: true, retryAfter: 0 }
    }
  }
  return memLimit(key, limit, windowMs)
}
