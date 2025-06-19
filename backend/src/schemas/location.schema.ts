import { PreviousRentalSituation } from '@prisma/client';
import { z } from 'zod';

export const createLocationSchema = z.object({
  baseRent: z.number(),
  depositAmount: z.number().optional(),
  leaseStartDate: z.coerce.date(),
  bienId: z.string().uuid().optional(),
  signatureCopies: z.number(),
  previousSituation: z.string()
});

export const updateLocationSchema = createLocationSchema.partial();

export const locationIdParam = z.object({ locId: z.string().uuid() });

export const locationFilterQuery = z.object({
  profileId: z.string().uuid().optional(),
  bienId: z.string().uuid().optional(),
});
