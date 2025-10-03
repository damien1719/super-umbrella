import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms
}

interface ToastState {
  toasts: ToastItem[];
  show: (
    message: string,
    opts?: { type?: ToastType; duration?: number },
  ) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, opts) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const item: ToastItem = {
      id,
      message,
      type: opts?.type ?? 'success',
      duration: opts?.duration ?? 2000,
    };
    set((s) => ({ toasts: [...s.toasts, item] }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
