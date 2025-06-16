import { z } from 'zod';

export const createBienSchema = z.object({
  typeBien: z.string(),
  isColocation: z.boolean().optional(),
  adresse: z.string(),
  'complémentAdresse': z.string().optional(),
  codePostal: z.string(),
  ville: z.string(),
  pays: z.string(),
  numeroIdentifiantFiscal: z.string(),
  dpe: z.string(),
  validiteDPE: z.coerce.date().optional(),
  regimeJuridique: z.string(),
  surfaceHabitable: z.number(),
  nombrePieces: z.number().int(),
  anneeConstruction: z.number().int(),
  cuisine: z.string(),
  nombreChambres: z.number().int(),
  nombreSejours: z.number().int(),
  nombreSallesDEau: z.number().int(),
  nombreSallesDeBains: z.number().int(),
  nombreWC: z.number().int(),
  description: z.string().optional(),
  typeChauffage: z.string(),
  autresTypesChauffage: z.array(z.string()),
  typeEauChaude: z.string(),
  equipementsDivers: z.array(z.string()),
  equipementsNTIC: z.array(z.string()),
  autresPieces: z.array(z.string()),
  autresInformationsComplementaires: z.array(z.string()),
});

export const updateBienSchema = createBienSchema.partial();
export const bienIdParam = z.object({ id: z.string().uuid() });
