import { prisma } from '../prisma';

interface PrismaWithOperation {
  operation: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithOperation;

type OperationData = Record<string, unknown>;

export const OperationService = {
  create(data: OperationData) {
    return db.operation.create({ data });
  },

  list() {
    return db.operation.findMany();
  },

  get(id: bigint) {
    return db.operation.findUnique({ where: { id } });
  },

  update(id: bigint, data: Partial<OperationData>) {
    return db.operation.update({ where: { id }, data });
  },

  remove(id: bigint) {
    return db.operation.delete({ where: { id } });
  },
};
