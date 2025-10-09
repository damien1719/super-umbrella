import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseAutosaveOptions<T> {
  data: T;
  enabled: boolean;
  delay?: number;
  save: (data: T) => Promise<unknown> | unknown;
  serialize?: (data: T) => string;
}

interface UseAutosaveReturn<T> {
  markSaved: (data: T) => void;
  saveNow: () => Promise<void>;
  // Ensures latest data is persisted before continuing critical actions
  flush: () => Promise<void>;
  isDirty: boolean;
  isSaving: boolean;
  hasError: boolean;
  lastSavedAt: Date | null;
  statusLabel: string;
  saveOrNotify: () => Promise<void>;
}

const defaultSerialize = <T>(value: T) => JSON.stringify(value ?? {}) ?? '';

export function useAutosave<T>({
  data,
  enabled,
  delay = 1000,
  save,
  serialize = defaultSerialize,
}: UseAutosaveOptions<T>): UseAutosaveReturn<T> {
  const lastSerializedRef = useRef<string>('');
  const inFlightRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const transientRef = useRef<number | null>(null);
  const waitersRef = useRef<Array<() => void>>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [snapshotInitialized, setSnapshotInitialized] = useState(false);
  const [transientLabel, setTransientLabel] = useState<string | null>(null);

  const markSaved = useCallback(
    (payload: T) => {
      lastSerializedRef.current = serialize(payload);
      setSnapshotInitialized(true);
      setIsDirty(false);
    },
    [serialize],
  );

  const performSave = useCallback(
    async (serialized: string, payload: T) => {
      if (!enabled) return;
      // prevent duplicate saves for same snapshot
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setIsSaving(true);
      setHasError(false);
      try {
        console.log("payload", payload);
        await Promise.resolve(save(payload));
        lastSerializedRef.current = serialized;
        setLastSavedAt(new Date());
        setIsDirty(false);
        setSnapshotInitialized(true);
      } catch {
        // Keep dirty state so user can retry
        setHasError(true);
      } finally {
        inFlightRef.current = false;
        setIsSaving(false);
        // resolve any waiters queued to be notified when a save completes
        const waiters = waitersRef.current;
        waitersRef.current = [];
        for (const w of waiters) {
          try {
            w();
          } catch {}
        }
      }
    },
    [enabled, save],
  );

  const saveNow = useCallback(async () => {
    const serialized = serialize(data);
    if (!enabled) return;
    if (serialized === lastSerializedRef.current) {
      setIsDirty(false);
      return;
    }
    await performSave(serialized, data);
  }, [data, enabled, performSave, serialize]);

  // Force immediate persistence of the latest snapshot.
  // Waits for any in-flight save, cancels debounce, then saves if needed.
  const flush = useCallback(async () => {
    if (!enabled) return;
    // cancel pending debounce
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // wait for any ongoing save to complete
    if (inFlightRef.current) {
      await new Promise<void>((resolve) => {
        waitersRef.current.push(resolve);
      });
    }
    const serialized = serialize(data);
    if (serialized !== lastSerializedRef.current) {
      await performSave(serialized, data);
    }
  }, [data, enabled, performSave, serialize]);

  const flash = useCallback((message: string, ms = 1800) => {
    if (transientRef.current) window.clearTimeout(transientRef.current);
    setTransientLabel(message);
    transientRef.current = window.setTimeout(() => {
      setTransientLabel(null);
      transientRef.current = null;
    }, ms);
  }, []);

  const saveOrNotify = useCallback(async () => {
    const serialized = serialize(data);
    const sameAsLast = serialized === lastSerializedRef.current;
    if (!enabled) return;
    if (!snapshotInitialized) {
      flash('Enregistré');
      return;
    }
    if (sameAsLast) {
      flash(
        lastSavedAt
          ? 'Enregistré'
          : 'Enregistré',
      );
      return;
    }
    await performSave(serialized, data);
  }, [
    data,
    enabled,
    flash,
    lastSavedAt,
    performSave,
    serialize,
    snapshotInitialized,
  ]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return;
    }

    const serialized = serialize(data);
    const sameAsLast = serialized === lastSerializedRef.current;
    if (!snapshotInitialized) {
      // Wait for server snapshot (markSaved) before tracking dirtiness
      setIsDirty(false);
      return;
    }

    if (!sameAsLast || inFlightRef.current) {
      setIsDirty(!sameAsLast);
    }
    if (sameAsLast && !inFlightRef.current) {
      return;
    }

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      void performSave(serialized, data);
    }, delay);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [data, enabled, delay, performSave, serialize, snapshotInitialized]);

  const statusLabel = useMemo(() => {
    if (!enabled) return 'Sauvegarde désactivée';
    if (transientLabel) return transientLabel;
    if (!snapshotInitialized) return 'Prêt';
    if (isSaving) return 'Enregistrement en cours…';
    if (hasError) return 'Erreur — Réessayer';
    if (isDirty) return 'Modifications non enregistrées';
    if (lastSavedAt) {
      try {
        const time = lastSavedAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `Enregistré à ${time}`;
      } catch {
        return 'Enregistré';
      }
    }
    return '';
  }, [
    enabled,
    hasError,
    isDirty,
    isSaving,
    lastSavedAt,
    snapshotInitialized,
    transientLabel,
  ]);

  return {
    markSaved,
    saveNow,
    flush,
    isDirty,
    isSaving,
    hasError,
    lastSavedAt,
    statusLabel,
    saveOrNotify,
  };
}

export type { UseAutosaveOptions, UseAutosaveReturn };
