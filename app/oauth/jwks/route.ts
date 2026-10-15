import { NextResponse } from 'next/server'
import { jwks } from '@/lib/oidc'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(jwks(), { headers: { 'Cache-Control': 'public, max-age=300' } })
}
