import { z } from 'zod';

export const createSectionExampleSchema = z.object({
  sectionId: z.string().uuid(),
  label: z.string().optional(),
  content: z.string(),
});

export const updateSectionExampleSchema = createSectionExampleSchema.partial();
export const sectionExampleIdParam = z.object({ sectionExampleId: z.string().uuid() });
