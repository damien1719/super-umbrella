import { createClient } from '@supabase/supabase-js';
import { createReport } from 'docx-templates';

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
    const buffer = await createReport({
      template: Buffer.from(content),
      data: { bailleur: { nom: bailleurNom } },
    });
    return Buffer.from(buffer);
  },
};
