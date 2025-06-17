import { create } from 'zustand';
import { auth } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (e: string, p: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialize: async () => {
    const user = await auth.getCurrentUser();
    set({ user, loading: false });
  },
  signIn: async (email, password) => {
    set({ loading: true });
    const user = await auth.signIn(email, password);
    set({ user, loading: false });
  },
  signOut: async () => {
    await auth.signOut();
    set({ user: null });
  },
}));
