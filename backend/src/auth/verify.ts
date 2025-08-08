// src/auth/verify.ts
import * as jose from 'jose'
import jwt from 'jsonwebtoken'

function buildJwksUrl() {
  const issuer = process.env.KEYCLOAK_ISSUER
  const explicit = process.env.KEYCLOAK_JWKS_URL
  if (explicit) return explicit
  if (!issuer) throw new Error('Missing KEYCLOAK_ISSUER or KEYCLOAK_JWKS_URL')
  // supprime le / final éventuel
  const normalized = issuer.replace(/\/+$/, '')
  return `${normalized}/protocol/openid-connect/certs`
}

// Lazy init du JWKS (évite l’exécution au import)
let _jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null
function getJwks() {
  if (!_jwks) {
    const url = new URL(buildJwksUrl())
    _jwks = jose.createRemoteJWKSet(url)
  }
  return _jwks
}

export async function verifyKeycloakToken(token: string) {
  const ISSUER = process.env.KEYCLOAK_ISSUER
  const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
  if (!ISSUER || !CLIENT_ID) {
    throw new Error('Missing KEYCLOAK_ISSUER or KEYCLOAK_CLIENT_ID')
  }

  const allowedAudiences = [
    process.env.KEYCLOAK_CLIENT_ID, // plume-web
    'account',                      // audience par défaut de Keycloak
  ].filter(Boolean) as string[]

  const { payload, protectedHeader } = await jose.jwtVerify(token, getJwks(), {
    issuer: ISSUER,
    audience: allowedAudiences,
    algorithms: ['RS256'],
    clockTolerance: '60s',
  })
  return { payload, header: protectedHeader }
}

export function verifySupabaseToken(token: string) {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('Missing SUPABASE_JWT_SECRET')
  const payload = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    audience: 'authenticated',
  }) as jwt.JwtPayload
  return { payload, header: { alg: 'HS256' } }
}
