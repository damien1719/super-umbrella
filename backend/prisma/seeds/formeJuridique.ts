import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

interface RawForme { Oid: number; prTexte: string; Invalid: boolean; }

export async function seedFormeJuridique() {
  console.log('▶️ seedFormeJuridique démarré');
  const raw = fs.readFileSync(path.join(__dirname, '../seed_json/activities.json'), 'utf-8');
  const { datas }: { datas: any[] } = JSON.parse(raw);

  // Déduplique et transforme
  const formes = datas
    .map(d => d.FormeJuridique as RawForme)
    .filter((v, i, a) => a.findIndex(x => x.Oid === v.Oid) === i);

  await prisma.formeJuridique.deleteMany();
  await prisma.formeJuridique.createMany({
    data: formes.map(f => ({
      Oid:    BigInt(f.Oid),
      prTexte: f.prTexte,
      invalid: f.Invalid,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ FormeJuridique seeded (${formes.length})`);
}
