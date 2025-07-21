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
    const userId = payload.sub
    req.user = { id: userId }
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        authAccounts: {
          create: {
            provider: 'supabase',
            providerAccountId: userId,
            email: payload.email ?? null,
          },
        },
      },
    })
    next()
    return
  } catch {
    res.status(401).send('Invalid token')
    return
  }
}
