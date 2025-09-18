import { create } from 'zustand';
import type { Question } from '@/types/Typequestion';

type ClipboardState = {
  item: Question | null;
  copy: (q: Question) => void;
  clear: () => void;
};

/**
 * Presse-papiers interne pour la réutilisation de questions / tableaux.
 * Persistant en mémoire (SPA) pour pouvoir copier dans une trame et coller dans une autre.
 */
export const useClipboardStore = create<ClipboardState>((set) => ({
  item: null,
  copy: (q) => {
    // Deep clone to avoid accidental mutation via references
    const cloned = JSON.parse(JSON.stringify(q)) as Question;
    set({ item: cloned });
  },
  clear: () => set({ item: null }),
}));
