import { z } from 'zod';

export const createBilanSchema = z.object({
  patientId: z.string().uuid(),
  bilanTypeId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
});

export const updateBilanSchema = createBilanSchema.partial();
export const bilanIdParam = z.object({ bilanId: z.string().uuid() });
