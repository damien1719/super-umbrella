import { prisma } from "../prisma";
import { NotFoundError } from "./profile.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type BilanData = {
  patientId: string;
  bilanTypeId?: string | null;
  date?: Date;
  descriptionJson?: unknown | null;
};



export const BilanService = {
  list(userId: string) {
    return db.bilan.findMany({
      where: { patient: { profile: { userId } } },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        bilanType: { select: { name: true } },
      },
    });
  },

  get(userId: string, id: string) {
    return db.bilan.findFirst({
      where: { id, patient: { profile: { userId } } },
    });
  },

  async create(userId: string, patientId: string, data: BilanData) {
    // vérifie que le patient appartient bien à l'utilisateur
    const patient = await db.patient.findFirst({
      where: { id: patientId, profile: { userId } },
    });
    if (!patient) throw new NotFoundError('Patient not found for user');

    return db.bilan.create({
      data: { ...data, patientId },
    });
  },

  async update(userId: string, id: string, data: Partial<BilanData>) {
    const { count } = await db.bilan.updateMany({
      where: { id, patient: { profile: { userId } } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.bilan.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    // Supprime d'abord les sections liées pour respecter la contrainte FK
    const ownerCheck = await db.bilan.findFirst({
      where: { id, patient: { profile: { userId } } },
      select: { id: true },
    });
    if (!ownerCheck) throw new NotFoundError();

    await db.bilanSectionInstance.deleteMany({ where: { bilanId: id } });
    await db.bilan.delete({ where: { id } });
  },
};
