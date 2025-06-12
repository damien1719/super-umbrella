import { prisma } from '../prisma';

interface PrismaWithAmortissement {
  fiscalYear: {
    findUnique: (args: unknown) => Promise<{ debut: Date; fin: Date } | null>;
  };
  immobilisation: {
    findMany: (args: unknown) => Promise<{
      id: bigint;
      prTexte: string;
      prixMontant: number;
      duree: number;
      miseEnService: Date;
      dateSortie: Date | null;
    }[]>;
  };
}

const db = prisma as unknown as PrismaWithAmortissement;

interface ComputeOptions {
  anneeId: bigint;
  activityId: bigint;
}

export interface AmortissementItem {
  id: bigint;
  libelle: string;
  valeurBrute: number;
  dureeAnnees: number;
  debut: Date;
  fin: Date;
  prorataMois: number;
  dotation: number;
}

export const AmortissementService = {
  async compute({ anneeId, activityId }: ComputeOptions): Promise<AmortissementItem[]> {
    const fiscal = await db.fiscalYear.findUnique({
      where: { id: anneeId },
      select: { debut: true, fin: true },
    });
    if (!fiscal) throw new Error('Fiscal year not found');

    const immobs = await db.immobilisation.findMany({
      where: { logement: { activityId } },
      select: {
        id: true,
        prTexte: true,
        prixMontant: true,
        duree: true,
        miseEnService: true,
        dateSortie: true,
      },
    });

    const results: AmortissementItem[] = [];

    for (const immo of immobs) {
      const debut = immo.miseEnService > fiscal.debut ? immo.miseEnService : fiscal.debut;
      const sortie = immo.dateSortie ?? fiscal.fin;
      const fin = sortie < fiscal.fin ? sortie : fiscal.fin;
      if (debut > fin) continue;
      const prorataMois = (fin.getFullYear() - debut.getFullYear()) * 12 +
        (fin.getMonth() - debut.getMonth()) + 1;
      const dotation = Math.round((immo.prixMontant / immo.duree) * (prorataMois / 12));
      results.push({
        id: immo.id,
        libelle: immo.prTexte,
        valeurBrute: immo.prixMontant,
        dureeAnnees: immo.duree,
        debut,
        fin,
        prorataMois,
        dotation,
      });
    }
    return results;
  },
};
