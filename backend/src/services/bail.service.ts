import { createClient } from '@supabase/supabase-js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

interface Options {
  bailleurNom: string;
}

export const BailService = {
  async generate({ bailleurNom }: Options): Promise<Buffer> {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? 'http://localhost',
      process.env.SUPABASE_KEY ?? 'key',
    );
    const { data, error } = await supabase.storage
      .from('templates')
      .download('bail-location-meublee.docx');
    if (error || !data) throw new Error('Unable to download template');

    const content = await data.arrayBuffer();
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render({ bailleur: { nom: bailleurNom } });
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    return Buffer.from(buffer);
  },
};
