import { z } from 'zod';

export const fecQuerySchema = z.object({
  anneeId: z.coerce.bigint(),
  activityId: z.coerce.bigint(),
});
