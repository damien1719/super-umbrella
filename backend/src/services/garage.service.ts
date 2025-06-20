import { prisma } from '../prisma';
import type { NewGarage, EditGarage } from '@monorepo/shared';

interface PrismaWithGarage {
  garage: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithGarage;

export const GarageService = {
  create(data: NewGarage) {
    return db.garage.create({ data });
  },

  list(bienId?: string) {
    return db.garage.findMany({ where: bienId ? { bienId } : undefined });
  },

  get(id: string) {
    return db.garage.findUnique({ where: { id } });
  },

  update(id: string, data: EditGarage) {
    return db.garage.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.garage.delete({ where: { id } });
  },
};
