import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftState {
  descriptionHtml: string;
  setHtml: (html: string) => void;
  reset: () => void;
}

export const useBilanDraft = create(
  persist<DraftState>(
    (set) => ({
      descriptionHtml: '',
      setHtml: (html) => set({ descriptionHtml: html }),
      reset: () => set({ descriptionHtml: '' }),
    }),
    { name: 'bilan-draft' },
  ),
);
