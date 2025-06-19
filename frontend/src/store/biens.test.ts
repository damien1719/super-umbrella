import { vi, describe, it, expect } from 'vitest';
import { useBienStore } from './biens';
import { useAuth, type AuthState } from './auth';
import { useUserProfileStore, type UserProfileState } from './userProfile';

vi.stubGlobal('fetch', vi.fn());

describe('useBienStore', () => {
  it('adds a bien with create()', async () => {
    useAuth.setState((state) => ({ ...state, token: 'tok' }) as AuthState);
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'p1' }) as UserProfileState,
    );
    useBienStore.setState((state) => ({ ...state, items: [] }));
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', typeBien: 'APT', adresse: 'a' }),
    });
    await useBienStore.getState().create({ typeBien: 'APT', adresse: 'a' });
    expect((fetch as unknown as vi.Mock).mock.calls[0][0]).toBe(
      '/api/v1/profile/p1/biens',
    );
    expect(useBienStore.getState().items).toHaveLength(1);
    expect(useBienStore.getState().items[0].id).toBe('1');
  });

  it('fetches a bien with fetchOne()', async () => {
    useAuth.setState((state) => ({ ...state, token: 'tok' }) as AuthState);
    useUserProfileStore.setState(
      (state) => ({ ...state, profileId: 'p1' }) as UserProfileState,
    );
    useBienStore.setState((state) => ({ ...state, items: [] }));
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', typeBien: 'APT', adresse: 'a' }),
    });
    const bien = await useBienStore.getState().fetchOne('1');
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/profile/p1/biens/1',
      expect.any(Object),
    );
    expect(bien.id).toBe('1');
    expect(useBienStore.getState().items[0].id).toBe('1');
  });
});
