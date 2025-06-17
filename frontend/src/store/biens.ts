import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';


export interface Bien {
  id: string;
  typeBien: string;
  adresse: string;
}

type BienInput = Omit<Bien, 'id'>;

const API_URL = import.meta.env.VITE_API_URL as string;

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
    const token = useAuth.getState().token;
    console.log('>>> token envoyé :', token);
    if (!token) throw new Error('Non authentifié');
    
    const items = await apiFetch<Bien[]>(API, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    set({ items });
  },

  create: async (data) => {
    const token = useAuth.getState().token;
    console.log('>>> token envoyé :', token);
    if (!token) throw new Error('Non authentifié');

    const bien = await apiFetch<Bien>(API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, bien] }));
  },

  update: async (id, data) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');

    const bien = await apiFetch<Bien>(`${API}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    set((state) => ({
      items: state.items.map((b) => (b.id === id ? bien : b)),
    }));
  },

  remove: async (id) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');

    await apiFetch<void>(`${API}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    set((state) => ({ items: state.items.filter((b) => b.id !== id) }));
  },
}));
