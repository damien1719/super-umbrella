import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type Job =
  | 'PSYCHOMOTRICIEN'
  | 'ERGOTHERAPEUTE'
  | 'NEUROPSYCHOLOGUE';


export type SectionData = {
  title: string;
  kind: string;
  job: Job;
  description?: string | null;
  schema?: unknown;
  defaultContent?: unknown;
  isPublic?: boolean;
};


export const SectionService = {
  async create(userId: string, data: SectionData) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    return db.section.create({ data: { ...data, authorId: profile.id } });
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
      include: { author: { select: { prenom: true } } },
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
      include: { author: { select: { prenom: true } } },
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
      },
    });
  },

  async update(userId: string, id: string, data: Partial<SectionData>) {
    const { count } = await db.section.updateMany({
      where: { id, author: { userId } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.section.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.section.deleteMany({
      where: { id, author: { userId } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
