import { z } from 'zod';

export const shareRoleEnum = z.enum(['VIEWER', 'EDITOR']);

export const createShareSchema = z.object({
  email: z.string().email(),
  role: shareRoleEnum.optional(),
});

export const shareIdParam = z.object({ shareId: z.string().uuid() });

