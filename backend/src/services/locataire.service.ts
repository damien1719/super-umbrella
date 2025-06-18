import { prisma } from '../prisma';
import type { NewLocataire, EditLocataire } from '@monorepo/shared';

interface PrismaWithLocataire {
  locataire: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    findFirst: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
  bien: {
    findFirst: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithLocataire;

export const LocataireService = {
  create(data: NewLocataire) {
    return db.locataire.create({ data });
  },

  list() {
    return db.locataire.findMany();
  },

  get(id: string) {
    return db.locataire.findUnique({ where: { id } });
  },

  update(id: string, data: EditLocataire) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for locataire ' + id);
    }
    return db.locataire.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.locataire.delete({ where: { id } });
  },

  listForProperty(userId: string, propertyId: string) {
    return db.locataire.findMany({
      where: { documents: { some: { bienId: propertyId, bien: { profile: { userId } } } } },
    });
  },
};
