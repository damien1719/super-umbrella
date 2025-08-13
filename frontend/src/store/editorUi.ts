import { create } from 'zustand';

export type Mode = 'idle' | 'suggest' | 'refine';

export interface SelectionSnapshot {
  rects: DOMRect[];
  text: string;
  htmlFragment: string;
  isCollapsed: boolean;
  restore: () => boolean;
  clear: () => void;
}

interface EditorUiState {
  mode: Mode;
  selection: SelectionSnapshot | null;
  aiBlockId: string | null;
  setMode: (m: Mode) => void;
  setSelection: (s: SelectionSnapshot | null) => void;
  setAiBlockId: (id: string | null) => void;
}

export const useEditorUi = create<EditorUiState>((set) => ({
  mode: 'idle',
  selection: null,
  aiBlockId: null,
  setMode: (m) => set({ mode: m }),
  setSelection: (s) => set({ selection: s }),
  setAiBlockId: (id) => set({ aiBlockId: id }),
}));
