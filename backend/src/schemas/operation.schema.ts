import { z } from 'zod';

export const createOperationSchema = z.object({
  id: z.coerce.bigint(),
  date: z.coerce.date(),
  montantTtc: z.coerce.number(),
  activityId: z.coerce.bigint(),
  anneeId: z.coerce.bigint(),
  libelle: z.string().optional(),
  dateEcheance: z.coerce.date().optional(),
  debut: z.coerce.date().optional(),
  fin: z.coerce.date().optional(),
  montantTva: z.coerce.number().optional(),
  documentUrl: z.string().optional(),
  logementId: z.coerce.bigint().optional(),
  articleId: z.coerce.bigint().optional(),
  payeurId: z.coerce.bigint().optional(),
  immoId: z.coerce.bigint().optional(),
});

export const updateOperationSchema = createOperationSchema.partial();
export const operationIdParam = z.object({ id: z.coerce.bigint() });
