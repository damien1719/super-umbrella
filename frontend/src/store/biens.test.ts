import { vi, describe, it, expect } from 'vitest';
import { useBienStore } from './biens';

vi.stubGlobal('fetch', vi.fn());

describe('useBienStore', () => {
  it('adds a bien with create()', async () => {
    useBienStore.setState((state) => ({ ...state, items: [] }));
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', typeBien: 'APT', adresse: 'a' }),
    });
    await useBienStore.getState().create({ typeBien: 'APT', adresse: 'a' });
    expect(useBienStore.getState().items).toHaveLength(1);
    expect(useBienStore.getState().items[0].id).toBe('1');
  });
});
