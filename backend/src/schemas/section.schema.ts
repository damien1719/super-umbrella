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
});

export const updateSectionSchema = createSectionSchema.partial();
export const sectionIdParam = z.object({ sectionId: z.string().uuid() });
