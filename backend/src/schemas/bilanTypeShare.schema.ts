import { z } from 'zod';

export const createBilanTypeShareSchema = z.object({
  email: z.string().email(),
  role: z.enum(['VIEWER', 'EDITOR']).optional(),
});

export const bilanTypeIdParam = z.object({ bilanTypeId: z.string().uuid() });
export const shareIdParam = z.object({ shareId: z.string().uuid() });

