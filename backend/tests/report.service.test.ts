import { PDFDocument } from 'pdf-lib';
import { ReportService } from '../src/services/report.service';
import { FiscalService } from '../src/services/fiscal.service';
import { AmortissementService } from '../src/services/amortissement.service';
import { CerfaService } from '../src/services/cerfa.service';

jest.mock('../src/services/fiscal.service');
jest.mock('../src/services/amortissement.service');
jest.mock('../src/services/cerfa.service');

const mockedFiscal = FiscalService as jest.Mocked<typeof FiscalService>;
const mockedAmort = AmortissementService as jest.Mocked<typeof AmortissementService>;
const mockedCerfa = CerfaService as jest.Mocked<typeof CerfaService>;

describe('ReportService.generate', () => {
  it('returns a pdf buffer with fiscal table', async () => {
    mockedFiscal.compute.mockResolvedValueOnce({
      produits: 10,
      charges: 5,
      resultat: 5,
      groupes: [
        {
          code: 'A',
          label: 'Test',
          total: 10,
          articles: [
            { id: 1n, label: 'Article', montant: 10 },
          ],
        },
      ],
    });
    mockedAmort.compute.mockResolvedValueOnce([]);
    const doc = await PDFDocument.create();
    const bytes = await doc.save();
    mockedCerfa.generate2031.mockResolvedValueOnce(Buffer.from(bytes));
    mockedCerfa.generate2033.mockResolvedValueOnce(Buffer.from(bytes));

    const buf = await ReportService.generate({ anneeId: 1n, activityId: 1n });
    expect(Buffer.isBuffer(buf)).toBe(true);
    const pdf = await PDFDocument.load(buf);
    expect(pdf.getPageCount()).toBeGreaterThan(0);
    expect(mockedFiscal.compute).toHaveBeenCalled();
    expect(mockedAmort.compute).toHaveBeenCalled();
    expect(mockedCerfa.generate2031).toHaveBeenCalled();
    expect(mockedCerfa.generate2033).toHaveBeenCalled();
  });
});
