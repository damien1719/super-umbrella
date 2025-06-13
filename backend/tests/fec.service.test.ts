import { FecService } from '../src/services/fec.service';

jest.mock('../src/prisma', () => ({
  prisma: {
    operation: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../src/prisma';
const mockedPrisma = prisma as unknown as { operation: { findMany: jest.Mock } };

describe('FecService.generate', () => {
  it('formats operations into FEC lines', async () => {
    mockedPrisma.operation.findMany.mockResolvedValueOnce([
      {
        id: 1n,
        date: new Date('2024-01-01'),
        dateEcheance: null,
        debut: null,
        fin: new Date('2024-01-02'),
        libelle: 'A',
        montantTtc: 100,
        documentUrl: null,
        article: { compte: { mnem: '701', caseCerfa: 'Ventes' } },
      },
    ]);

    const res = await FecService.generate({ anneeId: 1n, activityId: 1n });
    const lines = res.split('\n');
    expect(lines).toHaveLength(1);
    const parts = lines[0].split('|');
    expect(parts).toHaveLength(18);
    expect(parts[5]).toBe('Ventes');
    expect(parts[10]).toBe('A');
    expect(parts[11]).toBe('100.00');
    expect(parts[12]).toBe('0.00');
  });
});
