import { prisma } from '../prisma';

interface PrismaWithActivity {
  activity: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithActivity;

type ActivityData = Record<string, unknown>;

export const ActivityService = {
  create(data: ActivityData) {
    return db.activity.create({ data });
  },

  list() {
    return db.activity.findMany();
  },

  get(id: bigint) {
    return db.activity.findUnique({ where: { id } });
  },

  update(id: bigint, data: Partial<ActivityData>) {
    return db.activity.update({ where: { id }, data });
  },

  remove(id: bigint) {
    return db.activity.delete({ where: { id } });
  },
};
