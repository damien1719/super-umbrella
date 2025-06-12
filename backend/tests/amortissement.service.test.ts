import { AmortissementService } from '../src/services/amortissement.service';

jest.mock('../src/prisma', () => ({
  prisma: {
    fiscalYear: { findUnique: jest.fn() },
    immobilisation: { findMany: jest.fn() },
  },
}));

import { prisma } from '../src/prisma';
const mockedPrisma = prisma as unknown as {
  fiscalYear: { findUnique: jest.Mock };
  immobilisation: { findMany: jest.Mock };
};

describe('AmortissementService.compute', () => {
  it('calculates dotation for eligible immobilisations', async () => {
    mockedPrisma.fiscalYear.findUnique.mockResolvedValueOnce({
      debut: new Date('2024-01-01'),
      fin: new Date('2024-12-31'),
    });
    mockedPrisma.immobilisation.findMany.mockResolvedValueOnce([
      {
        id: 1n,
        prTexte: 'Immo',
        prixMontant: 1200,
        duree: 5,
        miseEnService: new Date('2024-03-15'),
        dateSortie: null,
      },
      {
        id: 2n,
        prTexte: 'Old',
        prixMontant: 1000,
        duree: 5,
        miseEnService: new Date('2023-01-01'),
        dateSortie: new Date('2023-12-31'),
      },
    ]);

    const res = await AmortissementService.compute({ anneeId: 1n, activityId: 1n });

    expect(res).toHaveLength(1);
    expect(res[0].debut).toEqual(new Date('2024-03-15'));
    expect(res[0].prorataMois).toBe(10);
    expect(res[0].dotation).toBe(200);
  });
});
