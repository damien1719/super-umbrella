import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { NewLocation } from '@monorepo/shared';

export interface Location {
  id: string;
  baseRent: number;
  depositAmount?: number;
  leaseStartDate: string;
  leaseEndDate?: string;
  bienId?: string;
}

interface LocationState {
  current: Location | null;
  fetchForBien: (bienId: string) => Promise<Location | null>;
  createForBien: (bienId: string, data: NewLocation) => Promise<void>;
  update: (id: string, data: Partial<NewLocation>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  current: null,

  async fetchForBien(bienId) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const loc = await apiFetch<Location | null>(
      `/api/v1/locations/properties/${bienId}/location`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    set({ current: loc });
    return loc;
  },

  async createForBien(bienId, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const loc = await apiFetch<Location>(
      `/api/v1/locations/properties/${bienId}/location`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      },
    );
    set({ current: loc });
  },

  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const loc = await apiFetch<Location>(`/api/v1/locations/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set({ current: loc });
  },

  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`/api/v1/locations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ current: null });
  },
}));
