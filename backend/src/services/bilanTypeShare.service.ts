import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type ShareRole = 'VIEWER' | 'EDITOR';

export const BilanTypeShareService = {
  async create(ownerUserId: string, bilanTypeId: string, email: string, role: ShareRole = 'EDITOR') {
    const ownerBilanType = await db.bilanType.findFirst({ where: { id: bilanTypeId, author: { userId: ownerUserId } } });
    if (!ownerBilanType) throw new NotFoundError('BilanType not found for user');

    const normalized = email.trim().toLowerCase();

    // Try to resolve an existing user via profile email
    const invitedProfile = await db.profile.findFirst({
      where: { email: normalized },
      select: { userId: true },
    });

    const orConds = [
      { invitedEmail: normalized },
      invitedProfile?.userId ? { invitedUserId: invitedProfile.userId } : undefined,
    ].filter(Boolean);

    const existing = await db.bilanTypeShare.findFirst({
      where: { bilanTypeId, OR: orConds },
    });
    if (existing) return existing;

    return db.bilanTypeShare.create({
      data: {
        bilanTypeId,
        invitedEmail: normalized,
        invitedUserId: invitedProfile?.userId ?? null,
        role,
      },
    });
  },

  async list(ownerUserId: string, bilanTypeId: string) {
    const ownerBilanType = await db.bilanType.findFirst({ where: { id: bilanTypeId, author: { userId: ownerUserId } } });
    if (!ownerBilanType) throw new NotFoundError('BilanType not found for user');
    return db.bilanTypeShare.findMany({
      where: { bilanTypeId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, invitedEmail: true, invitedUserId: true, role: true, createdAt: true },
    });
  },

  async remove(ownerUserId: string, bilanTypeId: string, shareId: string) {
    const share = await db.bilanTypeShare.findUnique({
      where: { id: shareId },
      include: { bilanType: { include: { author: true } } },
    });
    if (!share || share.bilanType.id !== bilanTypeId || share.bilanType.author?.userId !== ownerUserId) {
      throw new NotFoundError('Share not found for user');
    }
    await db.bilanTypeShare.delete({ where: { id: shareId } });
  },
};
