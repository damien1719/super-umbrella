import { vi, describe, it, expect } from 'vitest';
import { useUserProfileStore } from './userProfile';
import { useAuth } from './auth';

vi.stubGlobal('fetch', vi.fn());

describe('useUserProfileStore', () => {
  it('fetches profile with fetchProfile()', async () => {
    useAuth.setState({ token: 'tok' });
    useUserProfileStore.setState({
      profile: null,
      loading: false,
      error: null,
    });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ nom: 'Doe' }),
    });
    await useUserProfileStore.getState().fetchProfile();
    expect(useUserProfileStore.getState().profile?.nom).toBe('Doe');
  });
});
