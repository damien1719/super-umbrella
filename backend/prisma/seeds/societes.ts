import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawSociete { Oid: number; prTexte: string; LogoUrl: string }

export async function seedSocietes() {
  console.log('▶️ seedSocietes démarré');
  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas }: { datas: any[] } = JSON.parse(raw);

  const societes = datas.map(d => d.Societe as RawSociete);
  const unique = societes.filter((v, i, a) => a.findIndex(x => x.Oid === v.Oid) === i);

  await prisma.societe.deleteMany();
  await prisma.societe.createMany({
    data: unique.map(s => ({ Oid: BigInt(s.Oid), prTexte: s.prTexte, logoUrl: s.LogoUrl })),
    skipDuplicates: true,
  });
  console.log(`✅ Societes seeded (${unique.length})`);
}
