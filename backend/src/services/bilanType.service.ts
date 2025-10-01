import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';
import type { BilanTypeSection } from '../types/bilanTypeSection';
import type { Job } from '../types/job';
import { isAdminUser } from '../utils/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Cascade helpers kept small and clear
async function cascadeSectionSharesOnChange(
  bilanTypeId: string,
  addedSectionIds: string[],
  removedSectionIds: string[],
) {
  if (addedSectionIds.length === 0 && removedSectionIds.length === 0) return;

  // Recipients of this BilanType
  const recipients = await db.bilanTypeShare.findMany({
    where: { bilanTypeId },
    select: { invitedEmail: true, invitedUserId: true, role: true },
  });
  if (recipients.length === 0) return;

  // Only cascade for private sections
  const involvedIds = Array.from(new Set([...addedSectionIds, ...removedSectionIds]));
  if (involvedIds.length === 0) return;
  const involvedSections = await db.section.findMany({
    where: { id: { in: involvedIds } },
    select: { id: true, isPublic: true },
  });
  const isPrivateSection = new Set(
    involvedSections.filter((s: { id: string; isPublic: boolean }) => s.isPublic === false).map((s: any) => s.id),
  );

  const createOps: unknown[] = [];
  const deleteOps: unknown[] = [];

  // Added sections → ensure a SectionShare exists for each recipient
  for (const sectionId of addedSectionIds) {
    if (!isPrivateSection.has(sectionId)) continue;
    for (const r of recipients) {
      const orClause = [
        ...(r.invitedUserId ? [{ invitedUserId: r.invitedUserId }] as any[] : []),
        ...(r.invitedEmail ? [{ invitedEmail: r.invitedEmail }] as any[] : []),
      ];
      if (orClause.length === 0) continue;
      const existing = await db.sectionShare.findFirst({
        where: { sectionId, OR: orClause },
        select: { id: true },
      });
      if (!existing) {
        createOps.push(
          db.sectionShare.create({
            data: {
              sectionId,
              invitedEmail: r.invitedEmail,
              invitedUserId: r.invitedUserId,
              role: r.role,
            },
          }),
        );
      }
    }
  }

  // Removed sections → revoke SectionShare if no other BilanType still covers it for the same recipient
  for (const sectionId of removedSectionIds) {
    if (!isPrivateSection.has(sectionId)) continue;
    for (const r of recipients) {
      const orClause = [
        ...(r.invitedUserId ? [{ invitedUserId: r.invitedUserId }] as any[] : []),
        ...(r.invitedEmail ? [{ invitedEmail: r.invitedEmail }] as any[] : []),
      ];
      if (orClause.length === 0) continue;

      const stillCovered = await db.bilanTypeShare.findFirst({
        where: {
          OR: orClause,
          bilanType: { id: { not: bilanTypeId }, sections: { some: { sectionId } } },
        },
        select: { id: true },
      });
      if (!stillCovered) {
        deleteOps.push(
          db.sectionShare.deleteMany({
            where: { sectionId, OR: orClause },
          }),
        );
      }
    }
  }

  if (createOps.length > 0 || deleteOps.length > 0) {
    await db.$transaction([...(createOps as any[]), ...(deleteOps as any[])]);
  }
}

export type BilanTypeSectionInput = Omit<
  BilanTypeSection,
  'id' | 'bilanTypeId' | 'bilanType' | 'section'
>;

export type BilanTypeData = {
  name: string;
  description?: string | null;
  isPublic?: boolean;
  layoutJson?: unknown;
  job?: Job[];
  sections?: BilanTypeSectionInput[];
};

export const BilanTypeService = {
  async create(userId: string, data: BilanTypeData) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    const { sections, ...bilanTypeData } = data;
    const bilanType = await db.bilanType.create({
      data: { ...bilanTypeData, authorId: profile.id },
    });
    if (sections?.length) {
      const ids = Array.from(new Set(sections.map((s) => s.sectionId)));
      if (ids.length > 0) {
        const existing = await db.section.findMany({
          where: { id: { in: ids } },
          select: { id: true },
        });
        const existingSet = new Set((existing || []).map((x: { id: string }) => x.id));
        const filtered = sections.filter((s) => existingSet.has(s.sectionId));
        for (const section of filtered) {
          await db.bilanTypeSection.create({
            data: { ...section, bilanTypeId: bilanType.id },
          });
        }
      }
    }
    return bilanType;
  },

  async list(userId: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const shareClause = {
      shares: {
        some: {
          OR: [
            { invitedUserId: userId },
            ...(email ? [{ invitedEmail: email }] : []),
          ],
        },
      },
    };
    return db.bilanType.findMany({
      where: {
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { prenom: true } }, sections: true },
    });
  },

  async get(userId: string, id: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const shareClause = {
      shares: {
        some: {
          OR: [
            { invitedUserId: userId },
            ...(email ? [{ invitedEmail: email }] : []),
          ],
        },
      },
    };
    return db.bilanType.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      include: { author: { select: { prenom: true } }, sections: true },
    });
  },

  async update(userId: string, id: string, data: Partial<BilanTypeData>) {
    const { sections, ...bilanTypeData } = data;
    // Pre-compute diffs if sections are provided (using only existing Section ids)
    let addedIds: string[] = [];
    let removedIds: string[] = [];
    let filteredSections: BilanTypeSectionInput[] | undefined = undefined;
    if (sections) {
      const prev = await db.bilanTypeSection.findMany({
        where: { bilanTypeId: id },
        select: { sectionId: true },
      });
      const oldSet: Set<string> = new Set(
        (prev || []).map((e: { sectionId: string }) => e.sectionId),
      );
      // Filter input to existing Section ids
      const incomingIds = Array.from(new Set(sections.map((s) => s.sectionId)));
      const existing = incomingIds.length
        ? await db.section.findMany({
            where: { id: { in: incomingIds } },
            select: { id: true },
          })
        : [];
      const existingSet = new Set((existing || []).map((x: { id: string }) => x.id));
      filteredSections = sections.filter((s) => existingSet.has(s.sectionId));

      const newSet: Set<string> = new Set(filteredSections.map((s) => s.sectionId));
      addedIds = Array.from(newSet).filter((sid) => !oldSet.has(sid));
      removedIds = Array.from(oldSet).filter((sid) => !newSet.has(sid));
    }
    let count = 0;
    if (await isAdminUser(userId)) {
      const updated = await db.bilanType.update({ where: { id }, data: bilanTypeData });
      count = updated ? 1 : 0;
    } else {
      // Allow update if user is the author or has an EDITOR share either by userId or by invitedEmail
      const profile = await db.profile.findUnique({ where: { userId } });
      const email = (profile?.email as string | undefined)?.trim().toLowerCase();
      const result = await db.bilanType.updateMany({
        where: {
          id,
          OR: [
            { author: { userId } },
            {
              shares: {
                some: {
                  OR: [
                    { invitedUserId: userId, role: 'EDITOR' },
                    ...(email ? [{ invitedEmail: email, role: 'EDITOR' }] : []),
                  ],
                },
              },
            },
          ],
        },
        data: bilanTypeData,
      });
      count = result.count ?? 0;
    }
    if (count === 0) throw new NotFoundError();

    if (sections) {
      // Replace all existing sections with provided payload (simple and predictable)
      const toCreate = filteredSections ?? [];
      await db.$transaction([
        db.bilanTypeSection.deleteMany({ where: { bilanTypeId: id } }),
        ...toCreate.map((s) => db.bilanTypeSection.create({ data: { ...s, bilanTypeId: id } })),
      ]);

      // Apply share cascade based on diffs
      await cascadeSectionSharesOnChange(id, addedIds, removedIds);
    }

    return db.bilanType.findUnique({ where: { id }, include: { sections: true } });
  },

  async remove(userId: string, id: string) {
    if (await isAdminUser(userId)) {
      await db.bilanType.delete({ where: { id } });
      return;
    }
    // Allow delete if user is the author or has an EDITOR share either by userId or by invitedEmail
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const { count } = await db.bilanType.deleteMany({
      where: {
        id,
        OR: [
          { author: { userId } },
          {
            shares: {
              some: {
                OR: [
                  { invitedUserId: userId, role: 'EDITOR' },
                  ...(email ? [{ invitedEmail: email, role: 'EDITOR' }] : []),
                ],
              },
            },
          },
        ],
      },
    });
    if (count === 0) throw new NotFoundError();
  },
};
