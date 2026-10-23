import { NextResponse } from 'next/server'
import { jwks, oidcUnavailable } from '@/lib/oidc'

export const dynamic = 'force-dynamic'

export function GET() {
  const unavailable = oidcUnavailable()
  if (unavailable) return unavailable

  return NextResponse.json(jwks(), { headers: { 'Cache-Control': 'public, max-age=300' } })
}
