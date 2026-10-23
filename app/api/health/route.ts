import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { securityWarnings, unavailableFeatures } from '@/lib/features'

// Liveness/readiness probe for uptime monitors: the site is up AND can reach the accounts database (sign-in,
// checkout and the app's sign-in provider all depend on it).
//
// `status` is "ok", or "degraded" when the site is serving but some features are switched off by missing settings.
// Degraded still answers 200 so an uptime monitor doesn't page for a gap in optional configuration; alert on the
// `degraded` field instead. Only feature names are listed, never setting names or values.
export const dynamic = 'force-dynamic'

export async function GET() {
  const off = unavailableFeatures().map((f) => f.id)
  const warnings = securityWarnings().length
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json(
      {
        status: off.length || warnings ? 'degraded' : 'ok',
        db: 'up',
        ...(off.length ? { unavailable: off } : {}),
        ...(warnings ? { securityWarnings: warnings } : {}),
        ts: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    logger.error('health check failed', err)
    return NextResponse.json(
      { status: 'error', db: 'down', ts: new Date().toISOString() },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
