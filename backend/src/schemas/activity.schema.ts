import { z } from 'zod';

export const createActivitySchema = z.object({
  prTexte: z.string(),
  raisonSociale: z.string(),
  numeroSIRET: z.string(),
  numeroTVA: z.string(),
  debutActivite: z.coerce.date(),
  anneeDebutCompta: z.number().int(),
});

export const updateActivitySchema = createActivitySchema.partial();
export const activityIdParam = z.object({ id: z.coerce.bigint() });
