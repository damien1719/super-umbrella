import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface SectionExample {
  id: string;
  sectionId: string;
  label?: string | null;
  content: string;
}

interface SectionExampleState {
  items: SectionExample[];
  fetchAll: () => Promise<void>;
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
}));
