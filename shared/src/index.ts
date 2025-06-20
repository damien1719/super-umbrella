import type { Prisma } from '@prisma/client';

export type NewBien = Prisma.BienCreateInput;
export type EditBien = Prisma.BienUpdateInput;
export type NewLocation = Prisma.LocationCreateInput;
export type EditLocation = Prisma.LocationUpdateInput;
export type NewLocataire = Prisma.LocataireCreateInput;
export type EditLocataire = Prisma.LocataireUpdateInput;
export type NewDocument = Prisma.DocumentCreateInput;
export type EditDocument = Prisma.DocumentUpdateInput;
export type NewInventaire = Prisma.InventaireCreateInput;
export type EditInventaire = Prisma.InventaireUpdateInput;
export type NewGarage = Prisma.GarageCreateInput;
export type EditGarage = Prisma.GarageUpdateInput;
export type NewCave = Prisma.CaveCreateInput;
export type EditCave = Prisma.CaveUpdateInput;

export * from './types/UserProfile';
export * from './types/ApiResponse';
