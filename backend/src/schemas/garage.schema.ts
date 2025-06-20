import { z } from 'zod';

export const createGarageSchema = z.object({
  bienId: z.string().uuid(),
  no: z.string(),
  niveau: z.number().int(),
});

export const updateGarageSchema = createGarageSchema.partial();

export const garageIdParam = z.object({ id: z.string().uuid() });
