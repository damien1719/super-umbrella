import { prisma } from '../prisma';
import { randomUUID } from 'crypto';
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
  // new: allow setting the Section source (admin UI only)
  source?: 'USER' | 'BILANPLUME';
};


export const SectionService = {
  async create(userId: string, data: SectionData) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    // Ensure newly created Sections have a minimal default schema
    // If caller did not provide a non-empty schema, inject [1 title + 1 notes]
    const hasSchema =
      Array.isArray((data as any).schema) && (data as any).schema.length > 0;
    const defaultSchema = [
      { id: randomUUID(), type: 'titre', titre: data.title },
      {
        id: randomUUID(),
        type: 'notes',
        titre: '',
        contenu: '',
      },
    ];

    const payload = {
      ...data,
      schema: hasSchema ? (data as any).schema : (defaultSchema as unknown),
      authorId: profile.id,
    } as const;

    return db.section.create({
      data: payload,
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
    // Admins may update any field, including source
    if (await isAdminUser(userId)) {
      return db.section.update({ where: { id }, data, include: { templateRef: true } });
    }
    // For non-admins, prevent source changes even if passed accidentally
    const rest = { ...(data as Partial<SectionData>) };
    if ('source' in rest) {
      delete (rest as { source?: SectionData['source'] }).source;
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
      data: rest,
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
