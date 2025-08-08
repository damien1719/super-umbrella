// src/lib/auth.ts
const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'fake').toLowerCase();
console.log('AUTH PROVIDER =', provider);

let authImpl: any;
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

export const auth = authImpl;
