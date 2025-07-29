import { describe, it, expect, vi } from 'vitest';
import { useSectionExampleStore } from './sectionExamples';
import { useAuth, type AuthState } from './auth';

vi.stubGlobal('fetch', vi.fn());

describe('useSectionExampleStore', () => {
  it('creates a section example with create()', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    useSectionExampleStore.setState({ items: [] });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '1',
          sectionId: 's1',
          label: 'ex',
          content: 'c',
        }),
    });
    await useSectionExampleStore
      .getState()
      .create({ sectionId: 's1', label: 'ex', content: 'c' });
    expect((fetch as unknown as vi.Mock).mock.calls[0][0]).toBe(
      '/api/v1/section-examples',
    );
    expect(useSectionExampleStore.getState().items[0].id).toBe('1');
  });

  it('removes a section example with remove()', async () => {
    useAuth.setState((s) => ({ ...s, token: 'tok' }) as AuthState);
    useSectionExampleStore.setState({
      items: [{ id: '1', sectionId: 's1', label: 'ex', content: 'c' }],
    });
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    await useSectionExampleStore.getState().remove('1');
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/section-examples/1',
      expect.any(Object),
    );
    expect(useSectionExampleStore.getState().items).toHaveLength(0);
  });
});
