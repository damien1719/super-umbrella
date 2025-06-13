import { prisma } from '../prisma';

interface PrismaWithAmortissement {
  fiscalYear: {
    findUnique: (args: unknown) => Promise<{ debut: Date; fin: Date } | null>;
  };
  logement: {
    findMany: (args: unknown) => Promise<{ id: bigint; dateLocation: Date }[]>;
  };
  immobilisation: {
    findMany: (args: unknown) => Promise<{
      id: bigint;
      prTexte: string;
      prixMontant: number;
      duree: number;
      miseEnService: Date;
      dateSortie: Date | null;
      logementOid: bigint;
    }[]>;
  };
  composant: {
    findMany: (args: unknown) => Promise<{
      id: bigint;
      amortissable: boolean;
      duree: number;
      miseEnService: Date;
      prixProfilMontant: number;
      immobilisationId: bigint;
      article: { prTexte: string };
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
  type: 'immobilisation' | 'composant';
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

    const logements = await db.logement.findMany({
      where: { activityId },
      select: { id: true, dateLocation: true },
    });
    const logementMap = new Map<bigint, Date>();
    logements.forEach(l => logementMap.set(l.id, l.dateLocation));

    const immobs = await db.immobilisation.findMany({
      where: { logement: { activityId } },
      select: {
        id: true,
        prTexte: true,
        prixMontant: true,
        duree: true,
        miseEnService: true,
        dateSortie: true,
        logementOid: true,
      },
    });

    const comps = await db.composant.findMany({
      where: { logement: { activityId } },
      select: {
        id: true,
        amortissable: true,
        duree: true,
        miseEnService: true,
        prixProfilMontant: true,
        article: { select: { prTexte: true } },
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
        type: 'immobilisation',
        libelle: immo.prTexte,
        valeurBrute: immo.prixMontant,
        dureeAnnees: immo.duree,
        debut,
        fin,
        prorataMois,
        dotation,
      });
    }

    for (const c of comps) {
      if (!c.amortissable) continue;
      const locDate = logementMap.get(c.immobilisationId) ?? fiscal.debut;
      const debut = [c.miseEnService, locDate, fiscal.debut].reduce((a, b) => (a > b ? a : b));
      const calcEnd = new Date(debut);
      calcEnd.setFullYear(calcEnd.getFullYear() + c.duree);
      const fin = calcEnd < fiscal.fin ? calcEnd : fiscal.fin;
      if (debut > fin) continue;
      const prorataMois = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth()) + 1;
      const dotation = Math.round((c.prixProfilMontant / c.duree) * (prorataMois / 12));
      results.push({
        id: c.id,
        type: 'composant',
        libelle: c.article.prTexte,
        valeurBrute: c.prixProfilMontant,
        dureeAnnees: c.duree,
        debut,
        fin,
        prorataMois,
        dotation,
      });
    }
    return results;
  },
};
