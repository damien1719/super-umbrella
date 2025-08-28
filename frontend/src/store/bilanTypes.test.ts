import { vi, describe, it, expect } from 'vitest';
import { useBilanTypeStore } from './bilanTypes';
import { useAuth, type AuthState } from './auth';

vi.stubGlobal('fetch', vi.fn());

describe('useBilanTypeStore', () => {
  it('adds a bilan type with create()', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    useBilanTypeStore.setState({ items: [] });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'BT' }),
    });
    const item = await useBilanTypeStore.getState().create({ name: 'BT' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/bilan-types',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(item.id).toBe('1');
    expect(useBilanTypeStore.getState().items[0].id).toBe('1');
  });
});
