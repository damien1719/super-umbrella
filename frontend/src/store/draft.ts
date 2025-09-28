import { useMemo } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Answers } from '@/types/question';

export type DraftIdentifier = {
  bilanId: string;
  sectionId: string;
};

type DraftMetadata = {
  answers: Answers;
  dirty: boolean;
  lastSavedHash: string | null;
  version: number | null;
  lastSavedAt: string | null;
};

type DraftActions = {
  applyChange: (answers: Answers) => void;
  hydrate: (initial: Partial<DraftMetadata>) => void;
  markSaved: (params: {
    hash: string;
    version: number;
    savedAt?: string;
  }) => void;
};

export type DraftStore = DraftMetadata & DraftActions;

const stores = new Map<string, StoreApi<DraftStore>>();

const emptyState: DraftMetadata = {
  answers: {},
  dirty: false,
  lastSavedHash: null,
  version: null,
  lastSavedAt: null,
};

function createDraftStore(): StoreApi<DraftStore> {
  return createStore<DraftStore>((set) => ({
    ...emptyState,
    applyChange: (answers) =>
      set((state) => ({
        ...state,
        answers: { ...answers },
        dirty: true,
      })),
    hydrate: (initial) =>
      set((state) => ({
        ...state,
        answers:
          initial.answers !== undefined
            ? { ...initial.answers }
            : state.answers,
        dirty:
          initial.dirty !== undefined
            ? initial.dirty
            : initial.answers !== undefined
              ? false
              : state.dirty,
        lastSavedHash:
          initial.lastSavedHash !== undefined
            ? initial.lastSavedHash
            : state.lastSavedHash,
        version:
          initial.version !== undefined ? initial.version : state.version,
        lastSavedAt:
          initial.lastSavedAt !== undefined
            ? initial.lastSavedAt
            : state.lastSavedAt,
      })),
    markSaved: ({ hash, version, savedAt }) =>
      set((state) => ({
        ...state,
        dirty: false,
        lastSavedHash: hash,
        version,
        lastSavedAt: savedAt ?? new Date().toISOString(),
      })),
  }));
}

function keyOf(identifier: DraftIdentifier): string {
  return `${identifier.bilanId}::${identifier.sectionId}`;
}

export function getDraftStore(
  identifier: DraftIdentifier,
): StoreApi<DraftStore> {
  const key = keyOf(identifier);
  let store = stores.get(key);
  if (!store) {
    store = createDraftStore();
    stores.set(key, store);
  }
  return store;
}

export function useDraftStore<T>(
  identifier: DraftIdentifier,
  selector: (state: DraftStore) => T,
): T {
  const store = useMemo(
    () => getDraftStore(identifier),
    [identifier.bilanId, identifier.sectionId],
  );
  return useStore(store, selector);
}

export function resetDraftStores(): void {
  stores.forEach((store) => {
    const { applyChange, hydrate, markSaved } = store.getState();
    store.setState(
      {
        ...emptyState,
        applyChange,
        hydrate,
        markSaved,
      },
      true,
    );
  });
  stores.clear();
}
