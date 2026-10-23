import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { CODE_TTL_MS, SUPPORTED_SCOPES, findClient, hashCode, issuer, oidcUnavailable } from '@/lib/oidc'

export const dynamic = 'force-dynamic'

function problem(message: string, status = 400) {
  // Never redirect back to a client or URI we couldn't verify; show the error here instead.
  return new NextResponse(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

/**
 * Step 1 of owner sign-in. A signed-out visitor goes through this site's normal login and comes back here; a
 * signed-in one is sent straight back to the web app with a single-use code (no consent screen: first-party app).
 */
export async function GET(req: NextRequest) {
  const unavailable = oidcUnavailable()
  if (unavailable) return unavailable

  const p = req.nextUrl.searchParams
  const client = findClient(p.get('client_id'))
  if (!client) return problem('Unknown client.')
  const redirectUri = p.get('redirect_uri') ?? ''
  if (!client.redirectUris.includes(redirectUri)) return problem('This redirect URI is not registered.')

  const back = (params: Record<string, string>) => {
    const url = new URL(redirectUri)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    const state = p.get('state')
    if (state) url.searchParams.set('state', state)
    url.searchParams.set('iss', issuer())
    return NextResponse.redirect(url, { headers: { 'Cache-Control': 'no-store' } })
  }

  const scopes = (p.get('scope') ?? '').split(' ').filter(Boolean)
  if (p.get('response_type') !== 'code') return back({ error: 'unsupported_response_type' })
  if (!scopes.includes('openid') || scopes.some((s) => !SUPPORTED_SCOPES.includes(s)))
    return back({ error: 'invalid_scope' })
  const challenge = p.get('code_challenge') ?? ''
  if (p.get('code_challenge_method') !== 'S256' || !/^[A-Za-z0-9\-_]{43}$/.test(challenge))
    return back({ error: 'invalid_request', error_description: 'PKCE with S256 is required.' })
  const nonce = p.get('nonce')
  if (nonce && nonce.length > 200) return back({ error: 'invalid_request' })

  const session = await getActiveSession()
  if (!session) {
    const login = new URL('/login', req.url)
    login.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`)
    login.searchParams.set('for', 'web-app')
    return NextResponse.redirect(login)
  }

  // The session is re-checked against the database only every minute; sign-in to another product must be current.
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { status: true, role: true } })
  if (!user || user.status !== 'ACTIVE' || user.role !== 'USER') return back({ error: 'access_denied' })

  const { allowed } = await rateLimit(`oidc-authorize:${session.user.id}`, 30, 10 * 60_000)
  if (!allowed) return back({ error: 'temporarily_unavailable' })

  const code = randomBytes(32).toString('base64url')
  await db.oidcAuthCode.create({
    data: {
      codeHash: hashCode(code),
      userId: session.user.id,
      clientId: client.id,
      redirectUri,
      scope: scopes.join(' '),
      nonce,
      codeChallenge: challenge,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  })
  return back({ code })
}
