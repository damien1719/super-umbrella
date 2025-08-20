export type SlotType = 'text' | 'number' | 'choice' | 'table';

export type SlotMode = 'user' | 'computed' | 'llm';

export interface Slot {
  id: string;
  type: SlotType;
  mode?: SlotMode;
  label?: string;
  options?: string[];
  prompt?: string;
  pattern?: string;
  deps?: string[];
}

export interface SectionTemplate {
  id: string;
  label: string;
  ast: unknown;
  slots: Slot[];
  stylePrompt?: string;
}

export type SlotAnswer = string | number | string[] | Record<string, unknown>;

export type SlotAnswers = Record<string, SlotAnswer>;
