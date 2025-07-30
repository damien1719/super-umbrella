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
  async create(userId: string, data: PatientData) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');

    return db.patient.create({
      data: { ...data, profileId: profile.id },
    });
  },

  list(userId: string) {
    return db.patient.findMany({
      where: { profile: { userId } },
      orderBy: { lastName: 'asc' },
    });
  },

  get(userId: string, id: string) {
    return db.patient.findFirst({
      where: { id, profile: { userId } },
    });
  },

  async update(userId: string, id: string, data: Partial<PatientData>) {
    const { count } = await db.patient.updateMany({
      where: { id, profile: { userId } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.patient.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.patient.deleteMany({
      where: { id, profile: { userId } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
