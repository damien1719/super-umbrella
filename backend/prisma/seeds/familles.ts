// backend/prisma/seeds/seedFamilles.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedFamilles() {
  // Liste de vos fichiers JSON (même liste que pour articles)
  const files = [
    'articles_6.json',
    'articles_7.json',
    'articles_16.json',
    'articles_divers.json',
  ];

  // On va garder un map pour dé-doublonner par Oid
  const famillesMap = new Map<number, { id: bigint; mnem: string; codeFiscal: number }>();

  for (const file of files) {
    const raw = fs.readFileSync(
      path.join(__dirname, '../seed_json', file),
      'utf-8'
    );
    const { datas } = JSON.parse(raw) as { datas: any[] };

    for (const item of datas) {
      const fam = item.Famille;
      if (fam && !famillesMap.has(fam.Oid)) {
        famillesMap.set(fam.Oid, {
          id: BigInt(fam.Oid),
          mnem: fam.Mnem,
          codeFiscal: fam.Code,
        });
      }
    }
  }

  const familles = Array.from(famillesMap.values());

  // On purge la table pour éviter les doublons
  await prisma.famille.deleteMany();

  // On insère tout en une requête
  await prisma.famille.createMany({
    data: familles,
    skipDuplicates: true,   // au cas où
  });

  console.log(`✅ Familles seeded (${familles.length})`);
}
