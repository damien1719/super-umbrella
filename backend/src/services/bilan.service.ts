import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type BilanData = {
  patientId: string;
  bilanTypeId?: string | null;
  date?: Date;
};

export const BilanService = {
  create(_userId: string, data: BilanData) {
    return db.bilan.create({ data });
  },

  list(userId: string) {
    return db.bilan.findMany({ where: { patient: { userId } } });
  },

  get(userId: string, id: string) {
    return db.bilan.findFirst({ where: { id, patient: { userId } } });
  },

  async update(userId: string, id: string, data: Partial<BilanData>) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for bilan ' + id);
    }
    const { count } = await db.bilan.updateMany({
      where: { id, patient: { userId } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.bilan.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.bilan.deleteMany({
      where: { id, patient: { userId } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
