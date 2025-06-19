// backend/prisma/seeds/seedComptes.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedComptes() {
  const files = [
    'articles_6.json',
    'articles_7.json',
    'articles_16.json',
    'articles_divers.json',
  ];

  const comptesMap = new Map<number, { id: bigint; mnem: string; caseCerfa: string | null }>();

  for (const file of files) {
    const raw = fs.readFileSync(
      path.join(__dirname, '../seed_json', file),
      'utf-8'
    );
    const { datas } = JSON.parse(raw) as { datas: any[] };

    for (const item of datas) {
      const comp = item.Compte;
      // On vérifie que comp est bien un objet et que Oid est un nombre
      if (comp && typeof comp.Oid === 'number') {
        const oid = comp.Oid;
        if (!comptesMap.has(oid)) {
          comptesMap.set(oid, {
            id: BigInt(oid),
            mnem: comp.Mnem,
            caseCerfa: comp.Case && comp.Case.length > 0 ? comp.Case : null,
          });
        }
      }
    }
  }

  const comptes = Array.from(comptesMap.values());

  // On vide d'abord la table
  await prisma.compte.deleteMany();

  // Puis on insert en bloc
  await prisma.compte.createMany({
    data: comptes,
    skipDuplicates: true,
  });

  console.log(`✅ Comptes seeded (${comptes.length})`);
}
