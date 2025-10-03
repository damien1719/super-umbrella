import { z } from 'zod';

export const createStylePresetSchema = z.object({
  target: z.enum(['TITLE', 'SUBTITLE', 'PARAGRAPH']),
  style: z.any(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
});

export const listStylePresetQuery = z.object({
  target: z.enum(['TITLE', 'SUBTITLE', 'PARAGRAPH']).optional(),
  includeArchived: z.string().optional(),
});
