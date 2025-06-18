import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { UserProfile } from '@monorepo/shared';

interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  deleteProfile: () => Promise<void>;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    set({ loading: true, error: null });
    try {
      const profile = await apiFetch<UserProfile | null>('/api/v1/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ profile, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  updateProfile: async (data) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    set({ loading: true, error: null });
    try {
      const updated = await apiFetch<UserProfile>('/api/v1/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      set({ profile: updated, loading: false });
      return updated;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  deleteProfile: async () => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    set({ loading: true, error: null });
    try {
      await apiFetch('/api/v1/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ profile: null, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
}));
