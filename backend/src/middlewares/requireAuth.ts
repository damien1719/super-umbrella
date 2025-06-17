import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

interface SupabasePayload extends jwt.JwtPayload {
  sub: string
}

export const requireAuth: RequestHandler = (
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
      issuer: 'supabase'
    }) as SupabasePayload
    req.user = { id: payload.sub }
    console.log("auth success");
    next()
    return
  } catch {
    res.status(401).send('Invalid token')
    return
  }
}
