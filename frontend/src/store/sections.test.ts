import { vi, describe, it, expect } from 'vitest';
import { useSectionStore } from './sections';
import { useAuth, type AuthState } from './auth';

vi.stubGlobal('fetch', vi.fn());

describe('useSectionStore', () => {
  it('adds a section with create()', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    useSectionStore.setState({ items: [] });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', title: 'Sec', kind: 'anamnese' }),
    });
    const section = await useSectionStore.getState().create({
      title: 'Sec',
      kind: 'anamnese',
    });
    expect((fetch as unknown as vi.Mock).mock.calls[0][0]).toBe(
      '/api/v1/sections',
    );
    expect(section.id).toBe('1');
    expect(useSectionStore.getState().items[0].id).toBe('1');
  });
});
