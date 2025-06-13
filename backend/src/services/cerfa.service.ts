import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { prisma } from '../prisma';

interface PrismaWithFiscalYear {
  fiscalYear: {
    findUnique: (args: unknown) => Promise<{ debut: Date; fin: Date } | null>;
  };
}

const db = prisma as unknown as PrismaWithFiscalYear;


interface Generate2031Options {
  anneeId: bigint;
  activityId: bigint;
}

export const CerfaService = {
  async generate2031({ anneeId, activityId: _activityId }: Generate2031Options) {
      
    const supabase = createClient(
      process.env.SUPABASE_URL ?? 'http://localhost',
      process.env.SUPABASE_KEY ?? 'key'
    );

    const fiscal = await db.fiscalYear.findUnique({
      where: { id: anneeId },
      select: { debut: true, fin: true },
    });
    if (!fiscal) throw new Error('Fiscal year not found');

    const { data, error } = await supabase.storage
      .from('cerfa')
      .download('2031-sd_5028.pdf');
    if (error || !data) throw new Error('Unable to download PDF');

    const pdfDoc = await PDFDocument.load(await data.arrayBuffer());
    
    try {
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const page = pdfDoc.getPage(0);
    
      page.drawText(fiscal.debut.toISOString().slice(0, 10), {
        x: 100,     // ← à tester / ajuster !
        y: 500,     // ← à tester / ajuster !
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    
      page.drawText(fiscal.fin.toISOString().slice(0, 10), {
        x: 100,     // ← à tester / ajuster !
        y: 480,     // ← à tester / ajuster !
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    } catch {
      // ignore missing fields
    }
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  },
};
