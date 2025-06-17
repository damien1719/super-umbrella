import { z } from 'zod';

export const createProfileSchema = z.object({
  userId: z.string().uuid(),
  prTexte: z.string().max(255),
  nif: z.string().max(255),
  nifReadonly: z.boolean(),
  civilite: z.enum(['M', 'MM']).optional(),
  nom: z.string().max(100),
  nomUsage: z.string().max(100).optional(),
  activiteReadonly: z.boolean(),
  prenom: z.string().max(100),
  email: z.string().email().optional(),
  telephonePersoNum: z.string().max(50).optional(),
  telephoneMobileNum: z.string().max(50).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();
export const profileIdParam = z.object({ id: z.coerce.bigint() });
