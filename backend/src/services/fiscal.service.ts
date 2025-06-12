import { prisma } from '../prisma';

interface PrismaWithOperations {
  operation: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findMany: (...args: unknown[]) => Promise<any[]>;
  };
}

const db = prisma as unknown as PrismaWithOperations;

interface ComputeOptions {
  anneeId: bigint;
  activityId: bigint;
}

export const FiscalService = {
  async compute({ anneeId, activityId }: ComputeOptions) {
    const operations = await db.operation.findMany({
      where: { anneeId, activityId },
      include: { article: { include: { famille: true } } },
    });

    const groups = new Map<string | null, {
      code: string | null;
      label: string | null;
      total: number;
      articles: { id: bigint; label: string | null; montant: number }[];
    }>();

    let charges = 0;
    let produits = 0;

    for (const op of operations) {
      if (!op.article) continue;

      const art = op.article;
      const key = art.groupe ?? null;
      if (!groups.has(key)) {
        groups.set(key, { code: key, label: art.groupe ?? null, total: 0, articles: [] });
      }
      const group = groups.get(key)!;

      const montant = Number(op.montantTtc);
      let articleEntry = group.articles.find(a => a.id === art.id);
      if (!articleEntry) {
        articleEntry = { id: art.id, label: art.prTexte, montant: 0 };
        group.articles.push(articleEntry);
      }
      articleEntry.montant += montant;
      group.total += montant;

      if (art.famille?.mnem === 'JD2M_DEPENSE') {
        charges += montant;
      } else if (art.famille?.mnem === 'JD2M_RECETTE') {
        produits += montant;
      }
    }

    return {
      produits,
      charges,
      resultat: produits - charges,
      groupes: Array.from(groups.values()),
    };
  },
};
