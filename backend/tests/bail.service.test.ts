import Docxtemplater from 'docxtemplater';
import { BailService } from '../src/services/bail.service';

jest.mock('../src/prisma', () => ({ prisma: {} }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: { from: () => ({ download: jest.fn() }) },
  })),
}));

jest.mock('pizzip', () =>
  jest.fn().mockImplementation(() => ({
    // minimal api used by Docxtemplater
  })),
);

jest.mock('docxtemplater', () =>
  jest.fn().mockImplementation(() => ({
    render: jest.fn(),
    getZip: () => ({ generate: jest.fn(() => Buffer.from('docx')) }),
  })),
);

import { createClient } from '@supabase/supabase-js';

const mockedCreate = createClient as jest.Mock;

describe('BailService.generate', () => {
  it('downloads template and fills docx', async () => {
    const downloadMock = jest.fn().mockResolvedValue({ data: new Blob(['docx']), error: null });
    mockedCreate.mockReturnValue({ storage: { from: () => ({ download: downloadMock }) } });

    const res = await BailService.generate({ bailleurNom: 'Test' });
    expect(downloadMock).toHaveBeenCalled();
    expect(Buffer.isBuffer(res)).toBe(true);
  });
});
