import { z } from 'zod';

export const createGarantSchema = z.object({
  locataireId: z.string().uuid(),
  type: z.enum([
    'PERSONNE_PHYSIQUE',
    'SOCIETE',
    'GARANTIE_BANCAIRE',
    'GARANTIE_VISALE',
    'GARANTIE_GARANTME',
    'AUTRE',
    'AUCUN',
  ]),
});

export const updateGarantSchema = createGarantSchema
  .omit({ locataireId: true })
  .partial();

export const garantIdParam = z.object({ id: z.coerce.number().int() });
