import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface BilanType {
  id: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  authorId?: string | null;
  author?: { prenom?: string | null } | null;
  layoutJson?: unknown;
}

interface BilanTypeState {
  items: BilanType[];
  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<BilanType>;
  create: (data: BilanTypeInput) => Promise<BilanType>;
  remove: (id: string) => Promise<void>;
}

const endpoint = '/api/v1/bilan-types';

export type BilanTypeInput = Omit<BilanType, 'id' | 'author'>;

export const useBilanTypeStore = create<BilanTypeState>((set) => ({
  items: [],

  async fetchAll() {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<BilanType[]>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items });
  },

  async fetchOne(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const bilanType = await apiFetch<BilanType>(`${endpoint}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      items: state.items.some((s) => s.id === id)
        ? state.items.map((s) => (s.id === id ? bilanType : s))
        : [...state.items, bilanType],
    }));
    return bilanType;
  },

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const bilanType = await apiFetch<BilanType>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, bilanType] }));
    return bilanType;
  },

  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: state.items.filter((s) => s.id !== id) }));
  },
}));
