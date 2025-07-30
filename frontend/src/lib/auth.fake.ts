import type { User, Session } from '@supabase/supabase-js';

export function createAuthProvider() {
  const user: User = {
    id: 'demo-user',
    email: 'demo@local',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const session: Session = {
    access_token: 'fake-token',
    refresh_token: 'fake-refresh-token',
    user,
    expires_at: Date.now() + 3600 * 1000,
    expires_in: 3600,
    token_type: 'bearer',
  };

  console.log('here');
  console.log(user);

  return {
    getCurrentUser: async () => user,
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (
      callback: (event: string, session: Session | null) => void,
    ) => {
      // Simuler un changement d'état immédiat
      callback('SIGNED_IN', session);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signIn: async (email: string, password: string) => {
      if (email === 'demo@local' && password === 'demo') {
        return user;
      }
      throw new Error('Identifiants invalides');
    },
    signInWithPassword: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      if (email && password) {
        return {
          data: { user, session },
          error: null,
        } as { data: { user: User; session: Session }; error: null };
      }
      return {
        data: { user: null, session: null },
        error: { message: 'invalid' },
      } as { data: { user: null; session: null }; error: { message: string } };
    },
    signUp: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      if (email && password) {
        return {
          data: { user, session },
          error: null,
        } as { data: { user: User; session: Session }; error: null };
      }
      return {
        data: { user: null, session: null },
        error: { message: 'invalid' },
      } as { data: { user: null; session: null }; error: { message: string } };
    },
    signOut: async () => {
      return { error: null };
    },
  };
}
