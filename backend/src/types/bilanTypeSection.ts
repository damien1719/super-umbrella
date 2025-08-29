import type { BilanType } from './bilanType';

export interface BilanTypeSection {
  id: string;
  bilanTypeId: string;
  sectionId: string;
  sortOrder: number;
  settings?: unknown;
  bilanType?: BilanType;
  section?: unknown;
}

export type BilanTypeSections = BilanTypeSection[];
