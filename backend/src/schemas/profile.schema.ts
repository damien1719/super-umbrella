import { z } from 'zod';

// Schéma de création (non utilisé par le front actuel)
export const createProfileSchema = z.object({
  nom: z.string().max(100),
  prenom: z.string().max(100),
  job: z
    .enum(['PSYCHOMOTRICIEN', 'ERGOTHERAPEUTE', 'NEUROPSYCHOLOGUE'])
    .optional(),
  email: z.string().email().optional(),
  telephonePersoNum: z.string().max(50).optional(),
  telephoneMobileNum: z.string().max(50).optional(),
  civilite: z.enum(['M', 'MME', 'MLLE']).optional(),
  nomUsage: z.string().max(100).optional(),
});

// Schéma de mise à jour: uniquement les champs réellement édités côté front
export const updateProfileSchema = z
  .object({
    nom: z.string().max(100).optional(),
    prenom: z.string().max(100).optional(),
    job: z
      .enum(['PSYCHOMOTRICIEN', 'ERGOTHERAPEUTE', 'NEUROPSYCHOLOGUE'])
      .nullable()
      .optional(),
  })
  .strict();
export const profileIdParam = z.object({ profileId: z.string().uuid() });
