import createReport from 'docx-templates';
import { BailService } from '../src/services/bail.service';

jest.mock('../src/prisma', () => ({ prisma: {} }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: { from: () => ({ download: jest.fn() }) },
  })),
}));

jest.mock('docx-templates', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(Buffer.from('docx')),
}));

const mockedCreateReport = createReport as jest.Mock;

import { createClient } from '@supabase/supabase-js';

const mockedCreate = createClient as jest.Mock;

describe('BailService.generate', () => {
  it('downloads template and fills docx', async () => {
    const downloadMock = jest.fn().mockResolvedValue({ data: new Blob(['docx']), error: null });
    mockedCreate.mockReturnValue({ storage: { from: () => ({ download: downloadMock }) } });

    const res = await BailService.generate({ bailleurNom: 'Test' });
    expect(downloadMock).toHaveBeenCalled();
    expect(mockedCreateReport).toHaveBeenCalled();
    expect(Buffer.isBuffer(res)).toBe(true);
  });
});
