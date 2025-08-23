export type SlotType = 'text' | 'number' | 'list' | 'table';

export type SlotMode = 'user' | 'computed' | 'llm';

export type FieldPreset = 'description' | 'score' | 'conclusion';

export const FIELD_PRESETS: Record<FieldPreset, { prompt: string }> = {
  description: {
    prompt: 'description factuelle simple',
  },
  score: {
    prompt: '',
  },
  conclusion: {
    prompt: '',
  },
};

export interface SectionTemplate {
  id: string;
  label: string;
  version: number;
  content: unknown; // JSON Lexical
  slotsSpec: SlotSpec[]; // toujours canonique
  stylePrompt?: string;
  isDeprecated: boolean;
  createdAt: string; // string car JSON/HTTP
  updatedAt: string;
}

// 1) Field (backward-compatible "champ")
export type FieldSpec = {
  kind: 'field'; // <- AJOUTÉ pour cohérence avec backend
  id: string; // ex: "mabc.equilibre.comment"
  label?: string;
  mode: SlotMode;
  type: SlotType;
  pattern?: string;
  deps?: string[];
  prompt?: string;
  template?: string; // optional moustache for rendering
  optional?: boolean; // <- AJOUTÉ pour cohérence avec backend
  preset?: FieldPreset;
};

// 2) Groups (organization only)
export type GroupSpec = {
  kind: 'group';
  id: string; // logical namespace: "mabc"
  label?: string;
  slots: SlotSpec[];
};

// 3) Repeaters (generate n sub-slots per item)
export type RepeatFromEnum = { enum: Array<{ key: string; label: string }> };

export type RepeatSpec = {
  kind: 'repeat';
  id: string; // ex: "mabc.dimensions"
  from: RepeatFromEnum;
  ctx?: string; // context name (default "item")
  namePattern?: string; // ex: "${group}.${item.key}.${slotId}"
  slots: SlotSpec[]; // <- SIMPLIFIÉ comme backend
};

// 4) Use a reusable kit
export type UseKitSpec = {
  kind: 'use';
  kit: string; // ex: "dimensionNarrative@v1"
  as?: string; // local namespace
  with?: Record<string, unknown>; // kit params (barèmes, style, contraintes)
};

export type SlotSpec = FieldSpec | GroupSpec | RepeatSpec | UseKitSpec;
