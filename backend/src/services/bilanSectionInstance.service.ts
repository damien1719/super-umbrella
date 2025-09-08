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

    // Autorise l'accès à la Section si :
    // - elle est publique
    // - l'utilisateur en est l'auteur
    // - elle lui a été partagée (par userId ou par email)
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const shareClause = {
      shares: {
        some: {
          OR: [
            { invitedUserId: userId },
            ...(email ? [{ invitedEmail: email }] : []),
          ],
        },
      },
    } as const;

    const section = await db.section.findFirst({
      where: {
        id: data.sectionId,
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
          // Si l'utilisateur a un partage sur un BilanType qui inclut cette section,
          // on autorise aussi l'utilisation de la section dans un Bilan.
          {
            bilanTypeSections: {
              some: {
                bilanType: {
                  shares: {
                    some: {
                      OR: [
                        { invitedUserId: userId },
                        ...(email ? [{ invitedEmail: email }] : []),
                      ],
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });
    if (!section) throw new NotFoundError('Section not found for user');

    return db.bilanSectionInstance.create({ data: { ...data, contentNotes: data.contentNotes ?? {} } });
  },

  list(
    userId: string,
    bilanId: string,
    sectionId?: string,
    latest = false,
  ) {
    return db.bilanSectionInstance.findMany({
      where: {
        bilanId,
        ...(sectionId ? { sectionId } : {}),
        bilan: { patient: { profile: { userId } } },
      },
      orderBy: latest ? { notesUpdatedAt: 'desc' } : { order: 'asc' },
      take: latest ? 1 : undefined,
      include: { section: { select: { title: true } } },
    });
  },

  get(userId: string, id: string) {
    return db.bilanSectionInstance.findFirst({
      where: { id, bilan: { patient: { profile: { userId } } } },
    });
  },

  async update(userId: string, id: string, data: Partial<BilanSectionInstanceData>) {
    const updateData = { ...data } as Partial<BilanSectionInstanceData>;
    if (
      Object.prototype.hasOwnProperty.call(updateData, 'contentNotes') &&
      (updateData as { contentNotes?: unknown }).contentNotes == null
    ) {
      (updateData as { contentNotes?: unknown }).contentNotes = {};
    }
    const { count } = await db.bilanSectionInstance.updateMany({
      where: { id, bilan: { patient: { profile: { userId } } } },
      data: updateData,
    });
    if (count === 0) throw new NotFoundError();
    return db.bilanSectionInstance.findUnique({ where: { id } });
  },

  async upsert(
    userId: string,
    data: { bilanId: string; sectionId: string; contentNotes: unknown },
  ) {
    const existing = await db.bilanSectionInstance.findFirst({
      where: {
        bilanId: data.bilanId,
        sectionId: data.sectionId,
        bilan: { patient: { profile: { userId } } },
      },
      orderBy: { notesUpdatedAt: 'desc' },
    });
    if (existing) {
      await db.bilanSectionInstance.update({
        where: { id: existing.id },
        data: { contentNotes: data.contentNotes ?? {} },
      });
      return { id: existing.id };
    }
    const created = await this.create(userId, {
      bilanId: data.bilanId,
      sectionId: data.sectionId,
      order: 0,
      contentNotes: data.contentNotes,
    });
    return { id: created.id };
  },

  async remove(userId: string, id: string) {
    const { count } = await db.bilanSectionInstance.deleteMany({
      where: { id, bilan: { patient: { profile: { userId } } } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
