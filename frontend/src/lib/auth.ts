import { createAuthProvider as fake } from './auth.fake'
import { createAuthProvider as supabase } from './auth.supabase'

export const auth =
  (import.meta.env.VITE_AUTH_PROVIDER || 'fake') === 'supabase'
    ? supabase()
    : fake()
