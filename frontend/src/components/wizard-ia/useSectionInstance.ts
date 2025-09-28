import { useCallback, useEffect, useRef, useState } from 'react';

import { apiFetch } from '@/utils/api';
import type { Answers } from '@/types/question';

interface UseSectionInstanceOptions {
  bilanId: string;
  sectionId: string | null | undefined;
  token: string | null | undefined;
}

interface SaveOptions {
  sectionId?: string | null;
}

type SectionInstanceStatus = 'idle' | 'loading' | 'saving' | 'error';

interface SectionInstanceResult {
  instanceId: string | null;
  status: SectionInstanceStatus;
  error: Error | null;
  loadLatest: () => Promise<{ id: string | null; answers: Answers } | null>;
  save: (
    notes: Answers | undefined,
    options?: SaveOptions,
  ) => Promise<string | null>;
  resetInstance: () => void;
}

export function useSectionInstance({
  bilanId,
  sectionId,
  token,
}: UseSectionInstanceOptions): SectionInstanceResult {
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [status, setStatus] = useState<SectionInstanceStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const loadAbortRef = useRef<AbortController | null>(null);
  const saveAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      loadAbortRef.current?.abort();
      saveAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setInstanceId(null);
    setStatus('idle');
    setError(null);
  }, [sectionId, bilanId]);

  const loadLatest = useCallback(async () => {
    if (!bilanId || !sectionId) return { id: null, answers: {} };

    loadAbortRef.current?.abort();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    setStatus('loading');
    setError(null);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await apiFetch<
        Array<{ id: string; contentNotes: Answers | undefined }>
      >(
        `/api/v1/bilan-section-instances?bilanId=${bilanId}&sectionId=${sectionId}&latest=true`,
        {
          headers,
          signal: controller.signal,
        },
      );
      const latest = response[0];
      if (latest) {
        setInstanceId(latest.id);
        setStatus('idle');
        return {
          id: latest.id,
          answers: (latest.contentNotes ?? {}) as Answers,
        };
      }
      setInstanceId(null);
      setStatus('idle');
      return { id: null, answers: {} };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setStatus('idle');
        return null;
      }
      setInstanceId(null);
      setError(error as Error);
      setStatus('error');
      throw error;
    } finally {
      if (loadAbortRef.current === controller) {
        loadAbortRef.current = null;
      }
    }
  }, [bilanId, sectionId, token]);

  const save = useCallback(
    async (notes: Answers | undefined, options?: SaveOptions) => {
      const targetSectionId = options?.sectionId ?? sectionId;
      if (!bilanId || !targetSectionId) return null;

      saveAbortRef.current?.abort();
      const controller = new AbortController();
      saveAbortRef.current = controller;
      setStatus('saving');
      setError(null);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const result = await apiFetch<{ id: string }>(
          `/api/v1/bilan-section-instances/upsert`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              bilanId,
              sectionId: targetSectionId,
              contentNotes: notes,
            }),
            signal: controller.signal,
          },
        );

        if (!options?.sectionId || options.sectionId === sectionId) {
          setInstanceId(result.id);
        }

        setStatus('idle');
        return result.id;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          setStatus('idle');
          return null;
        }
        setError(error as Error);
        setStatus('error');
        throw error;
      } finally {
        console.log("saved");
        console.log("notes", notes);
        if (saveAbortRef.current === controller) {
          saveAbortRef.current = null;
        }
      }
    },
    [bilanId, sectionId, token],
  );

  const resetInstance = useCallback(() => {
    setInstanceId(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    instanceId,
    status,
    error,
    loadLatest,
    save,
    resetInstance,
  };
}

export type {
  SectionInstanceResult,
  SectionInstanceStatus,
  UseSectionInstanceOptions,
};
