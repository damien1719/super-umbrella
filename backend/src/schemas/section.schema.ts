import { z } from 'zod';

export const createSectionSchema = z.object({
  title: z.string(),
  kind: z.enum(['NARRATIVE', 'STANDARD_TEST', 'SENSOR_PROFILE', 'CUSTOM_FORM']),
  description: z.string().optional(),
  schema: z.any().optional(),
  defaultContent: z.any().optional(),
  isPublic: z.boolean().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
export const sectionIdParam = z.object({ sectionId: z.string().uuid() });
