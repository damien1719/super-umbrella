import * as jose from 'jose'
import jwt from 'jsonwebtoken'

const ISSUER = process.env.KEYCLOAK_ISSUER
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
const JWKS_URL = process.env.KEYCLOAK_JWKS_URL || (ISSUER ? `${ISSUER}/protocol/openid-connect/certs` : undefined)

if (!ISSUER) {
  console.warn('[auth] KEYCLOAK_ISSUER non défini (ok si AUTH_ACCEPT=supabase)')
}
if (!CLIENT_ID) {
  console.warn('[auth] KEYCLOAK_CLIENT_ID non défini (ok si AUTH_ACCEPT=supabase)')
}

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | undefined
if (JWKS_URL) {
  jwks = jose.createRemoteJWKSet(new URL(JWKS_URL))
}

export async function verifyKeycloakToken(token: string) {
  if (!jwks || !ISSUER || !CLIENT_ID) {
    throw new Error('Keycloak env not configured')
  }
  const { payload, protectedHeader } = await jose.jwtVerify(token, jwks, {
    issuer: ISSUER,
    audience: CLIENT_ID,
    algorithms: ['RS256'],
    clockTolerance: '60s',
  })
  return { payload, header: protectedHeader }
}

export function verifySupabaseToken(token: string) {
  const secret = process.env.SUPABASE_JWT_SECRET as string | undefined
  if (!secret) throw new Error('SUPABASE_JWT_SECRET missing')
  const payload = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    audience: 'authenticated',
  }) as jwt.JwtPayload
  return { payload, header: { alg: 'HS256' as const } }
}

export function detectProviderFromDecoded(decoded: jwt.Jwt | null) {
  const payload = decoded?.payload as Record<string, unknown> | undefined
  const iss = typeof payload?.iss === 'string' ? payload.iss : undefined
  const aud = payload?.aud
  if (ISSUER && typeof iss === 'string' && iss.startsWith(ISSUER)) return 'keycloak'
  if (aud === 'authenticated') return 'supabase'
  return undefined
}
