import { prisma } from '../prisma';

type ProfileData = Record<string, unknown>;

export const ProfileService = {
  create(data: ProfileData) {
    return prisma.profile.create({ data });
  },

  list() {
    return prisma.profile.findMany();
  },

  get(id: string) {
    return prisma.profile.findUnique({ where: { id } });
  },

  update(id: string, data: Partial<ProfileData>) {
    console.log(`[ProfileService.update] id=`, id, `data=`, data)
    if (!data || Object.keys(data).length === 0) {
      throw new Error("No update data provided for profile " + id)
    }
    return prisma.profile.update({ 
      where: { id }, 
      data 
    });
  },

  remove(id: string) {
    return prisma.profile.delete({ where: { id } });
  },
};
