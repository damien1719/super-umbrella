import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { SectionTemplate, SlotSpec } from '../types/template';

interface ApiSectionTemplate {
  id: string;
  label: string;
  content: unknown;
  slotsSpec?: { slots?: SlotSpec[]; stylePrompt?: string };
}

interface SectionTemplateState {
  items: SectionTemplate[];
  create: (data: SectionTemplate) => Promise<SectionTemplate>;
  get: (id: string) => Promise<SectionTemplate>;
  update: (id: string, data: SectionTemplate) => Promise<SectionTemplate>;
}

const endpoint = '/api/v1/section-templates';

export const useSectionTemplateStore = create<SectionTemplateState>((set) => ({
  items: [],
  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const payload = {
      id: data.id,
      label: data.label,
      content: data.ast,
      slotsSpec: { slots: data.slots, stylePrompt: data.stylePrompt },
    };
    const apiItem = await apiFetch<ApiSectionTemplate>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const item: SectionTemplate = {
      id: apiItem.id,
      label: apiItem.label,
      ast: apiItem.content,
      slots: apiItem.slotsSpec?.slots ?? [],
      stylePrompt: apiItem.slotsSpec?.stylePrompt,
    };
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },
  async get(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const apiItem = await apiFetch<ApiSectionTemplate>(`${endpoint}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const item: SectionTemplate = {
      id: apiItem.id,
      label: apiItem.label,
      ast: apiItem.content,
      slots: apiItem.slotsSpec?.slots ?? [],
      stylePrompt: apiItem.slotsSpec?.stylePrompt,
    };
    set((state) => ({
      items: state.items.some((s) => s.id === id)
        ? state.items.map((s) => (s.id === id ? item : s))
        : [...state.items, item],
    }));
    return item;
  },
  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');
    const payload = {
      label: data.label,
      content: data.ast,
      slotsSpec: { slots: data.slots, stylePrompt: data.stylePrompt },
    };
    const apiItem = await apiFetch<ApiSectionTemplate>(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const item: SectionTemplate = {
      id: apiItem.id,
      label: apiItem.label,
      ast: apiItem.content,
      slots: apiItem.slotsSpec?.slots ?? [],
      stylePrompt: apiItem.slotsSpec?.stylePrompt,
    };
    set((state) => ({
      items: state.items.map((s) => (s.id === id ? item : s)),
    }));
    return item;
  },
}));
