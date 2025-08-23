// backend/src/types/template.ts

export type SlotMode = 'user' | 'computed' | 'llm';
export type SlotType = 'text' | 'number' | 'list' | 'table';


export interface SectionTemplate {
  id: string;
  label: string;
  version: number;
  content: unknown;       // JSON Lexical
  slotsSpec: SlotSpec[];  // toujours canonique
  stylePrompt?: string;
  isDeprecated: boolean;
  createdAt: string;      // string car JSON/HTTP
  updatedAt: string;
}

/** ---- Spec normalisée (runtime) ---- */
export type FieldSpec = {
  kind: 'field';                // <- important pour le narrowing
  id: string;                   // stable, unique
  type: SlotType;
  mode: SlotMode;
  label?: string;
  pattern?: string;
  deps?: string[];
  prompt?: string;
  template?: string;
  optional?: boolean;           // Pour la compatibilité avec plan.service.ts
};

export type GroupSpec = {
  kind: 'group';
  id: string;
  label?: string;
  slots: SlotSpec[];            // champs et/ou sous-groupes autorisés
};

export type RepeatFromEnum = { enum: Array<{ key: string; label: string }> };

export type RepeatSpec = {
  kind: 'repeat';
  id: string;
  from: RepeatFromEnum;
  ctx?: string;                 // ex: 'item' (default)
  namePattern?: string;         // ex: "${group}.${item.key}..."
  slots: SlotSpec[];            // permet des groupes/champs répétés
};

export type UseKitSpec = {
  kind: 'use';
  kit: string;
  as?: string;
  with?: Record<string, unknown>;
};

export type SlotSpec = FieldSpec | GroupSpec | RepeatSpec | UseKitSpec;

