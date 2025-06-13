import { z } from 'zod';

export const cerfa2031QuerySchema = z.object({
  query: z.object({
    anneeId: z.coerce.bigint(),
    activityId: z.coerce.bigint(),
  }),
});

export const cerfa2042QuerySchema = cerfa2031QuerySchema;
