import { create } from 'zustand';
import { auth } from '../lib/auth';
import { apiFetch } from '../utils/api';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  token: string | null;
  session: Session | null;
  loading: boolean;
  /** indicates whether the initial session check is in progress */
  initialized: boolean;
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
      session: session ?? null,
      loading: false,
      initialized: true,
    });
  });

  // écoute les changements d'authentification (p. ex. refresh du token, sign out)
  auth.onAuthStateChange((_event, session) => {
    set({
      user: session?.user ?? null,
      token: session?.access_token ?? null,
      session: session ?? null,
      initialized: true,
    });
  });

  return {
    user: null,
    token: null,
    session: null,
    loading: true,
    initialized: false,
    error: null,

    initialize: async () => {
      set({ loading: true });
      const {
        data: { session },
      } = await auth.getSession();
      set({
        user: session?.user ?? null,
        token: session?.access_token ?? null,
        session: session ?? null,
        loading: false,
        initialized: true,
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
        session,
        loading: false,
        initialized: true,
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
      console.log({ data, error });
      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }
      if (data.session) {
        const session: Session = data.session;
        set({
          user: session.user,
          token: session.access_token,
          session,
          loading: false,
          initialized: true,
        });

        // Création du profil après l'inscription
        try {
          await apiFetch('/api/v1/profile/', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${session.access_token}` 
            }
          });
        } catch (e) {
          console.error('Erreur lors de la création du profil:', e);
          // Ne pas bloquer le flux en cas d'échec
        }
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
        session: null,
        loading: false,
        initialized: true,
      });
    },
  };
});
