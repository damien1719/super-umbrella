import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSectionInstance } from './useSectionInstance';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const apiFetchMock = vi.fn();

vi.mock('@/utils/api', () => ({
  apiFetch: apiFetchMock,
}));

describe('useSectionInstance', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it('loads the latest instance and updates status', async () => {
    apiFetchMock.mockResolvedValueOnce([
      { id: 'instance-1', contentNotes: { foo: 'bar' } },
    ]);

    const { result } = renderHook(() =>
      useSectionInstance({ bilanId: 'b1', sectionId: 's1', token: 'tok' }),
    );

    expect(result.current.status).toBe('idle');

    await act(async () => {
      const latest = await result.current.loadLatest();
      expect(latest).toEqual({ id: 'instance-1', answers: { foo: 'bar' } });
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      '/api/v1/bilan-section-instances?bilanId=b1&sectionId=s1&latest=true',
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok' },
      }),
    );
    expect(result.current.instanceId).toBe('instance-1');
    expect(result.current.status).toBe('idle');
  });

  it('saves notes and exposes saving status', async () => {
    const deferred = createDeferred<{ id: string }>();
    apiFetchMock.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() =>
      useSectionInstance({ bilanId: 'b1', sectionId: 's1', token: null }),
    );

    await act(async () => {
      const savePromise = result.current.save({ foo: 'bar' });
      expect(result.current.status).toBe('saving');
      deferred.resolve({ id: 'new-instance' });
      const savedId = await savePromise;
      expect(savedId).toBe('new-instance');
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      '/api/v1/bilan-section-instances/upsert',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(result.current.instanceId).toBe('new-instance');
    expect(result.current.status).toBe('idle');
  });

  it('sets status to error when load fails', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() =>
      useSectionInstance({ bilanId: 'b1', sectionId: 's1', token: null }),
    );

    await expect(
      act(async () => {
        await result.current.loadLatest();
      }),
    ).rejects.toThrow('boom');

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
