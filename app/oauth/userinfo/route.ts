import { NextRequest, NextResponse } from 'next/server'
import { issuer, ownerClaims, verifyJwt } from '@/lib/oidc'

export const dynamic = 'force-dynamic'

async function handle(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const payload = auth.startsWith('Bearer ') ? verifyJwt(auth.slice(7), `${issuer()}/oauth/userinfo`) : null
  const claims = payload && typeof payload.sub === 'string' ? await ownerClaims(payload.sub) : null
  if (!claims)
    return NextResponse.json(
      { error: 'invalid_token' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"', 'Cache-Control': 'no-store' } },
    )
  return NextResponse.json(claims, { headers: { 'Cache-Control': 'no-store' } })
}

export const GET = handle
export const POST = handle
