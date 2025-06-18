import { prisma } from '../prisma';
import type { EditBien, NewBien } from '@monorepo/shared';
import { NotFoundError } from './profile.service';

export class ForbiddenError extends Error {}

interface PrismaWithBien {
  bien: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findFirst: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithBien & {
  profile: { findFirst: (...args: unknown[]) => unknown };
};

async function ensureProfileOwnership(profileId: string, userId: string) {
  const profile = (await db.profile.findFirst({ where: { id: profileId, userId } })) as unknown;
  if (!profile) throw new ForbiddenError();
}

export const BienService = {
  async create(userId: string, profileId: string, data: NewBien) {
    await ensureProfileOwnership(profileId, userId);
    return db.bien.create({ data: { ...data, profileId } });
  },

  async list(userId: string, profileId: string) {
    await ensureProfileOwnership(profileId, userId);
    return db.bien.findMany({ where: { profileId } });
  },

  async get(userId: string, profileId: string, id: string) {
    const bien = (await db.bien.findFirst({
      where: { id, profileId, profile: { userId } },
    })) as unknown;
    if (!bien) {
      const exists = await db.bien.findUnique({ where: { id } });
      if (!exists) throw new NotFoundError();
      throw new ForbiddenError();
    }
    return bien;
  },

  async update(userId: string, profileId: string, id: string, data: EditBien) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for bien ' + id);
    }
    console.log("data", data);
    await BienService.get(userId, profileId, id);
    return db.bien.update({ where: { id }, data });
  },

  async remove(userId: string, profileId: string, id: string) {
    await BienService.get(userId, profileId, id);
    return db.bien.delete({ where: { id } });
  },
};
