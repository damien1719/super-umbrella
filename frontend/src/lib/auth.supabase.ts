import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export function createAuthProvider() {
  return {
    getCurrentUser: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    getSession: () => supabase.auth.getSession(),
    onAuthStateChange: (
      callback: (event: string, session: Session | null) => void,
    ) => supabase.auth.onAuthStateChange(callback),
    signIn: (email: string, password: string) =>
      supabase.auth
        .signInWithPassword({ email, password })
        .then(({ data, error }) => {
          if (error) throw error;
          return data.user;
        }),
    signOut: () => supabase.auth.signOut(),
    signInWithPassword: (credentials: { email: string; password: string }) =>
      supabase.auth.signInWithPassword(credentials),
    signUp: (params: {
      email: string;
      password: string;
      options?: { data: { firstName: string; lastName: string } };
    }) => supabase.auth.signUp(params),
  };
}
