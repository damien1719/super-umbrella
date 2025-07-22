import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SectionData = {
  title: string;
  kind: string;
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
