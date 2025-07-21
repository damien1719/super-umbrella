import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

interface SupabasePayload extends jwt.JwtPayload {
  sub: string
  email?: string
}

export const requireAuth: RequestHandler = async (
  req,
  res,
  next
) => {
  if (process.env.AUTH_PROVIDER === 'fake') {
    req.user = { id: 'demo-user' }
    next()
    return
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).send('No token')
    return
  }

  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET as string, {
      audience: 'authenticated',
    }) as SupabasePayload
    const provider = 'supabase'
    const providerAccountId = payload.sub

    // Cherche un AuthAccount existant
    let authAccount = await prisma.authAccount.findUnique({
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
      // Crée un User interne et un AuthAccount lié
      user = await prisma.user.create({
        data: {
          authAccounts: {
            create: {
              provider,
              providerAccountId,
              email: payload.email ?? null,
            },
          },
        },
      });
        // ===> Ajoute ce bloc pour créer le profil automatiquement
      await prisma.profile.create({
        data: {
          userId: user.id,
          prenom: payload.user_metadata?.firstName ?? null, // si tu as ces infos dans le JWT
          nom: payload.user_metadata?.lastName ?? null,
          email: payload.email ?? null,
          // ... autres champs par défaut si besoin
        },
      });
    }

    req.user = { id: user.id }
    next()
    return
  } catch (e) {
    console.error('JWT error:', e)
    res.status(401).send('Invalid token')
    return
  }
}
