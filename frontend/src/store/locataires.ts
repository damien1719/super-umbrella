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
  current: Locataire | null;
  fetchForBien: (bienId: string) => Promise<Locataire | null>;
  create: (data: NewLocataire) => Promise<Locataire>;
  update: (id: string, data: Partial<NewLocataire>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLocataireStore = create<LocataireState>((set) => ({
  current: null,

  async fetchForBien(bienId) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const locs = await apiFetch<Locataire[]>(
      `/api/v1/locataires/properties/${bienId}/locataires`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const loc = locs[0] ?? null;
    set({ current: loc });
    return loc;
  },

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const loc = await apiFetch<Locataire>('/api/v1/locataires', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set({ current: loc });
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
    set({ current: loc });
  },

  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`/api/v1/locataires/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ current: null });
  },
}));
