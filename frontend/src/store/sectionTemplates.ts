import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { SectionTemplate } from '../types/template';

interface SectionTemplateState {
  items: SectionTemplate[];
  create: (data: SectionTemplate) => Promise<SectionTemplate>;
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
    const item = await apiFetch<SectionTemplate>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },
}));
