import { FiscalService } from '../src/services/fiscal.service';

jest.mock('../src/prisma', () => ({
  prisma: {
    operation: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../src/prisma';
const mockedPrisma = prisma as unknown as { operation: { findMany: jest.Mock } };

describe('FiscalService.compute', () => {
  it('aggregates operations by article and group', async () => {
    mockedPrisma.operation.findMany.mockResolvedValueOnce([
      {
        montantTtc: 100,
        articleId: 1n,
        article: { id: 1n, prTexte: 'A1', groupe: 'G1', famille: { mnem: 'JD2M_RECETTE' } },
      },
      {
        montantTtc: 50,
        articleId: 1n,
        article: { id: 1n, prTexte: 'A1', groupe: 'G1', famille: { mnem: 'JD2M_RECETTE' } },
      },
      {
        montantTtc: 30,
        articleId: 2n,
        article: { id: 2n, prTexte: 'B1', groupe: 'G1', famille: { mnem: 'JD2M_DEPENSE' } },
      },
      {
        montantTtc: 20,
        articleId: 3n,
        article: { id: 3n, prTexte: 'C1', groupe: 'G2', famille: { mnem: 'JD2M_DEPENSE' } },
      },
    ]);

    const res = await FiscalService.compute({ anneeId: 1n, activityId: 1n });

    expect(res.produits).toBe(150);
    expect(res.charges).toBe(50);
    expect(res.resultat).toBe(100);
    const g1 = res.groupes.find(g => g.code === 'G1');
    expect(g1?.total).toBe(180);
    expect(g1?.articles).toHaveLength(2);
  });
});
