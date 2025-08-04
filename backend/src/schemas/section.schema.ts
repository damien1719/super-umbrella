import { z } from 'zod';

export const createSectionSchema = z.object({
  title: z.string(),
  kind: z.enum(['anamnese', 'tests_standards', 'observations', 'profil_sensoriel', 'conclusion','CUSTOM_FORM']),
  description: z.string().optional(),
  schema: z.any().optional(),
  defaultContent: z.any().optional(),
  isPublic: z.boolean().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
export const sectionIdParam = z.object({ sectionId: z.string().uuid() });
