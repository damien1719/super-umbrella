import { PDFDocument } from 'pdf-lib';
import { CerfaService } from '../src/services/cerfa.service';

jest.mock('../src/prisma', () => ({
  prisma: {
    fiscalYear: { findUnique: jest.fn() },
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: { from: () => ({ download: jest.fn() }) },
  })),
}));

import { prisma } from '../src/prisma';
import { createClient } from '@supabase/supabase-js';

const mockedPrisma = prisma as unknown as { fiscalYear: { findUnique: jest.Mock } };
const mockedCreate = createClient as jest.Mock;

describe('CerfaService.generate2031', () => {
  it('downloads and fills pdf', async () => {
    mockedPrisma.fiscalYear.findUnique.mockResolvedValueOnce({
      debut: new Date('2024-01-01'),
      fin: new Date('2024-12-31'),
    });
    const doc = await PDFDocument.create();
    const pdfBytes = await doc.save();
    const downloadMock = jest.fn().mockResolvedValue({
      data: new Blob([pdfBytes]),
      error: null,
    });
    mockedCreate.mockReturnValue({
      storage: { from: () => ({ download: downloadMock }) },
    });

    const buf = await CerfaService.generate2031(1n);
    expect(downloadMock).toHaveBeenCalled();
    expect(Buffer.isBuffer(buf)).toBe(true);
  });
});
