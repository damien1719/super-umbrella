// prisma/seeds/immobilisations.ts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedImmobilisations() {
  const raw = fs.readFileSync(path.join(__dirname, '../seed_json/immobilisations.json'), 'utf-8');
  const { datas } = JSON.parse(raw);

  // Vider la table avant d'insérer
  await prisma.immobilisation.deleteMany();

  // Préparer et insérer
  const toCreate = datas.map(item => ({
    oid: BigInt(item.Oid),
    articleOid: BigInt(item.Article.Oid),
    mnem: item.Article.Mnem,
    prTexte: item.prTexte,
    description: item.Article.Description || '',
    compteMnem: item.Article.Compte.Mnem,
    prixMontant: item.Prix.montant,
    prixDevise: item.Prix.devise,
    miseEnService: new Date(item.MiseEnService),
    duree: item.Duree,
    status: item.Status,
  }));

  await prisma.immobilisation.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Immobilisations seeded (${toCreate.length})`);
}
