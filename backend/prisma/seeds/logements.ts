import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedLogements() {
  console.log('▶️ seedLogements démarré');

  const rawData = fs.readFileSync(
    path.join(__dirname, '../seed_json/logement.json'),
    'utf-8'
  );
  const { datas } = JSON.parse(rawData);

  const rawAct = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas: actDatas } = JSON.parse(rawAct);
  const activityId = actDatas.length > 0 ? BigInt(actDatas[0].Oid) : BigInt(0);

  await prisma.logement.deleteMany();
  for (const item of datas) {
    await prisma.logement.create({
      data: {
        id: BigInt(item.Oid),
        libelle: item.Libelle,
        prTexte: item.prTexte,
        adresseVide: item.AdresseVide,
        dateLocation: new Date(item.DateLocation),
        dateVente: item.DateVente ? new Date(item.DateVente) : null,
        causeVente: item.CauseVente,
        dateAchat: new Date(item.DateAchat),
        dateApport: item.DateApport ? new Date(item.DateApport) : null,
        adresseComplete: item.AdresseComplete,
        superficie: item.Superficie,
        nbPieces: item.NbPieces,
        classement: item.Classement,
        immobilise: item.Immobilise,
        dateModification: new Date(item.DateModification),
        status: item.Status,
        activityId,
        profilOid: item.ProfilOid ? BigInt(item.ProfilOid) : null,
      },
    });
  }
  console.log(`✅ Logements seeded (${datas.length})`);
}
