import { z } from 'zod';
import { createBilanTypeSectionSchema } from './bilanTypeSection.schema';

export const createBilanTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  layoutJson: z.any().optional(),
  sections: z
    .array(
      createBilanTypeSectionSchema.omit({ bilanTypeId: true })
    )
    .optional(),
});

export const updateBilanTypeSchema = createBilanTypeSchema.partial();

export const bilanTypeIdParam = z.object({ bilanTypeId: z.string().uuid() });

