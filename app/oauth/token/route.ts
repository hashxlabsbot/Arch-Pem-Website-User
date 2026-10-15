import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { TOKEN_TTL_S, authenticateClient, hashCode, issuer, ownerClaims, pkceMatches, signJwt } from '@/lib/oidc'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store', Pragma: 'no-cache' }
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: NO_STORE })

/** Step 2 of owner sign-in: the web app's server swaps the single-use code for a signed ID token. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = await rateLimit(`oidc-token:${ip}`, 60, 60_000)
  if (!allowed) return fail('slow_down', 429)

  const form = new URLSearchParams(await req.text())
  const client = authenticateClient(req.headers.get('authorization'), form)
  if (!client) return fail('invalid_client', 401)
  if (form.get('grant_type') !== 'authorization_code') return fail('unsupported_grant_type')

  const code = form.get('code') ?? ''
  if (!code || code.length > 200) return fail('invalid_grant')
  const row = await db.oidcAuthCode.findUnique({ where: { codeHash: hashCode(code) } })
  // Delete-then-count makes the code single-use even when two requests race.
  const consumed = row ? (await db.oidcAuthCode.deleteMany({ where: { codeHash: row.codeHash } })).count === 1 : false
  if (
    !row ||
    !consumed ||
    row.expiresAt < new Date() ||
    row.clientId !== client.id ||
    row.redirectUri !== form.get('redirect_uri') ||
    !pkceMatches(form.get('code_verifier'), row.codeChallenge)
  )
    return fail('invalid_grant')

  const claims = await ownerClaims(row.userId)
  if (!claims) return fail('invalid_grant')

  const now = Math.floor(Date.now() / 1000)
  const iss = issuer()
  const idToken = signJwt({
    ...claims,
    iss,
    aud: client.id,
    iat: now,
    exp: now + TOKEN_TTL_S,
    auth_time: now,
    ...(row.nonce ? { nonce: row.nonce } : {}),
  })
  const accessToken = signJwt({
    iss,
    aud: `${iss}/oauth/userinfo`,
    sub: row.userId,
    scope: row.scope,
    iat: now,
    exp: now + TOKEN_TTL_S,
  })
  logger.info('oidc: issued tokens', { userId: row.userId, client: client.id })
  return NextResponse.json(
    { access_token: accessToken, token_type: 'Bearer', expires_in: TOKEN_TTL_S, id_token: idToken, scope: row.scope },
    { headers: NO_STORE },
  )
}
