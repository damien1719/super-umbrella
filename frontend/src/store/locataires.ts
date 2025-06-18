import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { NewLocataire } from '@monorepo/shared';

interface LocataireState {
  create: (data: NewLocataire) => Promise<void>;
}

export const useLocataireStore = create<LocataireState>(() => ({
  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch('/api/v1/locataires', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
}));
