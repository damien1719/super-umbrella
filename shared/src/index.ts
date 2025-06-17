import type { Prisma } from '@prisma/client';

export type NewBien = Prisma.BienCreateInput;
export type EditBien = Prisma.BienUpdateInput;

export * from './types/UserProfile';
export * from './types/ApiResponse';
