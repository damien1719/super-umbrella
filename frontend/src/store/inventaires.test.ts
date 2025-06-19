import { describe, it, expect, vi } from 'vitest';
import { useInventaireStore } from './inventaires';
import { useAuth, type AuthState } from './auth';

vi.stubGlobal('fetch', vi.fn());

describe('useInventaireStore', () => {
  it('adds an inventaire with create()', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    useInventaireStore.setState({ items: [] });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '1',
          bienId: 'b1',
          piece: 'Salon',
          mobilier: 'TABLE',
        }),
    });
    await useInventaireStore
      .getState()
      .create({ bienId: 'b1', piece: 'Salon', mobilier: 'TABLE' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/inventaires',
      expect.any(Object),
    );
    expect(useInventaireStore.getState().items).toHaveLength(1);
  });
});
