import { z } from 'zod';

export const createInventaireSchema = z.object({
  bienId: z.string().uuid(),
  piece: z.string(),
  mobilier: z.string(),
  quantite: z.number().int().optional(),
  marque: z.string().optional(),
  etatEntree: z.string().optional(),
});

export const updateInventaireSchema = createInventaireSchema.partial();

export const inventaireIdParam = z.object({ id: z.string().uuid() });
