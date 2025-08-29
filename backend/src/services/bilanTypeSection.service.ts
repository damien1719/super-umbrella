import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

const db = prisma as any;

export type BilanTypeSectionData = {
  bilanTypeId: string;
  sectionId: string;
  sortOrder: number;
  settings?: unknown;
};

export const BilanTypeSectionService = {
  async create(userId: string, data: BilanTypeSectionData) {
    const bilanType = await db.bilanType.findFirst({
      where: { id: data.bilanTypeId, author: { userId } },
    });
    if (!bilanType) throw new NotFoundError('BilanType not found for user');
    const section = await db.section.findFirst({
      where: {
        id: data.sectionId,
        OR: [
          { isPublic: true },
          { author: { userId } },
        ],
      },
    });
    if (!section) throw new NotFoundError('Section not found for user');
    return db.bilanTypeSection.create({ data });
  },

  list(userId: string) {
    return db.bilanTypeSection.findMany({
      where: {
        bilanType: {
          OR: [
            { isPublic: true },
            { author: { userId } },
          ],
        },
      },
      orderBy: { sortOrder: 'asc' },
      include: { bilanType: true, section: true },
    });
  },

  get(userId: string, id: string) {
    return db.bilanTypeSection.findFirst({
      where: {
        id,
        bilanType: {
          OR: [
            { isPublic: true },
            { author: { userId } },
          ],
        },
      },
      include: { bilanType: true, section: true },
    });
  },

  async update(userId: string, id: string, data: Partial<BilanTypeSectionData>) {
    const { count } = await db.bilanTypeSection.updateMany({
      where: { id, bilanType: { author: { userId } } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.bilanTypeSection.findUnique({
      where: { id },
      include: { bilanType: true, section: true },
    });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.bilanTypeSection.deleteMany({
      where: { id, bilanType: { author: { userId } } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
