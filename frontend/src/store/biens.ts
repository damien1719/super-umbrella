import { create } from 'zustand';

export interface Bien {
  id: string;
  typeBien: string;
  adresse: string;
}

type BienInput = Omit<Bien, 'id'>;

interface BienState {
  items: Bien[];
  fetchAll: () => Promise<void>;
  create: (data: BienInput) => Promise<void>;
  update: (id: string, data: Partial<BienInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const API = '/api/v1/biens';

export const useBienStore = create<BienState>((set) => ({
  items: [],
  fetchAll: async () => {
    const res = await fetch(API, { credentials: 'include' });
    if (!res.ok) return;
    const items = await res.json();
    set({ items });
  },
  create: async (data) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) return;
    const bien = await res.json();
    set((state) => ({ items: [...state.items, bien] }));
  },
  update: async (id, data) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) return;
    const bien = await res.json();
    set((state) => ({
      items: state.items.map((b) => (b.id === id ? bien : b)),
    }));
  },
  remove: async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE', credentials: 'include' });
    set((state) => ({ items: state.items.filter((b) => b.id !== id) }));
  },
}));
