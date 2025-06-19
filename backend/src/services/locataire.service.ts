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
    if (!data.bienId || !data.locationId) {
      throw new Error('bienId and locationId are required');
    }
    return db.locataire.create({ data });
  },

  list(filters: { bienId?: string; locationId?: string } = {}) {
    return db.locataire.findMany({
      where: { bienId: filters.bienId, locationId: filters.locationId },
    });
  },

  get(id: string) {
    return db.locataire.findUnique({ where: { id } });
  },

  update(id: string, data: EditLocataire) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for locataire ' + id);
    }
    if ('bienId' in data || 'locationId' in data) {
      throw new Error('bienId and locationId cannot be changed');
    }
    return db.locataire.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.locataire.delete({ where: { id } });
  },

  listForProperty(userId: string, bienId: string) {
    return db.locataire.findMany({
      where: { bienId, bien: { profile: { userId } } },
    });
  },
};
