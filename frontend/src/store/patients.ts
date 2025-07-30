import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  notes?: string;
}

export type PatientInput = Omit<Patient, 'id'>;

interface PatientState {
  items: Patient[];
  fetchAll: () => Promise<void>;
  create: (data: PatientInput) => Promise<Patient>;
  update: (id: string, data: Partial<PatientInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  items: [],

  async fetchAll() {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifi\u00e9');
    const items = await apiFetch<Patient[]>('/api/v1/patients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items });
  },

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifi\u00e9');
    const patient = await apiFetch<Patient>('/api/v1/patients', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({ items: [...state.items, patient] }));
    return patient;
  },

  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifi\u00e9');
    const patient = await apiFetch<Patient>(`/api/v1/patients/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    set((state) => ({
      items: state.items.map((p) => (p.id === id ? patient : p)),
    }));
  },

  async remove(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifi\u00e9');
    await apiFetch(`/api/v1/patients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: state.items.filter((p) => p.id !== id) }));
  },
}));
