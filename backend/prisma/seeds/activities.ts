// prisma/seeds/activity.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// ==== re-création de __dirname en ESM ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface RawActivity {
  Oid: number;
  prTexte: string;
  CanModify: boolean;
  Integrale: boolean;
  RaisonSociale: string;
  FormeJuridique: { Oid: number; prTexte: string; Invalid: boolean };
  CoExploitation: boolean;
  NumeroSIRET: string;
  TVA: boolean;
  ROF: { Oid: number; prTexte: string };
  ROFTVA: { Oid: number | null; prTexte: string | null };
  ROFReadonly: boolean;
  NumeroTVA: string;
  SIE: { Oid: number; Email: string; prTexte: string };
  DebutActivite: string;
  DebutRegimeReel: string;
  AnneeDebutCompta: number;
  PremiereAnneeOuverte: number;
  Offre: string;
  Societe: { Oid: number; prTexte: string; LogoUrl: string };
  DerniereAnneeFermee: number;
  CanInitiate: boolean;
  FinActivite: string;
  FinActiviteCause: number;
  DateCauseCessation: string;
  FraisAcquisition: number;
  FraisAcquisitionAnnee: number;
  FraisAcquisitionLabel: string;
  Annees: number;
  AnneeCloturee: boolean;
  FraisAcquisitionConfirmer: boolean;
  FraisAcquisitionOption: boolean;
  ModifierDebutActivite: boolean;
  NbreActivite: number;
  hasPaiedYear: boolean;
  // on omet les nested objets non mappés ici (Adresse, Client, etc.)
}

export async function seedActivities() {
  console.log('▶️ seedActivities démarré');

  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas }: { datas: RawActivity[] } = JSON.parse(raw);

  // Vider la table
  await prisma.activity.deleteMany();

  const toCreate = datas.map(item => ({
    id: BigInt(item.Oid),
    prTexte: item.prTexte,
    canModify: item.CanModify,
    integrale: item.Integrale,
    raisonSociale: item.RaisonSociale,
    //formeJuridiqueOid: BigInt(item.FormeJuridique.Oid),
    coExploitation: item.CoExploitation,
    numeroSIRET: item.NumeroSIRET,
    tva: item.TVA,
    //rofOid: BigInt(item.ROF.Oid),
    //roftvaOid: item.ROFTVA.Oid !== null ? BigInt(item.ROFTVA.Oid) : null,
    rofReadonly: item.ROFReadonly,
    numeroTVA: item.NumeroTVA,
    debutActivite: new Date(item.DebutActivite),
    debutRegimeReel: item.DebutRegimeReel || null,
    anneeDebutCompta: item.AnneeDebutCompta,
    premiereAnneeOuverte: item.PremiereAnneeOuverte,
    offre: item.Offre,
    derniereAnneeFermee: item.DerniereAnneeFermee,
    canInitiate: item.CanInitiate,
    finActivite: item.FinActivite || null,
    finActiviteCause: item.FinActiviteCause,
    dateCauseCessation: item.DateCauseCessation || null,
    fraisAcquisition: item.FraisAcquisition,
    fraisAcquisitionAnnee: item.FraisAcquisitionAnnee,
    fraisAcquisitionLabel: item.FraisAcquisitionLabel,
    annees: item.Annees,
    anneeCloturee: item.AnneeCloturee,
    fraisAcquisitionConfirmer: item.FraisAcquisitionConfirmer,
    fraisAcquisitionOption: item.FraisAcquisitionOption,
    modifierDebutActivite: item.ModifierDebutActivite,
    nbreActivite: item.NbreActivite,
    hasPaiedYear: item.hasPaiedYear,
    // relations facultatives (à seed séparément si nécessaire)
    //societeOid: BigInt(item.Societe.Oid),
    //sieOid: BigInt(item.SIE.Oid),
    //adresseId: null,
    //clientId: null,
  }));

  await prisma.activity.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Activities seeded (${toCreate.length})`);
}
