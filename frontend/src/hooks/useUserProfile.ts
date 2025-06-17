import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { UserProfile } from '@monorepo/shared';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UserProfile | null>('/api/user/profile');
      setProfile(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiFetch<UserProfile>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setProfile(updated);
      return updated;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/api/user/profile', { method: 'DELETE' });
      setProfile(null);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    deleteProfile,
  };
}
