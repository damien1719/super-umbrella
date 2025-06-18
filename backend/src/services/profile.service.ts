import { prisma } from '../prisma';

type ProfileData = Record<string, unknown>;

export class NotFoundError extends Error {}

export const ProfileService = {
  list(userId: string) {
    return prisma.profile.findMany({ where: { userId } });
  },

  create(userId: string, data: ProfileData) {
    return prisma.profile.create({ data: { userId, ...data } });
  },

  get(profileId: string, userId: string) {
    return prisma.profile.findFirst({ where: { id: profileId, userId } });
  },

  async update(profileId: string, userId: string, data: Partial<ProfileData>) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for profile ' + profileId);
    }
    const { count } = await prisma.profile.updateMany({
      where: { id: profileId, userId },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return prisma.profile.findUnique({ where: { id: profileId } });
  },

  async remove(profileId: string, userId: string) {
    const { count } = await prisma.profile.deleteMany({
      where: { id: profileId, userId },
    });
    if (count === 0) throw new NotFoundError();
  },
};
