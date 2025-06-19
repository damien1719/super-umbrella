import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawSIE { Oid: number; prTexte: string; Email: string }

export async function seedSIE() {
  console.log('▶️ seedSIE démarré');
  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas }: { datas: any[] } = JSON.parse(raw);

  const sies = datas.map(d => d.SIE as RawSIE);
  const unique = sies.filter((v, i, a) => a.findIndex(x => x.Oid === v.Oid) === i);

  await prisma.sIE.deleteMany();
  await prisma.sIE.createMany({
    data: unique.map(s => ({ Oid: BigInt(s.Oid), prTexte: s.prTexte, email: s.Email })),
    skipDuplicates: true,
  });
  console.log(`✅ SIE seeded (${unique.length})`);
}
