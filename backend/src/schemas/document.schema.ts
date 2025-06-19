import { z } from 'zod';

export const createDocumentSchema = z.object({
  type: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  description: z.string().optional(),
  bienId: z.string().uuid().optional(),
  locataireId: z.string().uuid().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();
export const documentIdParam = z.object({ id: z.string().uuid() });
