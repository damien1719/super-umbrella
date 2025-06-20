import { prisma } from '../prisma';
import type { NewCave, EditCave } from '@monorepo/shared';

interface PrismaWithCave {
  cave: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithCave;

export const CaveService = {
  create(data: NewCave) {
    return db.cave.create({ data });
  },

  list(bienId?: string) {
    return db.cave.findMany({ where: bienId ? { bienId } : undefined });
  },

  get(id: string) {
    return db.cave.findUnique({ where: { id } });
  },

  update(id: string, data: EditCave) {
    return db.cave.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.cave.delete({ where: { id } });
  },
};
