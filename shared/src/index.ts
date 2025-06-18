import type { Prisma } from '@prisma/client';

export type NewBien = Prisma.BienCreateInput;
export type EditBien = Prisma.BienUpdateInput;
export type NewLocation = Prisma.LocationCreateInput;
export type EditLocation = Prisma.LocationUpdateInput;
export type NewLocataire = Prisma.LocataireCreateInput;
export type EditLocataire = Prisma.LocataireUpdateInput;

export * from './types/UserProfile';
export * from './types/ApiResponse';
