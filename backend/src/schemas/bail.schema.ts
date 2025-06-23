import { z } from 'zod';

export const bailQuerySchema = z.object({
  bailleurNom: z.string().min(1),
  bailleurPrenom: z.string().min(1),
});
