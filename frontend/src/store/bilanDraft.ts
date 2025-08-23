import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftState {
  descriptionJson: unknown | null;
  setStateJson: (state: unknown | null) => void;
  reset: () => void;
}

export const useBilanDraft = create(
  persist<DraftState>(
    (set) => ({
      descriptionJson: null,
      setStateJson: (state) => set({ descriptionJson: state }),
      reset: () => set({ descriptionJson: null }),
    }),
    { name: 'bilan-draft' },
  ),
);
