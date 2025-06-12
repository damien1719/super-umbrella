import { z } from 'zod';

export const createArticleSchema = z.object({
  masked: z.boolean(),
  mnem: z.string().max(20).nullable(),
  prTexte: z.string().max(255),
  dureeMini: z.number().int(),
  dureeMaxi: z.number().int(),
});

export const updateArticleSchema = createArticleSchema.partial();
export const articleIdParam = z.object({ id: z.coerce.bigint() });
