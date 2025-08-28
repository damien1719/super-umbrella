import { z } from 'zod';

export const generateBilanTypeBody = z.object({
  bilanTypeId: z.string().uuid(),
  excludeSectionIds: z.array(z.string().uuid()).optional(),
});
