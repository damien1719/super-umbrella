import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dob: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
export const patientIdParam = z.object({ patientId: z.string().uuid() });
