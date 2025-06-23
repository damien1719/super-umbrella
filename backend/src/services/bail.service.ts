import { createClient } from '@supabase/supabase-js';
import { createReport, listCommands } from 'docx-templates';

interface Options {
  bailleurNom: string;
  bailleurPrenom: string;
}

export const BailService = {
  async generate({ bailleurNom, bailleurPrenom }: Options): Promise<Buffer> {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? 'http://localhost',
      process.env.SUPABASE_KEY ?? 'key',
    );
    const { data, error } = await supabase.storage
      .from('templates')
      .download('bail-location-meublee.docx');
    if (error || !data) throw new Error('Unable to download template');

    const content = await data.arrayBuffer();

    //Debug
    const cmds = await listCommands(Buffer.from(content), ['{','}'])
    console.log(cmds)

    console.log("testbailleur",bailleurNom);
    const buffer = await createReport({
      template: Buffer.from(content),
      data: { bailleur: { nom: bailleurNom, prenom: bailleurPrenom } },
      cmdDelimiter: ['{', '}'],
    });
    return Buffer.from(buffer);
  },
};
