import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  if (process.env.AUTH_PROVIDER === 'fake') {
    req.user = { id: 'demo-user' }
    return next()
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).send('No token')

  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
      audience: 'authenticated',
      issuer: 'supabase'
    })
    req.user = { id: payload.sub }
    console.log("auth success");
    next()
  } catch {
    res.status(401).send('Invalid token')
  }
}
