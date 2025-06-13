import { prisma } from '../prisma';

interface PrismaWithOperation {
  operation: {
    findMany: (args: unknown) => Promise<{
      id: bigint;
      date: Date;
      dateEcheance: Date | null;
      debut: Date | null;
      fin: Date | null;
      libelle: string | null;
      montantTtc: number | string;
      documentUrl: string | null;
      article: {
        compte: { mnem: string | null; caseCerfa: string | null } | null;
      } | null;
    }[]>;
  };
}

const db = prisma as unknown as PrismaWithOperation;

export interface FecOptions {
  anneeId: bigint;
  activityId: bigint;
}

export const FecService = {
  async generate({ anneeId, activityId }: FecOptions): Promise<string> {
    const ops = await db.operation.findMany({
      where: { anneeId, activityId },
      include: { article: { include: { compte: true } } },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    });

    const lines = ops.map(op => {
      const pieceDate = (op.dateEcheance ?? op.debut)
        ? new Date(op.dateEcheance ?? op.debut!).toISOString().slice(0, 10)
        : '';
      const validDate = op.fin ? op.fin.toISOString().slice(0, 10) : '';
      const amount = Number(op.montantTtc);
      const debit = amount > 0 ? amount.toFixed(2) : '0.00';
      const credit = amount < 0 ? Math.abs(amount).toFixed(2) : '0.00';
      return [
        '',
        '',
        op.id.toString(),
        op.date.toISOString().slice(0, 10),
        op.article?.compte?.mnem ?? '',
        op.article?.compte?.caseCerfa ?? '',
        '',
        '',
        op.documentUrl ?? '',
        pieceDate,
        op.libelle ?? '',
        debit,
        credit,
        '',
        '',
        validDate,
        '',
        '',
      ].join('|');
    });

    return lines.join('\n');
  },
};
