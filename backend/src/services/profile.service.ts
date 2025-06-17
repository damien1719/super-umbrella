import { prisma } from '../prisma';

type ProfileData = Record<string, unknown>;

export const ProfileService = {
  create(data: ProfileData) {
    return prisma.profile.create({ data });
  },

  list() {
    return prisma.profile.findMany();
  },

  get(id: bigint) {
    return prisma.profile.findUnique({ where: { id } });
  },

  update(id: bigint, data: Partial<ProfileData>) {
    return prisma.profile.update({ where: { id }, data });
  },

  remove(id: bigint) {
    return prisma.profile.delete({ where: { id } });
  },
};
