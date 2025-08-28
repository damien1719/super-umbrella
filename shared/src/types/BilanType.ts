import type { BilanTypeSection } from './BilanTypeSection';

export interface BilanType {
  id: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  authorId?: string | null;
  createdAt?: string;
  layoutJson?: unknown;
  author?: { prenom?: string | null } | null;
  sections?: BilanTypeSection[];
}

export type BilanTypes = BilanType[];
