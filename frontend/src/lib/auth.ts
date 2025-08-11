// src/lib/auth.ts
import type { Session } from '@supabase/supabase-js';

type AuthProvider = {
  getCurrentUser?: () => Promise<unknown>;
  getSession: () => Promise<{ data: { session: Session | null } }>;
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void,
  ) => { data: { subscription: { unsubscribe: () => void } } };
  signIn: (...args: any[]) => Promise<any>;
  signOut: () => Promise<any>;
  signInWithPassword?: (args: any) => Promise<any>;
  signUp?: (...args: any[]) => Promise<any>;
};

const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'fake').toLowerCase();
console.log('AUTH PROVIDER =', provider);

let authImpl: AuthProvider;
if (provider === 'keycloak') {
  const m = await import('./auth.keycloak');
  authImpl = m.createAuthProvider();
} else if (provider === 'supabase') {
  const m = await import('./auth.supabase');
  authImpl = m.createAuthProvider();
} else {
  const m = await import('./auth.fake');
  authImpl = m.createAuthProvider();
}

export const auth: AuthProvider = authImpl;
