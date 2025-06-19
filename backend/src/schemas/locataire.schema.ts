import { z } from 'zod';

export const createLocataireSchema = z.object({
  civilite: z.string(),
  prenom: z.string(),
  nom: z.string(),
  dateNaissance: z.coerce.date(),
  bienId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});

export const updateLocataireSchema = createLocataireSchema.partial();
export const locataireIdParam = z.object({ locataireId: z.string().uuid() });
