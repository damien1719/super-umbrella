import { z } from 'zod';

export const createLocataireSchema = z.object({
  civilite: z.string(),
  prenom: z.string(),
  nom: z.string(),
  dateNaissance: z.coerce.date(),
  bienId: z.string().uuid(),
  locationId: z.string().uuid(),
});
export const updateLocataireSchema = createLocataireSchema
  .omit({ bienId: true, locationId: true })
  .partial();

export const locataireFilterQuery = z.object({
  bienId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});
export const locataireIdParam = z.object({ locataireId: z.string().uuid() });
