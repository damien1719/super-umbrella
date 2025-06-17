import { createAuthProvider as fake } from './auth.fake';
import { createAuthProvider as supabase } from './auth.supabase';

console.log('AUTH PROVIDER =', import.meta.env.VITE_AUTH_PROVIDER);

export const auth =
  (import.meta.env.VITE_AUTH_PROVIDER || 'fake') === 'supabase'
    ? supabase()
    : fake();
