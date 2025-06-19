import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawRoF { Oid: number; prTexte: string | null }

export async function seedRoF() {
  console.log('▶️ seedRoF démarré');
  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas }: { datas: any[] } = JSON.parse(raw);

  const rofs: RawRoF[] = [];
  for (const act of datas) {
    if (act.ROF) rofs.push(act.ROF as RawRoF);
    if (act.ROFTVA && act.ROFTVA.Oid !== null) rofs.push(act.ROFTVA as RawRoF);
  }

  const unique = rofs.filter((v, i, a) => a.findIndex(x => x.Oid === v.Oid) === i);

  await prisma.roF.deleteMany();
  await prisma.roF.createMany({
    data: unique.map(r => ({ Oid: BigInt(r.Oid), prTexte: r.prTexte ?? null })),
    skipDuplicates: true,
  });
  console.log(`✅ RoF seeded (${unique.length})`);
}
