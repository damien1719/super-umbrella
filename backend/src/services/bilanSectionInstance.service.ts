import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type BilanSectionInstanceData = {
  bilanId: string;
  sectionId: string;
  order: number;
  contentNotes: unknown;
  generatedContent?: unknown;
  status?: 'DRAFT' | 'GENERATED' | 'REFINED' | 'PUBLISHED';
};

export const BilanSectionInstanceService = {
  async create(userId: string, data: BilanSectionInstanceData) {
    const bilan = await db.bilan.findFirst({
      where: { id: data.bilanId, patient: { profile: { userId } } },
    });
    if (!bilan) throw new NotFoundError('Bilan not found for user');

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

    return db.bilanSectionInstance.create({ data });
  },

  list(userId: string, bilanId: string) {
    return db.bilanSectionInstance.findMany({
      where: { bilanId, bilan: { patient: { profile: { userId } } } },
      orderBy: { order: 'asc' },
      include: { section: { select: { title: true } } },
    });
  },

  get(userId: string, id: string) {
    return db.bilanSectionInstance.findFirst({
      where: { id, bilan: { patient: { profile: { userId } } } },
    });
  },

  async update(userId: string, id: string, data: Partial<BilanSectionInstanceData>) {
    const { count } = await db.bilanSectionInstance.updateMany({
      where: { id, bilan: { patient: { profile: { userId } } } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.bilanSectionInstance.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.bilanSectionInstance.deleteMany({
      where: { id, bilan: { patient: { profile: { userId } } } },
    });
    if (count === 0) throw new NotFoundError();
  },
};

