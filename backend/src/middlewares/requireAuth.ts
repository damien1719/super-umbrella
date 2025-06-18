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
  console.log('\n🔐 === MIDDLEWARE REQUIRE AUTH ===');
  console.log(`🔐 URL: ${req.method} ${req.url}`);
  console.log('🔐 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔐 Body:', req.body);
  console.log('🔐 Params:', req.params);
  console.log('🔐 Query:', req.query);

  if (process.env.AUTH_PROVIDER === 'fake') {
    console.log('🔐 Using fake auth, setting user to demo-user');
    req.user = { id: 'demo-user' }
    console.log('🔐 User set:', req.user);
    next()
    return
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    console.log('❌ No token provided');
    res.status(401).send('No token')
    return
  }

  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET as string, {
      audience: 'authenticated',
    }) as SupabasePayload
    req.user = { id: payload.sub }
    console.log("✅ Auth success for user:", payload.sub);
    console.log('🔐 === FIN REQUIRE AUTH ===\n');
    next()
    return
  } catch (error) {
    console.log('❌ Invalid token:', error);
    res.status(401).send('Invalid token')
    return
  }
}
