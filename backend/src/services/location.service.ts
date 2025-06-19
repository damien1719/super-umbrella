import { prisma } from '../prisma';
import type { NewLocation, EditLocation } from '@monorepo/shared';
import { NotFoundError } from './profile.service';

export class ForbiddenError extends Error {}

interface PrismaWithLocation {
  location: {
    create: (...args: unknown[]) => unknown;
    findMany: (...args: unknown[]) => unknown;
    findFirst: (...args: unknown[]) => unknown;
    findUnique: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
}

const db = prisma as unknown as PrismaWithLocation & {
  bien: { findFirst: (...args: unknown[]) => unknown };
  profile: { findFirst: (...args: unknown[]) => unknown };
};

async function ensureBienOwnership(bienId: string, userId: string) {
  const bien = (await db.bien.findFirst({
    where: { id: bienId, profile: { userId } },
  })) as unknown;
  if (!bien) throw new ForbiddenError();
}

async function ensureProfileOwnership(profileId: string, userId: string) {
  const profile = (await db.profile.findFirst({
    where: { id: profileId, userId },
  })) as unknown;
  if (!profile) throw new ForbiddenError();
}

export const LocationService = {
  async create(userId: string, data: NewLocation) {
    if (data.bienId) await ensureBienOwnership(data.bienId, userId);
    return db.location.create({ data });
  },

  async list(
    userId: string,
    filters: { profileId?: string; bienId?: string } = {},
  ) {
    if (filters.profileId) await ensureProfileOwnership(filters.profileId, userId);
    if (filters.bienId) await ensureBienOwnership(filters.bienId, userId);
    return db.location.findMany({
      where: {
        bienId: filters.bienId,
        bien: filters.profileId ? { profileId: filters.profileId } : undefined,
      },
    });
  },

  async get(userId: string, id: string) {
    const location = (await db.location.findFirst({
      where: { id, bien: { profile: { userId } } },
    })) as unknown;
    if (!location) {
      const exists = await db.location.findUnique({ where: { id } });
      if (!exists) throw new NotFoundError();
      throw new ForbiddenError();
    }
    return location;
  },

  async update(userId: string, id: string, data: EditLocation) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for location ' + id);
    }
    await LocationService.get(userId, id);
    return db.location.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    await LocationService.get(userId, id);
    return db.location.delete({ where: { id } });
  },

  async getByProperty(userId: string, bienId: string) {
    await ensureBienOwnership(bienId, userId);
    return db.location.findFirst({ where: { bienId: bienId } });
  },

  async createForProperty(userId: string, bienId: string, data: NewLocation) {
    await ensureBienOwnership(bienId, userId);
    return db.location.create({ data: { ...data, bienId: bienId } });
  },

  async listForProfile(userId: string, profileId: string) {
    await ensureProfileOwnership(profileId, userId);
    return db.location.findMany({ where: { bien: { profileId } } });
  },

  async createForProfile(userId: string, profileId: string, data: NewLocation) {
    if (!data.bienId) throw new Error('bienId required');
    await ensureProfileOwnership(profileId, userId);
    await ensureBienOwnership(data.bienId, userId);
    return db.location.create({ data });
  },
};
