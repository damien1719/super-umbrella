import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuth } from './auth';
import type { SectionTemplate, SlotSpec } from '../types/template';

interface ApiSectionTemplate {
  id: string;
  label: string;
  content: unknown; // Lexical JSON (backend)
  slotsSpec?: SlotSpec[]; // SlotSpec[] (backend)
  stylePrompt?: string;
  // Optional metadata if backend provides them; otherwise we'll default
  version?: number;
  isDeprecated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SectionTemplateState {
  items: SectionTemplate[];
  create: (data: SectionTemplate) => Promise<SectionTemplate>;
  get: (id: string) => Promise<SectionTemplate>;
  update: (id: string, data: SectionTemplate) => Promise<SectionTemplate>;
}

const endpoint = '/api/v1/section-templates';

/* ---------- Helpers de validation canonique ---------- */

function isFieldSpec(x: any): boolean {
  return (
    x?.kind === 'field' &&
    typeof x.id === 'string' &&
    typeof x.type === 'string' &&
    typeof x.mode === 'string'
  );
}
function isGroupSpec(x: any): boolean {
  return (
    x?.kind === 'group' && typeof x.id === 'string' && Array.isArray(x.slots)
  );
}
function isRepeatSpec(x: any): boolean {
  return (
    x?.kind === 'repeat' &&
    typeof x.id === 'string' &&
    x?.from &&
    Array.isArray(x.from.enum) &&
    Array.isArray(x.slots)
  );
}
function isUseKitSpec(x: any): boolean {
  return x?.kind === 'use' && typeof x.kit === 'string';
}
function isSlotSpec(x: any): boolean {
  return isFieldSpec(x) || isGroupSpec(x) || isRepeatSpec(x) || isUseKitSpec(x);
}
function ensureSlotSpecArray(input: unknown): SlotSpec[] {
  if (!Array.isArray(input)) {
    throw new Error(
      'API error: slotsSpec must be a SlotSpec[] (canonical format).',
    );
  }
  // validation légère pour debugger tôt si backend dévie
  for (const s of input) {
    if (!isSlotSpec(s)) {
      throw new Error('API error: slotsSpec contains an invalid SlotSpec.');
    }
  }
  return input as SlotSpec[];
}

/* ---------- Normalisation réponse API -> SectionTemplate ---------- */

function normalizeApiItem(api: ApiSectionTemplate): SectionTemplate {
  return {
    id: api.id,
    label: api.label,
    version: api.version ?? 1,
    content: api.content ?? null,
    slotsSpec: ensureSlotSpecArray(api.slotsSpec ?? []),
    stylePrompt: api.stylePrompt,
    isDeprecated: api.isDeprecated ?? false,
    createdAt: api.createdAt ?? new Date().toISOString(),
    updatedAt: api.updatedAt ?? new Date().toISOString(),
  };
}

/* ---------- Store ---------- */

export const useSectionTemplateStore = create<SectionTemplateState>((set) => ({
  items: [],

  async create(data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');

    const payload: ApiSectionTemplate = {
      id: data.id,
      label: data.label,
      content: data.content,
      slotsSpec: data.slotsSpec,
      stylePrompt: data.stylePrompt,
    };

    const apiItem = await apiFetch<ApiSectionTemplate>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const item = normalizeApiItem(apiItem);
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },

  async get(id) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');

    const apiItem = await apiFetch<ApiSectionTemplate>(`${endpoint}/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const item = normalizeApiItem(apiItem);
    set((state) => {
      const exists = state.items.some((s) => s.id === id);
      return {
        items: exists
          ? state.items.map((s) => (s.id === id ? item : s))
          : [...state.items, item],
      };
    });

    return item;
  },

  async update(id, data) {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Non authentifié');

    const payload: Partial<ApiSectionTemplate> = {
      label: data.label,
      content: data.content,
      slotsSpec: data.slotsSpec,
      stylePrompt: data.stylePrompt,
    };

    const apiItem = await apiFetch<ApiSectionTemplate>(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const item = normalizeApiItem(apiItem);
    set((state) => ({
      items: state.items.map((s) => (s.id === id ? item : s)),
    }));
    return item;
  },
}));
