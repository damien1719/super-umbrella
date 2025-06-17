import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface Bien {
  id: string;
  typeBien: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  numeroIdentifiantFiscal: string;
  dpe: string;
  regimeJuridique: string;
  surfaceHabitable: number;
  nombrePieces: number;
  anneeConstruction: number;
  cuisine: string;
  nombreChambres: number;
  nombreSejours: number;
  nombreSallesDEau: number;
  nombreSallesDeBains: number;
  nombreWC: number;
  typeChauffage: string;
  autresTypesChauffage?: string;
  typeEauChaude: string;
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

const BASE_URL = import.meta.env.VITE_API_URL as string;
const ENDPOINT = `${BASE_URL}/api/v1/biens`;

interface BienState {
  items: Bien[];
  fetchAll: () => Promise<void>;
  create: (data: BienInput) => Promise<void>;
  update: (id: string, data: Partial<BienInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBienStore = create<BienState>((set) => ({
  items: [],

  fetchAll: async () => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const items = await apiFetch<Bien[]>(ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items });
  },

  create: async (data) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const payload = clean(data);
    const bien = await apiFetch<Bien>(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    set((state) => ({ items: [...state.items, bien] }));
  },

  update: async (id, data) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const payload = clean(data);
    const bien = await apiFetch<Bien>(`${ENDPOINT}/${id}`, {
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
    if (!token) throw new Error('Non authentifié');
    await apiFetch<void>(`${ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({
      items: state.items.filter((b) => b.id !== id),
    }));
  },
}));
