import { prisma } from '../prisma';
import type { NewInventaire, EditInventaire } from '@monorepo/shared';

interface PrismaWithInventaire {
  inventaire: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithInventaire;

export const InventaireService = {
  create(data: NewInventaire) {
    return db.inventaire.create({ data });
  },

  list(bienId?: string) {
    return db.inventaire.findMany({ where: bienId ? { bienId } : undefined });
  },

  get(id: string) {
    return db.inventaire.findUnique({ where: { id } });
  },

  update(id: string, data: EditInventaire) {
    return db.inventaire.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.inventaire.delete({ where: { id } });
  },
};
