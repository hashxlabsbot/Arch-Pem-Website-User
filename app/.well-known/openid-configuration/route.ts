import { NextResponse } from 'next/server'
import { issuer, SUPPORTED_SCOPES } from '@/lib/oidc'

export const dynamic = 'force-dynamic'

export function GET() {
  const iss = issuer()
  return NextResponse.json(
    {
      issuer: iss,
      authorization_endpoint: `${iss}/oauth/authorize`,
      token_endpoint: `${iss}/oauth/token`,
      userinfo_endpoint: `${iss}/oauth/userinfo`,
      jwks_uri: `${iss}/oauth/jwks`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: SUPPORTED_SCOPES,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      code_challenge_methods_supported: ['S256'],
      authorization_response_iss_parameter_supported: true,
      claims_supported: ['sub', 'email', 'email_verified', 'name', 'arcpem_account', 'arcpem_web'],
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  )
}
