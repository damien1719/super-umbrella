import { z } from 'zod';

export const reportQuerySchema = z.object({
  anneeId: z.coerce.bigint(),
  activityId: z.coerce.bigint(),
});
