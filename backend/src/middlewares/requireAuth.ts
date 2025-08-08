import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import { verifyKeycloakToken, verifySupabaseToken, detectProviderFromDecoded } from '../auth/verify'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

type Provider = 'supabase' | 'keycloak'

function isAllowed(p: Provider) {
  const mode = (process.env.AUTH_ACCEPT || 'supabase').toLowerCase()
  return mode === 'both' || mode === p
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next()

  if (process.env.AUTH_PROVIDER === 'fake') {
    req.user = { id: 'demo-user' }
    return next()
  }

  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : undefined
  if (!token) return res.status(401).send('No token')

  try {
    const decoded = jwt.decode(token, { complete: true }) as jwt.Jwt | null
    const hinted = detectProviderFromDecoded(decoded)

    let provider: Provider | undefined
    let payload: Record<string, unknown> = {}

    const tryKeycloak = async () => {
      const v = await verifyKeycloakToken(token)
      provider = 'keycloak'
      payload = v.payload as Record<string, unknown>
    }
    const trySupabase = () => {
      const v = verifySupabaseToken(token)
      provider = 'supabase'
      payload = v.payload as Record<string, unknown>
    }

    if (hinted === 'keycloak' && isAllowed('keycloak')) {
      await tryKeycloak()
    } else if (hinted === 'supabase' && isAllowed('supabase')) {
      trySupabase()
    } else {
      let lastErr: unknown
      if (isAllowed('keycloak')) {
        try { await tryKeycloak() } catch (e) { lastErr = e }
      }
      if (!provider && isAllowed('supabase')) {
        try { trySupabase() } catch (e) { lastErr = e }
      }
      if (!provider) throw lastErr || new Error('No provider matched')
    }

    const providerAccountId = payload['sub'] as string | undefined
    if (!providerAccountId) throw new Error('Missing sub')

    const email =
      (payload['email'] as string | undefined) ??
      ((payload['user_metadata'] as Record<string, unknown> | undefined)?.['email'] as string | undefined) ??
      null

    const firstName =
      (payload['given_name'] as string | undefined) ??
      ((payload['user_metadata'] as Record<string, unknown> | undefined)?.['firstName'] as string | undefined) ??
      null

    const lastName =
      (payload['family_name'] as string | undefined) ??
      ((payload['user_metadata'] as Record<string, unknown> | undefined)?.['lastName'] as string | undefined) ??
      null

    let authAccount = await db.authAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true }
    })

    let user
    if (authAccount) {
      user = authAccount.user
    } else {
      if (email) {
        user = await db.user.findFirst({ where: { profile: { email } } })
      }
      if (!user) {
        user = await db.user.create({ data: {} })
        await db.profile.create({
          data: { userId: user.id, prenom: firstName, nom: lastName, email }
        })
      }
      await db.authAccount.create({
        data: { provider, providerAccountId, email, userId: user.id }
      })
    }

    req.user = { id: user.id }
    return next()
  } catch (e) {
    console.error('JWT error:', e)
    return res.status(401).send('Invalid token')
  }
}
