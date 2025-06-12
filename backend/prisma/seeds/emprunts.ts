import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedEmprunts() {
  console.log('▶️ seedEmprunts démarré');

  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/emprunt.json'),
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

  await prisma.emprunt.deleteMany();
  for (const item of datas) {
    await prisma.emprunt.create({
      data: {
        id: BigInt(item.Oid),
        prTexte: item.prTexte,
        libelle: item.Libelle,
        logementId: BigInt(item.Logement.Oid),
        dateEmprunt: item.DateEmprunt ? new Date(item.DateEmprunt) : null,
        dateEcheance: item.DateEcheance ? new Date(item.DateEcheance) : null,
        dateConstitution: item.DateConstitution || null,
        capitalEmprunte: item.CapitalEmprunte?.montant || 0,
        capitalInitial: item.CapitalInitial?.montant || 0,
        echeancesDiffere: item.EcheancesDiffere,
        capitalRestant: item.CapitalRestant?.montant || 0,
        capitalRestantDate: item.CapitalRestantDate
          ? new Date(item.CapitalRestantDate)
          : null,
        commentairesClient: item.CommentairesClient || null,
        partExclure: item.PartExclure,
        partActive: item.PartActive,
        partVentile: item.PartVentile,
        taux: item.Taux,
        tauxType: item.TauxType,
        echeancesInterval: item.EcheancesInterval,
        echeancesMontant: item.EcheancesMontant?.montant || 0,
        assuranceIncluse: Boolean(item.AssuranceIncluse),
        assuranceType: item.AssuranceType,
        assuranceTaux: item.AssuranceTaux,
        assuranceMontant: item.AssuranceMontant?.montant || 0,
        deviseOid: item.Devise?.Oid ?? 0,
        constitue: item.Constitue,
        status: item.Status,
        activityId,
        anneeId,
      },
    });
  }
  console.log(`✅ Emprunts seeded (${datas.length})`);
}
