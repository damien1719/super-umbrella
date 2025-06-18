import { z } from 'zod';

export const createLocationSchema = z.object({
  baseRent: z.number(),
  bienId: z.string().uuid().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

export const locationIdParam = z.object({ locId: z.string().uuid() });

export const locationFilterQuery = z.object({
  profileId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
});
