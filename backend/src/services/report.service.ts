import { PDFDocument, StandardFonts, PDFFont, rgb } from 'pdf-lib';
import { FiscalService } from './fiscal.service';
import { AmortissementService } from './amortissement.service';
import { CerfaService } from './cerfa.service';

interface TableRow {
  code: string | null;
  label: string | null;
  amount: number;
}

function formatAmount(value: number): string {
  const formatted = Math.abs(value).toLocaleString('fr-FR');
  return value < 0 ? `(${formatted})` : formatted;
}

function drawFiscalTable(doc: PDFDocument, font: PDFFont, rows: TableRow[], totals: { produits: number; charges: number; resultat: number }) {
  const margin = 50;
  const rowHeight = 20;
  const headerHeight = 20;
  const colWidths = [80, 300, 100];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  let page = doc.addPage();
  let y = page.getSize().height - margin;

  page.drawText(`Tableau fiscal - ${new Date().toLocaleDateString('fr-FR')}`,
    { x: margin, y: y, size: 16, font });
  y -= 30;

  const drawHeader = () => {
    page.drawText('Code', { x: margin + 2, y: y - 15, size: 12, font });
    page.drawText('Libellé', { x: margin + colWidths[0] + 2, y: y - 15, size: 12, font });
    page.drawText('Montant', { x: margin + colWidths[0] + colWidths[1] + 2, y: y - 15, size: 12, font });
    y -= headerHeight;
  };

  const checkPageBreak = () => {
    if (y - rowHeight < margin) {
      page = doc.addPage();
      y = page.getSize().height - margin;
      drawHeader();
    }
  };

  drawHeader();
  let index = 0;
  for (const r of rows) {
    checkPageBreak();
    if (index % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - rowHeight + 4, width: tableWidth, height: rowHeight, color: rgb(0.95, 0.95, 0.95) });
    }
    page.drawText(r.code ?? '', { x: margin + 2, y: y - 15, size: 12, font });
    page.drawText(r.label ?? '', { x: margin + colWidths[0] + 2, y: y - 15, size: 12, font });
    const amountText = formatAmount(r.amount);
    const textWidth = font.widthOfTextAtSize(amountText, 12);
    page.drawText(amountText, { x: margin + colWidths[0] + colWidths[1] + colWidths[2] - textWidth - 2, y: y - 15, size: 12, font });
    y -= rowHeight;
    index++;
  }

  const totalRows: TableRow[] = [
    { code: null, label: 'Produits', amount: totals.produits },
    { code: null, label: 'Charges', amount: totals.charges },
    { code: null, label: 'Résultat', amount: totals.resultat },
  ];
  for (const r of totalRows) {
    checkPageBreak();
    page.drawRectangle({ x: margin, y: y - rowHeight + 4, width: tableWidth, height: rowHeight, color: rgb(0.8, 0.8, 0.8) });
    page.drawText(r.label ?? '', { x: margin + colWidths[0] + 2, y: y - 15, size: 12, font });
    const amountText = formatAmount(r.amount);
    const textWidth = font.widthOfTextAtSize(amountText, 12);
    page.drawText(amountText, { x: margin + colWidths[0] + colWidths[1] + colWidths[2] - textWidth - 2, y: y - 15, size: 12, font });
    y -= rowHeight;
  }
}

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

    const rows: TableRow[] = [];
    for (const g of fiscal.groupes) {
      for (const a of g.articles) {
        rows.push({ code: g.code, label: a.label, amount: a.montant });
      }
      rows.push({ code: g.code, label: `Total ${g.label}`, amount: g.total });
    }

    drawFiscalTable(doc, font, rows, {
      produits: fiscal.produits,
      charges: fiscal.charges,
      resultat: fiscal.resultat,
    });

    let page = doc.addPage();
    const { height: h2 } = page.getSize();
    page.drawText("Tableau d'amortissement", { x: 50, y: h2 - 50, size: 16, font });
    page.drawText(JSON.stringify(amortissements), { x: 50, y: h2 - 80, size: 12, font });

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
