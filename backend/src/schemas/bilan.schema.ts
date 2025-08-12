import { z } from "zod";

export const createBilanSchema = z.object({
  patientId: z.string().uuid().optional(),
  title: z.string().optional(),
  bilanTypeId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  descriptionHtml: z.string().optional(),
});

export const updateBilanSchema = createBilanSchema.partial();
export const bilanIdParam = z.object({ bilanId: z.string().uuid() });
