import { z } from 'zod';

const statusEnum = z.enum(['DRAFT', 'GENERATED', 'REFINED', 'PUBLISHED']);

export const createBilanSectionInstanceSchema = z.object({
  bilanId: z.string().uuid(),
  sectionId: z.string().uuid(),
  order: z.number().int(),
  contentNotes: z.any(),
  generatedContent: z.any().optional(),
  status: statusEnum.optional(),
});

export const updateBilanSectionInstanceSchema = createBilanSectionInstanceSchema.partial();

export const upsertBilanSectionInstanceSchema = z.object({
  bilanId: z.string().uuid(),
  sectionId: z.string().uuid(),
  contentNotes: z.any(),
});

export const bilanSectionInstanceIdParam = z.object({
  bilanSectionInstanceId: z.string().uuid(),
});

export const bilanSectionInstanceListQuery = z.object({
  bilanId: z.string().uuid(),
});

export const generateFromTemplateSchema = z.object({
  instanceId: z.string().uuid(),
  trameId: z.string().uuid(), // Section.id
  stylePrompt: z.string().optional(),
  userSlots: z.any().optional(),
  imageBase64: z.string().optional(),
});
