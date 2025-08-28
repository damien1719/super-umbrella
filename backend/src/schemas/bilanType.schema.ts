import { z } from 'zod';

export const createBilanTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  layoutJson: z.any().optional(),
});

export const updateBilanTypeSchema = createBilanTypeSchema.partial();

export const bilanTypeIdParam = z.object({ bilanTypeId: z.string().uuid() });

