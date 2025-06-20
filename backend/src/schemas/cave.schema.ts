import { z } from 'zod';

export const createCaveSchema = z.object({
  bienId: z.string().uuid(),
  no: z.string(),
  niveau: z.number().int(),
});

export const updateCaveSchema = createCaveSchema.partial();

export const caveIdParam = z.object({ id: z.string().uuid() });
