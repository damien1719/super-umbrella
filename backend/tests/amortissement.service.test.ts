import { AmortissementService } from '../src/services/amortissement.service';

jest.mock('../src/prisma', () => ({
  prisma: {
    fiscalYear: { findUnique: jest.fn() },
    logement: { findMany: jest.fn() },
    immobilisation: { findMany: jest.fn() },
    composant: { findMany: jest.fn() },
  },
}));

import { prisma } from '../src/prisma';
const mockedPrisma = prisma as unknown as {
  fiscalYear: { findUnique: jest.Mock };
  logement: { findMany: jest.Mock };
  immobilisation: { findMany: jest.Mock };
  composant: { findMany: jest.Mock };
};

describe('AmortissementService.compute', () => {
  it('calculates dotation for eligible immobilisations', async () => {
    mockedPrisma.fiscalYear.findUnique.mockResolvedValueOnce({
      debut: new Date('2024-01-01'),
      fin: new Date('2024-12-31'),
    });
    mockedPrisma.logement.findMany.mockResolvedValueOnce([
      { id: 1n, dateLocation: new Date('2024-02-01') },
    ]);
    mockedPrisma.immobilisation.findMany.mockResolvedValueOnce([
      {
        id: 1n,
        prTexte: 'Immo',
        prixMontant: 1200,
        duree: 5,
        miseEnService: new Date('2024-03-15'),
        dateSortie: null,
        logementOid: 1n,
      },
      {
        id: 2n,
        prTexte: 'Old',
        prixMontant: 1000,
        duree: 5,
        miseEnService: new Date('2023-01-01'),
        dateSortie: new Date('2023-12-31'),
        logementOid: 1n,
      },
    ]);
    mockedPrisma.composant.findMany.mockResolvedValueOnce([]);

    const res = await AmortissementService.compute({ anneeId: 1n, activityId: 1n });

    expect(res).toHaveLength(1);
    expect(res[0].type).toBe('immobilisation');
    expect(res[0].debut).toEqual(new Date('2024-03-15'));
    expect(res[0].prorataMois).toBe(10);
    expect(res[0].dotation).toBe(200);
  });

  it('ignores non amortissable components', async () => {
    mockedPrisma.fiscalYear.findUnique.mockResolvedValueOnce({
      debut: new Date('2024-01-01'),
      fin: new Date('2024-12-31'),
    });
    mockedPrisma.logement.findMany.mockResolvedValueOnce([
      { id: 1n, dateLocation: new Date('2024-01-01') },
    ]);
    mockedPrisma.immobilisation.findMany.mockResolvedValueOnce([]);
    mockedPrisma.composant.findMany.mockResolvedValueOnce([
      {
        id: 10n,
        amortissable: false,
        duree: 5,
        miseEnService: new Date('2024-02-01'),
        prixProfilMontant: 1000,
        immobilisationId: 1n,
        article: { prTexte: 'Comp' },
      },
    ]);

    const res = await AmortissementService.compute({ anneeId: 1n, activityId: 1n });
    expect(res).toHaveLength(0);
  });

  it('mixes immobilisations and components', async () => {
    mockedPrisma.fiscalYear.findUnique.mockResolvedValueOnce({
      debut: new Date('2024-01-01'),
      fin: new Date('2024-12-31'),
    });
    mockedPrisma.logement.findMany.mockResolvedValueOnce([
      { id: 1n, dateLocation: new Date('2024-01-01') },
    ]);
    mockedPrisma.immobilisation.findMany.mockResolvedValueOnce([
      {
        id: 1n,
        prTexte: 'Immo',
        prixMontant: 1200,
        duree: 5,
        miseEnService: new Date('2024-01-01'),
        dateSortie: null,
        logementOid: 1n,
      },
    ]);
    mockedPrisma.composant.findMany.mockResolvedValueOnce([
      {
        id: 20n,
        amortissable: true,
        duree: 5,
        miseEnService: new Date('2024-06-01'),
        prixProfilMontant: 500,
        immobilisationId: 1n,
        article: { prTexte: 'Comp1' },
      },
      {
        id: 21n,
        amortissable: true,
        duree: 5,
        miseEnService: new Date('2024-07-01'),
        prixProfilMontant: 600,
        immobilisationId: 1n,
        article: { prTexte: 'Comp2' },
      },
    ]);

    const res = await AmortissementService.compute({ anneeId: 1n, activityId: 1n });
    expect(res).toHaveLength(3);
    const types = res.map(r => r.type).sort();
    expect(types).toEqual(['composant', 'composant', 'immobilisation']);
  });
});
