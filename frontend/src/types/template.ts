export type SlotType = 'text' | 'number' | 'list' | 'table';

export type SlotMode = 'user' | 'computed' | 'llm';

// 1) Field (backward-compatible "champ")
export type FieldSpec = {
  id: string;                    // ex: "mabc.equilibre.comment"
  label?: string;
  mode: SlotMode;
  type: SlotType;
  pattern?: string;
  deps?: string[];
  prompt?: string;
  template?: string;             // optional moustache for rendering
};

// 2) Groups (organization only)
export type GroupSpec = {
  kind: 'group';
  id: string;                    // logical namespace: "mabc"
  label?: string;
  slots: SlotSpec[];
};

// 3) Repeaters (generate n sub-slots per item)
export type RepeatSpec = {
  kind: 'repeat';
  id: string;                    // ex: "mabc.dimensions"
  from:
    | { enum: Array<{ key: string; label: string }> }
    | { path: string };          // ex: "notes.mabc.dimensions" (dynamic list)
  ctx?: string;                  // context name (default "item")
  namePattern?: string;          // ex: "${group}.${item.key}.${slotId}"
  slots: Array<Omit<FieldSpec, 'id' | 'deps' | 'prompt'> & {
    id: string;                  // can contain {{item.key}} in id
    deps?: string[];             // deps parameterized idem
    prompt?: string;             // prompt parameterized with {{item.label}}, {{slot "..."}}, etc.
  }>;
};

// 4) Use a reusable kit
export type UseKitSpec = {
  kind: 'use';
  kit: string;                    // ex: "dimensionNarrative@v1"
  as?: string;                    // local namespace
  with?: Record<string, unknown>; // kit params (barèmes, style, contraintes)
};

export type SlotSpec = FieldSpec | GroupSpec | RepeatSpec | UseKitSpec;

// Backward compatibility for existing code importing Slot
export type Slot = FieldSpec;

export interface SectionTemplate {
  id: string;
  label: string;
  ast: unknown;
  slots: SlotSpec[];
  stylePrompt?: string;
}

export type SlotAnswer = string | number | string[] | Record<string, unknown>;

export type SlotAnswers = Record<string, SlotAnswer>;
