// src/middleware/requireAuth.ts
import { RequestHandler } from 'express'
import { prisma } from '../prisma'
import { verifyKeycloakToken, verifySupabaseToken } from '../auth/verify'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

type Provider = 'supabase' | 'keycloak'

interface BasePayload {
  email?: string
  sub?: string
  [key: string]: unknown
}

interface SupabasePayload extends BasePayload {
  user_metadata?: {
    firstName?: string
    lastName?: string
  }
}

interface KeycloakPayload extends BasePayload {
  preferred_username?: string
  given_name?: string
  family_name?: string
}

type TokenPayload = SupabasePayload | KeycloakPayload

function getProfileFieldsFromPayload(payload: TokenPayload, provider: Provider) {
  if (provider === 'supabase') {
    const p = payload as SupabasePayload
    return {
      email: p.email ?? null,
      prenom: p.user_metadata?.firstName ?? null,
      nom: p.user_metadata?.lastName ?? null,
    }
  }
  const p = payload as KeycloakPayload
  return {
    email: p.email ?? p.preferred_username ?? null,
    prenom: p.given_name ?? null,
    nom: p.family_name ?? null,
  }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next()

  const authProvider = process.env.AUTH_PROVIDER
  if (authProvider === 'fake') {
    req.user = { id: 'demo-user' }
    return next()
  }

  const provider: Provider =
    authProvider === 'keycloak' ? 'keycloak' : 'supabase'

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).send('No token')
    return
  }

  try {
    let payload: TokenPayload

    if (provider === 'supabase') {
      const verified = verifySupabaseToken(token) // HS256 + aud=authenticated
      payload = verified.payload as TokenPayload
    } else {
      const verified = await verifyKeycloakToken(token) // RS256 + iss/aud check
      payload = verified.payload as TokenPayload
    }

    const providerAccountId = payload.sub as string | undefined
    if (!providerAccountId) {
      res.status(401).send('Invalid token (no sub)')
      return
    }

    // 1) Cherche un AuthAccount existant
    let authAccount = await db.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    })

    let user
    if (authAccount) {
      user = authAccount.user
    } else {
      // 2) Crée l'utilisateur + le compte d’auth
      const profileFields = getProfileFieldsFromPayload(payload, provider)

      user = await db.user.create({
        data: {
          authAccounts: {
            create: {
              provider,
              providerAccountId,
              email: profileFields.email,
            },
          },
        },
      })

      // 3) Crée le profil automatiquement
      await db.profile.create({
        data: {
          userId: user.id,
          prenom: profileFields.prenom,
          nom: profileFields.nom,
          email: profileFields.email,
        },
      })
    }

    req.user = { id: user.id }
    next()
  } catch (e) {
    console.error('JWT verify error:', e)
    res.status(401).send('Invalid token')
  }
}
