import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { UserProfile, UserProfiles } from '@monorepo/shared';

interface UserProfileState {
  profile: UserProfile | null;
  /** Identifiant du profil pour les appels PATCH/DELETE */
  profileId: string | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  deleteProfile: () => Promise<void>;
  setProfileId: (id: string | null) => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: null,
  profileId: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    const { token } = useAuth.getState();
    if (!token) throw new Error('Non authentifié');
    set({ loading: true, error: null });
    try {
      const profiles = await apiFetch<UserProfiles | null>(`/api/v1/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const firstProfile = profiles?.[0] ?? null;
      console.log("firstProfile", firstProfile);
      set({ profile: firstProfile, profileId: firstProfile?.id ?? null, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  updateProfile: async (data) => {
    const { token } = useAuth.getState();
    const { profileId } = get();
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    set({ loading: true, error: null });
    try {
      console.log(
        '🔶 updateProfile payload before send:',
        JSON.stringify(data),
      );
      const updated = await apiFetch<UserProfile>(
        `/api/v1/profile/${profileId}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        },
      );
      set({
        profile: updated,
        profileId: updated.id ?? profileId,
        loading: false,
      });
      return updated;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  deleteProfile: async () => {
    const { token } = useAuth.getState();
    const { profileId } = get();
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    set({ loading: true, error: null });
    try {
      await apiFetch(`/api/v1/profile/${profileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ profile: null, profileId: null, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  setProfileId: (id) => set({ profileId: id }),
}));
