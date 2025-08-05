import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface Section {
  id: string;
  title: string;
  kind: string;
  description?: string | null;
  schema?: unknown;
  defaultContent?: unknown;
  isPublic?: boolean;
  author?: { prenom?: string | null } | null;
}

export type SectionInput = Omit<Section, 'id' | 'author'>;

interface SectionState {
  items: Section[];
  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<Section>;
  create: (data: SectionInput) => Promise<Section>;
  update: (id: string, data: Partial<SectionInput>) => Promise<Section>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<Section>;
}

const endpoint = '/api/v1/sections';

export const useSectionStore = create<SectionState>((set) => ({
  items: [],

  async fetchAll() {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<Section[]>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items });
  },

  async fetchOne(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const section = await apiFetch<Section>(`${endpoint}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      items: state.items.some((s) => s.id === id)
        ? state.items.map((s) => (s.id === id ? section : s))
        : [...state.items, section],
    }));
    return section;
  },

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const section = await apiFetch<Section>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, section] }));
    return section;
  },

  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const section = await apiFetch<Section>(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({
      items: state.items.map((s) => (s.id === id ? section : s)),
    }));
    return section;
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

  async duplicate(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const section = await apiFetch<Section>(`${endpoint}/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: [...state.items, section] }));
    return section;
  },
}));
