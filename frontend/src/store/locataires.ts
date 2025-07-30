import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { NewLocataire } from '@monorepo/shared';

export interface Locataire {
  id: string;
  prenom: string;
  nom: string;
  profession?: string;
  emailSecondaire?: string;
  telephone?: string;
  mobile?: string;
  bienId?: string;
  locationId?: string;
}

interface LocataireState {
  items: Locataire[];
  fetchForBien: (bienId: string) => Promise<void>;
  fetchForLocation: (locationId: string) => Promise<void>;
  create: (data: NewLocataire) => Promise<Locataire>;
  update: (id: string, data: Partial<NewLocataire>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLocataireStore = create<LocataireState>((set) => ({
  items: [],

  async fetchForBien(bienId) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<Locataire[]>(
      `/api/v1/locataires?bienId=${bienId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    set({ items });
  },

  async fetchForLocation(locationId) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<Locataire[]>(
      `/api/v1/locataires?locationId=${locationId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    set({ items });
  },

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const loc = await apiFetch<Locataire>('/api/v1/locataires', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, loc] }));
    return loc;
  },

  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const loc = await apiFetch<Locataire>(`/api/v1/locataires/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({
      items: state.items.map((l) => (l.id === id ? loc : l)),
    }));
  },

  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`/api/v1/locataires/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: state.items.filter((l) => l.id !== id) }));
  },
}));
