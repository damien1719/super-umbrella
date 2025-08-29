import { z } from 'zod';

export const createBilanTypeSectionSchema = z.object({
  bilanTypeId: z.string().uuid(),
  sectionId: z.string().uuid(),
  sortOrder: z.number().int(),
  settings: z.any().optional(),
});

export const updateBilanTypeSectionSchema = createBilanTypeSectionSchema.partial();

export const bilanTypeSectionIdParam = z.object({
  bilanTypeSectionId: z.string().uuid(),
});
