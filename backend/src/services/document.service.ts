import { prisma } from '../prisma';
import type { NewDocument, EditDocument } from '@monorepo/shared';

interface PrismaWithDocument {
  document: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithDocument;

export const DocumentService = {
  create(data: NewDocument) {
    return db.document.create({ data });
  },

  list() {
    return db.document.findMany();
  },

  get(id: string) {
    return db.document.findUnique({ where: { id } });
  },

  update(id: string, data: EditDocument) {
    return db.document.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.document.delete({ where: { id } });
  },
};
