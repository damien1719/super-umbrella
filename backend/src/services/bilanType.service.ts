import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';
import type { BilanTypeSection } from '@monorepo/shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type BilanTypeSectionInput = Omit<
  BilanTypeSection,
  'id' | 'bilanTypeId' | 'bilanType' | 'section'
>;

export type BilanTypeData = {
  name: string;
  description?: string | null;
  isPublic?: boolean;
  layoutJson?: unknown;
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
      for (const section of sections) {
        await db.bilanTypeSection.create({
          data: { ...section, bilanTypeId: bilanType.id },
        });
      }
    }
    return bilanType;
  },

  list(userId: string) {
    return db.bilanType.findMany({
      where: {
        OR: [
          { isPublic: true },
          { author: { userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { prenom: true } }, sections: true },
    });
  },

  get(userId: string, id: string) {
    return db.bilanType.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
        ],
      },
      include: { author: { select: { prenom: true } }, sections: true },
    });
  },

  async update(userId: string, id: string, data: Partial<BilanTypeData>) {
    const { count } = await db.bilanType.updateMany({
      where: { id, author: { userId } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.bilanType.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.bilanType.deleteMany({
      where: { id, author: { userId } },
    });
    if (count === 0) throw new NotFoundError();
  },
};

