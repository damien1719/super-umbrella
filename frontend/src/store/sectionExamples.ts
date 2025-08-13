import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface SectionExample {
  id: string;
  sectionId: string;
  label?: string | null;
  content: string;
  stylePrompt?: string;
}

interface SectionExampleState {
  items: SectionExample[];
  fetchAll: () => Promise<void>;
  create: (data: Omit<SectionExample, 'id'>) => Promise<SectionExample>;
  update: (
    id: string,
    data: Partial<Omit<SectionExample, 'id'>>,
  ) => Promise<SectionExample>;
  remove: (id: string) => Promise<void>;
}

const endpoint = '/api/v1/section-examples';

export const useSectionExampleStore = create<SectionExampleState>((set) => ({
  items: [],
  async fetchAll() {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<SectionExample[]>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items });
  },
  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const item = await apiFetch<SectionExample>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },
  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const item = await apiFetch<SectionExample>(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? item : i)),
    }));
    return item;
  },
  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },
}));
