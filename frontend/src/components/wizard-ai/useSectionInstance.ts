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

interface SectionInstanceResult {
  instanceId: string | null;
  isLoading: boolean;
  isSaving: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  }, [sectionId, bilanId]);

  const loadLatest = useCallback(async () => {
    if (!bilanId || !sectionId) return { id: null, answers: {} };

    loadAbortRef.current?.abort();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    setIsLoading(true);

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
        return {
          id: latest.id,
          answers: (latest.contentNotes ?? {}) as Answers,
        };
      }
      setInstanceId(null);
      return { id: null, answers: {} };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      setInstanceId(null);
      throw error;
    } finally {
      if (loadAbortRef.current === controller) {
        loadAbortRef.current = null;
      }
      setIsLoading(false);
    }
  }, [bilanId, sectionId, token]);

  const save = useCallback(
    async (notes: Answers | undefined, options?: SaveOptions) => {
      const targetSectionId = options?.sectionId ?? sectionId;
      if (!bilanId || !targetSectionId) return null;

      saveAbortRef.current?.abort();
      const controller = new AbortController();
      saveAbortRef.current = controller;
      setIsSaving(true);

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

        return result.id;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return null;
        }
        throw error;
      } finally {
        if (saveAbortRef.current === controller) {
          saveAbortRef.current = null;
        }
        setIsSaving(false);
      }
    },
    [bilanId, sectionId, token],
  );

  const resetInstance = useCallback(() => {
    setInstanceId(null);
  }, []);

  return {
    instanceId,
    isLoading,
    isSaving,
    loadLatest,
    save,
    resetInstance,
  };
}

export type { SectionInstanceResult, UseSectionInstanceOptions };
