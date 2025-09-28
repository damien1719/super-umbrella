import { z } from 'zod';

const jobs = ['PSYCHOMOTRICIEN', 'ERGOTHERAPEUTE', 'NEUROPSYCHOLOGUE'] as const;

export const createSectionSchema = z.object({
  title: z.string(),
  kind: z.enum(['anamnese', 'tests_standards', 'observations', 'profil_sensoriel', 'conclusion', 'bilan_complet', 'CUSTOM_FORM']),
  job: z.array(z.enum(jobs)).nonempty(),
  description: z.string().optional(),
  schema: z.any().optional(),
  defaultContent: z.any().optional(),
  isPublic: z.boolean().optional(),
  templateRefId: z.string().optional(),
  templateOptions: z.any().optional(),
  version: z.number().int().optional(),
  astSnippets: z.record(z.string(), z.any()).optional(),
  // Optional on create; defaults to USER in DB
  source: z.enum(['USER', 'BILANPLUME']).optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
export const sectionIdParam = z.object({ sectionId: z.string().uuid() });
