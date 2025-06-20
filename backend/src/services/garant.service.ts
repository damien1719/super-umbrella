import { prisma } from '../prisma';
import type { NewGarant, EditGarant } from '@monorepo/shared';

interface PrismaWithGarant {
  garant: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
  locataire: {
    findUnique: (...args: unknown[]) => unknown;
    findFirst: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithGarant;

export const GarantService = {
  async create(locataireId: string, data: NewGarant) {
    const loc = (await db.locataire.findUnique({
      where: { id: locataireId },
    })) as unknown as { garantId: number | null } | null;
    if (!loc) throw new Error('locataire not found');
    if (loc.garantId) throw new Error('locataire already has a garant');

    const garant = (await db.garant.create({ data })) as unknown as { id: number };
    await db.locataire.update({
      where: { id: locataireId },
      data: { garantId: garant.id },
    });
    return garant;
  },

  list() {
    return db.garant.findMany();
  },

  get(id: number) {
    return db.garant.findUnique({ where: { id } });
  },

  update(id: number, data: EditGarant) {
    return db.garant.update({ where: { id }, data });
  },

  async remove(id: number) {
    const loc = (await db.locataire.findFirst({
      where: { garantId: id },
    })) as unknown as { id: string } | null;
    if (loc) {
      await db.locataire.update({ where: { id: loc.id }, data: { garantId: null } });
    }
    return db.garant.delete({ where: { id } });
  },
};
