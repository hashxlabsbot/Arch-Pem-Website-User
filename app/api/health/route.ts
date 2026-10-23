import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// Liveness/readiness probe for uptime monitors: the site is up AND can reach the accounts database (sign-in,
// checkout and the app's sign-in provider all depend on it).
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', db: 'up', ts: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    logger.error('health check failed', err)
    return NextResponse.json(
      { status: 'error', db: 'down', ts: new Date().toISOString() },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
