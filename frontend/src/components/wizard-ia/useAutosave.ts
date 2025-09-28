import { useCallback, useEffect, useRef } from 'react';

interface UseAutosaveOptions<T> {
  data: T;
  enabled: boolean;
  delay?: number;
  save: (data: T) => Promise<unknown> | unknown;
  serialize?: (data: T) => string;
}

interface UseAutosaveReturn<T> {
  markSaved: (data: T) => void;
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

  const markSaved = useCallback(
    (payload: T) => {
      lastSerializedRef.current = serialize(payload);
    },
    [serialize],
  );

  useEffect(() => {
    if (!enabled) return;

    const serialized = serialize(data);
    if (serialized === lastSerializedRef.current && !inFlightRef.current) {
      return;
    }

    console.log("useAutosave", data);

    const timeout = window.setTimeout(() => {
      inFlightRef.current = true;
      Promise.resolve(save(data))
        .then(() => {
          lastSerializedRef.current = serialized;
        })
        .catch(() => {
          /* mute autosave errors */
        })
        .finally(() => {
          inFlightRef.current = false;
        });
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [data, enabled, delay, save, serialize]);

  return { markSaved };
}

export type { UseAutosaveOptions, UseAutosaveReturn };
