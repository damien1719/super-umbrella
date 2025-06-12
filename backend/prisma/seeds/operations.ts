import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedOperations() {
  console.log('▶️ seedOperations démarré');

  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/operation.json'),
    'utf-8'
  );
  const { datas } = JSON.parse(raw);

  const rawFY = fs.readFileSync(
    path.join(__dirname, '../seed_json/fiscal_years.json'),
    'utf-8'
  );
  const { datas: fyDatas } = JSON.parse(rawFY);
  const anneeId = fyDatas.length > 0 ? BigInt(fyDatas[0].Oid) : BigInt(0);

  const rawAct = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas: actDatas } = JSON.parse(rawAct);
  const activityId = actDatas.length > 0 ? BigInt(actDatas[0].Oid) : BigInt(0);

  await prisma.operation.deleteMany();
  for (const item of datas) {
    await prisma.operation.create({
      data: {
        id: BigInt(item.Oid),
        libelle: item.Libelle,
        date: new Date(item.Date),
        dateEcheance: item.DateEcheance ? new Date(item.DateEcheance) : null,
        debut: item.Debut ? new Date(item.Debut) : null,
        fin: item.Fin ? new Date(item.Fin) : null,
        montantTtc: item.TTC?.montant || 0,
        montantTva: item.TVA?.montant || 0,
        documentUrl: item.Facture || null,
        activityId,
        anneeId,
        logementId: BigInt(item.Logement.Oid),
        articleId: item.Article?.Oid ? BigInt(item.Article.Oid) : null,
        payeurId: item.Payeur?.Oid ? BigInt(item.Payeur.Oid) : null,
        immoId: item.Immobilisation?.Oid ? BigInt(item.Immobilisation.Oid) : null,
      },
    });
  }
  console.log(`✅ Operations seeded (${datas.length})`);
}
