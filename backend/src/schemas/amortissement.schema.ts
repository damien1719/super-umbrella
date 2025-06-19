import { z } from 'zod';

export const amortissementQuerySchema = z.object({
  anneeId: z.coerce.bigint(),
  activityId: z.coerce.bigint(),
});
