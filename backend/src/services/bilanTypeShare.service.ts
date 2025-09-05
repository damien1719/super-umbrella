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

    // Create share for the BilanType itself
    const share = await db.bilanTypeShare.create({
      data: {
        bilanTypeId,
        invitedEmail,
        invitedUserId,
        role,
      },
    });

    // Also share all private sections associated with this BilanType
    // 1) Fetch all linked sections (only private ones)
    const linked = await db.bilanTypeSection.findMany({
      where: { bilanTypeId },
      select: {
        section: { select: { id: true, isPublic: true } },
      },
    });

    const privateSectionIds = Array.from(
      new Set(
        (linked || [])
          .filter((s: { section: { id: string; isPublic: boolean } }) => s.section && s.section.isPublic === false)
          .map((s: { section: { id: string } }) => s.section.id),
      ),
    );

    if (privateSectionIds.length > 0) {
      // 2) For each private section, create a SectionShare if not already present
      const createOps = [] as unknown[];
      for (const sectionId of privateSectionIds) {
        // Check existing share by invited user or invited email
        const existing = await db.sectionShare.findFirst({
          where: {
            sectionId,
            OR: [
              ...(invitedUserId ? [{ invitedUserId }] : []),
              { invitedEmail },
            ],
          },
          select: { id: true },
        });
        if (!existing) {
          createOps.push(
            db.sectionShare.create({
              data: {
                sectionId,
                invitedEmail,
                invitedUserId,
                role,
              },
            }),
          );
        }
      }

      if (createOps.length > 0) {
        await db.$transaction(createOps as any);
      }
    }

    return share;
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
