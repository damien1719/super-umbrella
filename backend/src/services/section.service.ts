import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';
import type { Job } from '../types/job';

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

  list(userId: string) {
    return db.section.findMany({
      where: {
        OR: [
          { isPublic: true },
          { author: { userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { prenom: true } }, templateRef: true },
    });
  },

  get(userId: string, id: string) {
    return db.section.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
        ],
      },
      include: { author: { select: { prenom: true } }, templateRef: true },
    });
  },

  async duplicate(userId: string, id: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    const section = await db.section.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
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
    const { count } = await db.section.updateMany({
      where: { id, author: { userId } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.section.findUnique({ where: { id }, include: { templateRef: true } });
  },

  async remove(userId: string, id: string) {
    // Vérifier que la section existe et appartient à l'utilisateur
    const section = await db.section.findFirst({
      where: { id, author: { userId } },
    });
    if (!section) throw new NotFoundError();

    const { count } = await db.section.deleteMany({
      where: { id, author: { userId } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
