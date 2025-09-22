import { z } from 'zod';

export const createSectionTemplateSchema = z.object({
  id: z.string(),
  label: z.string(),
  version: z.number().int().optional(),
  content: z.any(),
  slotsSpec: z.any(),
  genPartsSpec: z.any().optional(),
  isDeprecated: z.boolean().optional(),
});

export const updateSectionTemplateSchema = createSectionTemplateSchema.partial();

export const sectionTemplateIdParam = z.object({ sectionTemplateId: z.string() });
