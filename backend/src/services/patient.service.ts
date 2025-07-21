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
    console.log('PatientService.create - userId:', userId, 'data.userId:', userId, 'data:', data);
    const profile = await db.profile.findUnique({
      where: { userId }, 
    });
    if (!profile) {
      throw new Error('Profile not found for user');
    }
    return db.patient.create({ data: { ...data, profileId: profile.id } });
  },

  list(profileId: string) {
    return db.patient.findMany({ where: { profileId } });
  },

  get(profileId: string, id: string) {
    return db.patient.findFirst({ where: { id, profileId } });
  },

  async update(profileId: string, id: string, data: Partial<PatientData>) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No update data provided for patient ' + id);
    }
    console.log('PatientService.update - profileId:', profileId, 'id:', id, 'data:', data);
    const { count } = await db.patient.updateMany({ where: { id, profileId }, data });
    if (count === 0) throw new NotFoundError();
    return db.patient.findUnique({ where: { id } });
  },

  async remove(profileId: string, id: string) {
    const { count } = await db.patient.deleteMany({ where: { id, profileId } });
    if (count === 0) throw new NotFoundError();
  },
};
