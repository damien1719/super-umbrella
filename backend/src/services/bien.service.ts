import { prisma } from '../prisma';

interface PrismaWithBien {
  bien: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithBien;

type BienData = Record<string, unknown>;

export const BienService = {
  create(data: BienData) {
    return db.bien.create({ data });
  },

  list() {
    return db.bien.findMany();
  },

  get(id: string) {
    return db.bien.findUnique({ where: { id } });
  },

  update(id: string, data: Partial<BienData>) {
    return db.bien.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.bien.delete({ where: { id } });
  },
};
