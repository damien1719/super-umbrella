import { prisma } from '../prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const BilanTypeShareService = {
  async create(inviterUserId: string, bilanTypeId: string, email: string, role: 'VIEWER' | 'EDITOR' = 'EDITOR') {
    const inviterProfile = await db.profile.findUnique({ where: { userId: inviterUserId } });
    if (!inviterProfile) throw new Error('Profile not found for user');

    // Ensure target BilanType exists (no ownership check here; controller handles admin check)
    const exists = await db.bilanType.findUnique({ where: { id: bilanTypeId } });
    if (!exists) throw new Error('BilanType not found');

    const invitedEmail = email.trim().toLowerCase();

    // Optional: pre-link if a user already has this email
    const targetProfile = await db.profile.findFirst({ where: { email: invitedEmail } });
    const invitedUserId = targetProfile?.userId ?? null;

    return db.bilanTypeShare.create({
      data: {
        bilanTypeId,
        invitedEmail,
        invitedUserId,
        role,
      },
    });
  },

  async list(inviterUserId: string, bilanTypeId: string) {
    // Validate BilanType exists
    const exists = await db.bilanType.findUnique({ where: { id: bilanTypeId } });
    if (!exists) throw new Error('BilanType not found');
    return db.bilanTypeShare.findMany({
      where: { bilanTypeId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async remove(inviterUserId: string, bilanTypeId: string, shareId: string) {
    // Only delete if share belongs to this bilanType
    const { count } = await db.bilanTypeShare.deleteMany({ where: { id: shareId, bilanTypeId } });
    if (count === 0) throw new Error('Share not found');
  },
};

