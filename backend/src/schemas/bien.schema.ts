import { z } from 'zod';

export const createBienSchema = z.object({
  typeBien: z.string(),
  isColocation: z.boolean().optional(),
  adresse: z.string(),
  'complémentAdresse': z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  numeroIdentifiantFiscal: z.string().optional(),
  dpe: z.string().optional(),
  validiteDPE: z.coerce.date().optional().optional(),
  regimeJuridique: z.string().optional(),
  surfaceHabitable: z.number().optional(),
  nombrePieces: z.number().int().optional(),
  anneeConstruction: z.number().int().optional(),
  cuisine: z.string().optional(),
  nombreChambres: z.number().int().optional(),
  nombreSejours: z.number().int().optional(),
  nombreSallesDEau: z.number().int().optional(),
  nombreSallesDeBains: z.number().int().optional(),
  nombreWC: z.number().int().optional(),
  description: z.string().optional(),
  typeChauffage: z.string().optional(),
  autresTypesChauffage: z.array(z.string()).optional(),
  typeEauChaude: z.string().optional(),
  equipementsDivers: z.array(z.string()).optional(),
  equipementsNTIC: z.array(z.string()).optional(),
  autresPieces: z.array(z.string()).optional(),
  autresInformationsComplementaires: z.array(z.string()).optional(),
});

export const updateBienSchema = createBienSchema.partial();
export const bienIdParam = z
  .object({ bienId: z.string().uuid() })
  .transform(({ bienId }) => ({
    id: bienId,
}));
