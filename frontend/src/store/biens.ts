import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { NewBien, EditBien } from '@monorepo/shared';

export interface Bien {
  id: string;
  typeBien: string;
  adresse: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  numeroIdentifiantFiscal?: string;
  dpe?: string;
  regimeJuridique?: string;
  surfaceHabitable?: number;
  nombrePieces?: number;
  anneeConstruction?: number;
  cuisine?: string;
  nombreChambres?: number;
  nombreSejours?: number;
  nombreSallesDEau?: number;
  nombreSallesDeBains?: number;
  nombreWC?: number;
  typeChauffage?: string;
  autresTypesChauffage?: string;
  typeEauChaude?: string;
  equipementsDivers?: string[];
  equipementsNTIC?: string[];
  autresPieces?: string;
  autresInformationsComplementaires?: string;
}

export type BienInput = Omit<Bien, 'id'>;

/**
 * Supprime les entrées à `undefined` ou `''`
 * pour ne pas envoyer de champs vides au back.
 */
function clean<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null && v !== ''),
  ) as Partial<T>;
}

import { useUserProfileStore } from './userProfile';

//const BASE_URL = import.meta.env.VITE_API_URL as string;
const endpoint = (profileId: string) => `/api/v1/profile/${profileId}/biens`;

interface BienState {
  items: Bien[];
  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<Bien>;
  create: (data: BienInput) => Promise<void>;
  update: (id: string, data: Partial<BienInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBienStore = create<BienState>((set) => ({
  items: [],

  fetchAll: async () => {
    const token = useAuth.getState().token;
    const profileId = useUserProfileStore.getState().profileId;
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    const items = await apiFetch<Bien[]>(endpoint(profileId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items });
  },

  fetchOne: async (id) => {
    const token = useAuth.getState().token;
    const profileId = useUserProfileStore.getState().profileId;
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    const bien = await apiFetch<Bien>(`${endpoint(profileId)}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      items: state.items.some((b) => b.id === id)
        ? state.items.map((b) => (b.id === id ? bien : b))
        : [...state.items, bien],
    }));
    return bien;
  },

  create: async (data: NewBien) => {
    const token = useAuth.getState().token;
    const profileId = useUserProfileStore.getState().profileId;
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    const payload = clean<NewBien>(data);
    const bien = await apiFetch<Bien>(endpoint(profileId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    set((state) => ({ items: [...state.items, bien] }));
  },

  update: async (id, data: EditBien) => {
    const token = useAuth.getState().token;
    const profileId = useUserProfileStore.getState().profileId;
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    const payload = clean<EditBien>(data);
    const bien = await apiFetch<Bien>(`${endpoint(profileId)}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    set((state) => ({
      items: state.items.map((b) => (b.id === id ? bien : b)),
    }));
  },

  remove: async (id) => {
    const token = useAuth.getState().token;
    const profileId = useUserProfileStore.getState().profileId;
    if (!token) throw new Error('Non authentifié');
    if (!profileId) throw new Error('Profil introuvable');
    await apiFetch<void>(`${endpoint(profileId)}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      items: state.items.filter((b) => b.id !== id),
    }));
  },
}));
