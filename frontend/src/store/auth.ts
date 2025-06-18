import { create } from 'zustand';
import { auth } from '../lib/auth';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => {
  // initialise user & token depuis la session existante (si l'utilisateur est déjà connecté)
  auth.getSession().then(({ data: { session } }) => {
    set({
      user: session?.user ?? null,
      token: session?.access_token ?? null,
    });
  });

  // écoute les changements d'authentification (p. ex. refresh du token, sign out)
  auth.onAuthStateChange((_event, session) => {
    set({
      user: session?.user ?? null,
      token: session?.access_token ?? null,
    });
  });

  return {
    user: null,
    token: null,
    loading: false,
    error: null,

    initialize: async () => {
      const {
        data: { session },
      } = await auth.getSession();
      set({
        user: session?.user ?? null,
        token: session?.access_token ?? null,
      });
    },

    signIn: async (email, password) => {
      set({ loading: true, error: null });
      const { data, error } = await auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }
      // data.session contient user + access_token
      const session: Session = data.session!;
      set({
        user: session.user,
        token: session.access_token,
        loading: false,
      });
    },

    signUp: async (email, password, firstName, lastName) => {
      set({ loading: true, error: null });
      const { data, error } = await (
        auth as {
          signUp: (params: {
            email: string;
            password: string;
            options?: { data: { firstName: string; lastName: string } };
          }) => Promise<{
            data: { user: User | null; session: Session | null };
            error: { message: string } | null;
          }>;
        }
      ).signUp({
        email,
        password,
        options: { data: { firstName, lastName } },
      });
      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }
      if (data.session) {
        const session: Session = data.session;
        set({
          user: session.user,
          token: session.access_token,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true });
      const { error } = await auth.signOut();
      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }
      set({
        user: null,
        token: null,
        loading: false,
      });
    },
  };
});
