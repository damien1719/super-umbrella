import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedFiscalYears() {
  console.log('▶️ seedFiscalYears démarré');

  const rawFY = fs.readFileSync(
    path.join(__dirname, '../seed_json/fiscal_years.json'),
    'utf-8'
  );
  const { datas } = JSON.parse(rawFY);

  const rawAct = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas: actDatas } = JSON.parse(rawAct);
  //const activityId = actDatas.length > 0 ? BigInt(actDatas[0].Oid) : BigInt(0);
  const activityId = "139054534";

  await prisma.fiscalYear.deleteMany();
  for (const item of datas) {
    await prisma.fiscalYear.create({
      data: {
        id: BigInt(item.Oid),
        prTexte: item.prTexte,
        anneeFiscale: item.AnneeFiscale,
        importCompta: item.importCompta,
        importRCSV: item.importRCSV,
        importDCSV: item.importDCSV,
        repriseCompta: item.RepriseComptabilite,
        clotureVersion: item.ClotureVersion,
        status: item.Status,
        debut: new Date(item.Debut),
        fin: new Date(item.Fin),
        integrale: item.Integrale,
        modeAvance: item.ModeAvance,
        step: item.Step,
        firstYear: item.FirstYear,
        yearCount: item.YearCount,
        hasSIRET: item.HasSIRET,
        dateSoumission: item.DateSoumission || null,
        numeroOGA: item.NumeroOGA || '',
        reductionImpotOGA: item.ReductionImpotOGA ?? 0,
        renoncerRIOGA: item.RenoncerRIOGA ?? false,
        reductionImpotOGALabel: item.ReductionImpotOGALabel || '',
        commentairesClient: item.CommentairesClient || null,
        repartitionVerifier: item.RepartitionVerifier ?? false,
        accesOGA: item.AccesOGA ?? false,
        canCloture: item.CanCloture ?? false,
        validControls: item.ValidControls ?? false,
        testimonial: item.Testimonial ?? false,
        dernierControle: item.DernierControle
          ? new Date(item.DernierControle)
          : new Date(item.Fin),
        activityId,
      },
    });
  }
  console.log(`✅ FiscalYears seeded (${datas.length})`);
}
