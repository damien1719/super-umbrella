import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
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
    const form = pdfDoc.getForm();
    try {
      form.getTextField('Exercice ouvert le').setText(
        fiscal.debut.toISOString().slice(0, 10)
      );
      form
        .getTextField('et clos le')
        .setText(fiscal.fin.toISOString().slice(0, 10));
    } catch {
      // ignore missing fields
    }
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  },
};
