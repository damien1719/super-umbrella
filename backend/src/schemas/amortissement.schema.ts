import { z } from 'zod';

export const amortissementQuerySchema = z.object({
  query: z.object({
    anneeId: z.coerce.bigint(),
    activityId: z.coerce.bigint(),
  }),
});
