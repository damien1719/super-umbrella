import { z } from 'zod';

export const createLogementSchema = z.object({
  id: z.coerce.bigint(),
  profilOid: z.coerce.bigint(),
  libelle: z.string(),
  prTexte: z.string(),
  adresseVide: z.boolean(),
  dateLocation: z.coerce.date(),
  dateVente: z.coerce.date().optional(),
  causeVente: z.number().int(),
  dateAchat: z.coerce.date(),
  dateApport: z.coerce.date().optional(),
  adresseComplete: z.string(),
  superficie: z.number().int(),
  nbPieces: z.number().int(),
  classement: z.number().int(),
  immobilise: z.boolean(),
  dateModification: z.coerce.date(),
  status: z.number().int(),
  activityId: z.coerce.bigint(),
  prixId: z.coerce.bigint().optional(),
  prixVenteId: z.coerce.bigint().optional(),
  adresseId: z.coerce.bigint().optional(),
});

export const updateLogementSchema = createLogementSchema.partial();
export const logementIdParam = z.object({ id: z.coerce.bigint() });
