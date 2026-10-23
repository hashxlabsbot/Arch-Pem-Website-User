import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { deliverOutbox } from '@/lib/web-app'

export const dynamic = 'force-dynamic'

/**
 * Retries ARC PEM Web events that weren't delivered at once, and clears expired sign-in codes. Schedule every few
 * minutes with `Authorization: Bearer $CRON_SECRET` (e.g. a Vercel cron or any external scheduler).
 */
export async function GET(req: NextRequest) {
  const secret = env.cronSecret()
  const given = req.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  const ok = secret && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret))
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await deliverOutbox({ limit: 100 })
  const { count: expiredCodes } = await db.oidcAuthCode.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  return NextResponse.json({ ...result, expiredCodes })
}
