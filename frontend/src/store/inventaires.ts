import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { NewInventaire } from '@monorepo/shared';

export interface Inventaire {
  id: string;
  bienId: string;
  piece: string;
  mobilier: string;
  quantite?: number;
  marque?: string;
  etatEntree?: string;
}

interface InventaireState {
  items: Inventaire[];
  fetchForBien: (bienId: string) => Promise<void>;
  create: (data: NewInventaire) => Promise<void>;
  update: (id: string, data: Partial<NewInventaire>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useInventaireStore = create<InventaireState>((set) => ({
  items: [],

  async fetchForBien(bienId) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<Inventaire[]>(
      `/api/v1/inventaires?bienId=${bienId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    set({ items });
  },

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const inv = await apiFetch<Inventaire>('/api/v1/inventaires', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, inv] }));
  },

  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const inv = await apiFetch<Inventaire>(`/api/v1/inventaires/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? inv : i)),
    }));
  },

  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`/api/v1/inventaires/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },
}));
