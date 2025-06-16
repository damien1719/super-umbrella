import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FiscalService } from './fiscal.service';
import { AmortissementService } from './amortissement.service';
import { CerfaService } from './cerfa.service';

interface Options {
  anneeId: bigint;
  activityId: bigint;
}

export const ReportService = {
  async generate({ anneeId, activityId }: Options): Promise<Buffer> {
    const [fiscal, amortissements, cerfa2031, cerfa2033] = await Promise.all([
      FiscalService.compute({ anneeId, activityId }),
      AmortissementService.compute({ anneeId, activityId }),
      CerfaService.generate2031({ anneeId, activityId }),
      CerfaService.generate2033({ anneeId, activityId }),
    ]);

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const page1 = doc.addPage();
    const { height: h1 } = page1.getSize();
    page1.drawText('Tableau fiscal', { x: 50, y: h1 - 50, size: 16, font });
    page1.drawText(JSON.stringify(fiscal), { x: 50, y: h1 - 80, size: 12, font });

    const page2 = doc.addPage();
    const { height: h2 } = page2.getSize();
    page2.drawText("Tableau d'amortissement", { x: 50, y: h2 - 50, size: 16, font });
    page2.drawText(JSON.stringify(amortissements), { x: 50, y: h2 - 80, size: 12, font });

    const cerfa2031Doc = await PDFDocument.load(cerfa2031);
    const pages2031 = await doc.copyPages(cerfa2031Doc, cerfa2031Doc.getPageIndices());
    pages2031.forEach(p => doc.addPage(p));

    const cerfa2033Doc = await PDFDocument.load(cerfa2033);
    const pages2033 = await doc.copyPages(cerfa2033Doc, cerfa2033Doc.getPageIndices());
    pages2033.forEach(p => doc.addPage(p));

    const bytes = await doc.save();
    return Buffer.from(bytes);
  },
};
