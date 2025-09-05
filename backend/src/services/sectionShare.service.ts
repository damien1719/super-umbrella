import { prisma } from '../prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const SectionShareService = {
  async create(inviterUserId: string, sectionId: string, email: string, role: 'VIEWER' | 'EDITOR' = 'EDITOR') {
    const inviterProfile = await db.profile.findUnique({ where: { userId: inviterUserId } });
    if (!inviterProfile) throw new Error('Profile not found for user');

    const exists = await db.section.findUnique({ where: { id: sectionId } });
    if (!exists) throw new Error('Section not found');

    const invitedEmail = email.trim().toLowerCase();
    const targetProfile = await db.profile.findFirst({ where: { email: invitedEmail } });
    const invitedUserId = targetProfile?.userId ?? null;

    return db.sectionShare.create({
      data: {
        sectionId,
        invitedEmail,
        invitedUserId,
        role,
      },
    });
  },

  async list(inviterUserId: string, sectionId: string) {
    const exists = await db.section.findUnique({ where: { id: sectionId } });
    if (!exists) throw new Error('Section not found');
    return db.sectionShare.findMany({
      where: { sectionId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async remove(inviterUserId: string, sectionId: string, shareId: string) {
    const { count } = await db.sectionShare.deleteMany({ where: { id: shareId, sectionId } });
    if (count === 0) throw new Error('Share not found');
  },
};

