import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type PatientData = {
  firstName: string;
  lastName: string;
  dob?: Date;
  notes?: string;
};

export const PatientService = {
  create(userId: string, data: PatientData) {
    return db.patient.create({ data: { ...data, userId } });
  },

  list(userId: string) {
    return db.patient.findMany({ where: { userId } });
  },

  get(userId: string, id: string) {
    return db.patient.findFirst({ where: { id, userId } });
  },

  async update(userId: string, id: string, data: Partial<PatientData>) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for patient ' + id);
    }
    const { count } = await db.patient.updateMany({ where: { id, userId }, data });
    if (count === 0) throw new NotFoundError();
    return db.patient.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.patient.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundError();
  },
};
