import { vi, describe, it, expect } from 'vitest';
import { useUserProfileStore } from './userProfile';
import { useAuth } from './auth';

vi.stubGlobal('fetch', vi.fn());

describe('useUserProfileStore', () => {
  it('fetches profile with fetchProfile()', async () => {
    useAuth.setState({ token: 'tok' });
    useUserProfileStore.setState({
      profile: null,
      profileId: null,
      loading: false,
      error: null,
      setProfileId: () => {},
    });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: '123', nom: 'Doe' }]),
    });
    await useUserProfileStore.getState().fetchProfile();
    const state = useUserProfileStore.getState();
    expect(state.profile?.nom).toBe('Doe');
    expect(state.profileId).toBe('123');
  });
});
