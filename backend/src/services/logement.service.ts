import { prisma } from '../prisma';

interface PrismaWithLogement {
  logement: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithLogement;

type LogementData = Record<string, unknown>;

export const LogementService = {
  create(data: LogementData) {
    return db.logement.create({ data });
  },

  list() {
    return db.logement.findMany();
  },

  get(id: bigint) {
    return db.logement.findUnique({ where: { id } });
  },

  update(id: bigint, data: Partial<LogementData>) {
    return db.logement.update({ where: { id }, data });
  },

  remove(id: bigint) {
    return db.logement.delete({ where: { id } });
  },
};
