/**
 * arcpem.com as an OpenID Connect provider for ARC PEM Web (app.arcpem.com): firm owners sign in to the web app
 * with their ARC PEM account. Authorization-code flow only, PKCE (S256) required, one registered confidential
 * client (the web app). Endpoints: /.well-known/openid-configuration, /oauth/{authorize,token,userinfo,jwks}.
 *
 * Tokens are RS256 JWTs signed with OIDC_PRIVATE_KEY. The ID token carries the claims in ownerClaims(), which is the
 * web app's contract (ARCPEM-Web src/lib/accounts/contract.ts).
 */
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
  timingSafeEqual,
  verify,
  type KeyObject,
} from 'crypto'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { env, isProd } from '@/lib/env'
import { logger } from '@/lib/logger'
import { subscriptionState } from '@/lib/web-app'

export const SUPPORTED_SCOPES = ['openid', 'email', 'profile', 'arcpem.web']
export const CODE_TTL_MS = 60_000
export const TOKEN_TTL_S = 300

/**
 * A 503 in the OAuth error format when this site isn't set up as the web app's sign-in provider (client id, client
 * secret or, in production, the signing key is missing), otherwise null. Lets the four /oauth routes fail cleanly on
 * their own instead of throwing, and never affects owner sign-in to the site.
 */
export function oidcUnavailable(): NextResponse | null {
  if (env.oidcClientId() && env.oidcClientSecret() && (!isProd || env.oidcPrivateKey())) return null
  logger.error('oauth: sign-in provider is not configured (OIDC_CLIENT_ID / OIDC_CLIENT_SECRET / OIDC_PRIVATE_KEY)')
  return NextResponse.json(
    { error: 'temporarily_unavailable', error_description: 'Sign-in to ARC PEM is not available right now.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  )
}

export const issuer = () => env.nextAuthUrl().replace(/\/$/, '')

type SigningKey = { privateKey: KeyObject; kid: string; jwk: Record<string, unknown> }
const globalForOidc = globalThis as unknown as { __oidcDevKey?: KeyObject; __oidcKey?: SigningKey }

function signingKey(): SigningKey {
  if (globalForOidc.__oidcKey) return globalForOidc.__oidcKey
  const pem = env.oidcPrivateKey()?.replace(/\\n/g, '\n')
  let privateKey: KeyObject
  if (pem) {
    privateKey = createPrivateKey(pem)
  } else {
    if (isProd) throw new Error('[oidc] OIDC_PRIVATE_KEY is required in production')
    // Development only: a throwaway key for this process; sign-ins made with it end when the server restarts.
    privateKey = globalForOidc.__oidcDevKey ??= generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey
  }
  const pub = createPublicKey(privateKey).export({ format: 'jwk' }) as Record<string, unknown>
  const kid = createHash('sha256').update(`${pub.n}.${pub.e}`).digest('base64url').slice(0, 16)
  globalForOidc.__oidcKey = { privateKey, kid, jwk: { ...pub, kid, use: 'sig', alg: 'RS256' } }
  return globalForOidc.__oidcKey
}

export const jwks = () => ({ keys: [signingKey().jwk] })

const b64 = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url')

export function signJwt(payload: Record<string, unknown>) {
  const key = signingKey()
  const input = `${b64({ alg: 'RS256', typ: 'JWT', kid: key.kid })}.${b64(payload)}`
  return `${input}.${sign('sha256', Buffer.from(input), key.privateKey).toString('base64url')}`
}

/** Verifies a token this provider issued (signature, issuer, audience, expiry). */
export function verifyJwt(token: string, audience: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [head, body, signature] = parts
  try {
    const header = JSON.parse(Buffer.from(head, 'base64url').toString())
    if (header.alg !== 'RS256') return null
    const ok = verify(
      'sha256',
      Buffer.from(`${head}.${body}`),
      createPublicKey(signingKey().privateKey),
      Buffer.from(signature, 'base64url'),
    )
    if (!ok) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.iss !== issuer() || payload.aud !== audience) return null
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export type OidcClient = { id: string; redirectUris: string[] }

/** The one registered client (the web app), if `clientId` is it and it is configured. */
export function findClient(clientId: string | null | undefined): OidcClient | null {
  const id = env.oidcClientId()
  if (!id || !env.oidcClientSecret() || clientId !== id) return null
  const configured = env.oidcRedirectUris() ?? (env.webAppUrl() ? `${env.webAppUrl()}/api/auth/callback/arcpem` : '')
  const redirectUris = configured.split(',').map((u) => u.trim()).filter(Boolean)
  return { id, redirectUris }
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** client_secret_basic or client_secret_post. */
export function authenticateClient(authorization: string | null, form: URLSearchParams): OidcClient | null {
  let id = form.get('client_id')
  let secret = form.get('client_secret')
  if (authorization?.startsWith('Basic ')) {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString()
    const sep = decoded.indexOf(':')
    if (sep < 0) return null
    id = decodeURIComponent(decoded.slice(0, sep))
    secret = decodeURIComponent(decoded.slice(sep + 1))
  }
  const client = findClient(id)
  const expected = env.oidcClientSecret()
  if (!client || !secret || !expected || !safeEqual(secret, expected)) return null
  return client
}

export const hashCode = (code: string) => createHash('sha256').update(code).digest('hex')

/** PKCE S256: BASE64URL(SHA256(verifier)) must equal the challenge sent to /authorize. */
export function pkceMatches(verifier: string | null, challenge: string) {
  if (!verifier || !/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) return false
  return safeEqual(createHash('sha256').update(verifier).digest('base64url'), challenge)
}

/**
 * Who this person is to the web app, read fresh at every token request. `arcpem_web` is null until they have bought
 * a web plan; the web app then explains that instead of signing them in. Suspended or missing accounts get nothing.
 */
export async function ownerClaims(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { webSubscription: { include: { plan: true } }, billingProfile: { select: { legalName: true } } },
  })
  if (!user || user.status !== 'ACTIVE') return null
  const sub = user.webSubscription
  return {
    sub: user.id,
    email: user.email.toLowerCase(),
    // Accounts here are created only after an emailed OTP, through Google (verified addresses only), or by staff.
    email_verified: true,
    name: user.name,
    arcpem_account: { id: user.id, name: sub?.firmName ?? user.billingProfile?.legalName ?? user.name },
    arcpem_web: sub?.plan.tier ? subscriptionState(sub) : null,
  }
}
