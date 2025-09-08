import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';
import type { Job } from '../types/job';
import { isAdminUser } from '../utils/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;


export type SectionData = {
  title: string;
  kind: string;
  job: Job[];
  description?: string | null;
  schema?: unknown;
  defaultContent?: unknown;
  isPublic?: boolean;
  templateRefId?: string | null;
  templateOptions?: unknown;
  version?: number;
};


export const SectionService = {
  async create(userId: string, data: SectionData) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    return db.section.create({
      data: { ...data, authorId: profile.id },
      include: { templateRef: true },
    });
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
    return db.section.findMany({
      where: {
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { prenom: true } }, templateRef: true },
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
    return db.section.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      include: { author: { select: { prenom: true } }, templateRef: true },
    });
  },

  async duplicate(userId: string, id: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
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
    const section = await db.section.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
    });
    if (!section) throw new NotFoundError();
    return db.section.create({
      data: {
        title: section.title + ' - Copie',
        kind: section.kind,
        job: section.job,
        description: section.description,
        schema: section.schema,
        defaultContent: section.defaultContent,
        isPublic: false,
        authorId: profile.id,
        templateRefId: section.templateRefId,
        templateOptions: section.templateOptions,
        version: section.version,
      },
      include: { templateRef: true },
    });
  },

  async update(userId: string, id: string, data: Partial<SectionData>) {
    if (await isAdminUser(userId)) {
      return db.section.update({ where: { id }, data, include: { templateRef: true } });
    }
    // Support shares granted by email OR by userId (like list/get)
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const { count } = await db.section.updateMany({
      where: {
        id,
        OR: [
          { author: { userId } },
          {
            shares: {
              some: {
                role: 'EDITOR',
                OR: [
                  { invitedUserId: userId },
                  ...(email ? [{ invitedEmail: email }] : []),
                ],
              },
            },
          },
        ],
      },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.section.findUnique({ where: { id }, include: { templateRef: true } });
  },

  async remove(userId: string, id: string) {
    if (await isAdminUser(userId)) {
      await db.section.delete({ where: { id } });
      return;
    }
    // Vérifier droits: auteur ou éditeur via partage (userId or email)
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const { count } = await db.section.deleteMany({
      where: {
        id,
        OR: [
          { author: { userId } },
          {
            shares: {
              some: {
                role: 'EDITOR',
                OR: [
                  { invitedUserId: userId },
                  ...(email ? [{ invitedEmail: email }] : []),
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
