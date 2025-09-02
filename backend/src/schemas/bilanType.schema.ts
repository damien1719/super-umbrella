import { z } from 'zod';
import { createBilanTypeSectionSchema } from './bilanTypeSection.schema';

const jobs = ['PSYCHOMOTRICIEN', 'ERGOTHERAPEUTE', 'NEUROPSYCHOLOGUE'] as const;

export const createBilanTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  layoutJson: z.any().optional(),
  job: z.array(z.enum(jobs)).nonempty().optional(),
  sections: z
    .array(
      createBilanTypeSectionSchema.omit({ bilanTypeId: true })
    )
    .optional(),
});

export const updateBilanTypeSchema = createBilanTypeSchema.partial();

export const bilanTypeIdParam = z.object({ bilanTypeId: z.string().uuid() });
