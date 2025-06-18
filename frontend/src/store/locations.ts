import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { NewLocation } from '@monorepo/shared';

interface LocationState {
  createForBien: (bienId: string, data: NewLocation) => Promise<void>;
}

export const useLocationStore = create<LocationState>(() => ({
  async createForBien(bienId, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch(`/api/v1/locations/properties/${bienId}/location`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
}));
