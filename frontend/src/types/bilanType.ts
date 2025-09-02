import type { BilanTypeSection } from './bilanTypeSection';
import type { Job } from './job';

export interface BilanType {
  id: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  authorId?: string | null;
  createdAt?: string;
  layoutJson?: unknown;
  author?: { prenom?: string | null } | null;
  job?: Job[];
  sections?: BilanTypeSection[];
}

export type BilanTypes = BilanType[];
