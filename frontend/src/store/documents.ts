import { create } from 'zustand';
import { buildUrl, apiFetch } from '../utils/api';
import { useAuth } from './auth';

export interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  description?: string;
  bienId?: string;
  locataireId?: string;
  uploadedAt: string;
}

interface DocumentState {
  items: Document[];
  fetchAll: (bienId: string) => Promise<void>;
  create: (bienId: string, file: File, type: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const endpoint = '/api/v1/documents';

export const useDocumentStore = create<DocumentState>((set) => ({
  items: [],
  fetchAll: async (bienId) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const docs = await apiFetch<Document[]>(`${endpoint}?bienId=${bienId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ items: docs });
  },
  create: async (bienId, file, type) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('bienId', bienId);
    const res = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc: Document = await res.json();
    set((state) => ({ items: [...state.items, doc] }));
  },
  remove: async (id) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    await apiFetch<void>(`${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((state) => ({ items: state.items.filter((d) => d.id !== id) }));
  },
}));
