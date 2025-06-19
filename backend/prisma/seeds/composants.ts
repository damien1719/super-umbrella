import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// ==== re-création de __dirname en ESM ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface RawComposant {
  Oid: number;
  Article: { Oid: number };
  Amortissable: boolean;
  Ventilation: number;
  MiseEnService: string;
  DateSortie: string;
  CauseSortie: number;
  PrixProfil: { montant: number; devise: string; fmt: string };
  ValeurSortie: { montant: number; devise: string; fmt: string };
  Status: number;
}

export async function seedComposants() {
  console.log('▶️ seedComposants démarré');

  // Lecture du fichier JSON
  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/composants.json'),
    'utf-8'
  );
  const { datas }: { datas: { Profil: { Oid: number; Valide: boolean }; Composants: RawComposant[] } } = JSON.parse(raw);

  // Vider la table
  await prisma.composant.deleteMany();

  const toCreate = datas.Composants.map(item => ({
    id: BigInt(item.Oid),
    amortissable: item.Amortissable,
    ventilation: item.Ventilation,
    miseEnService: new Date(item.MiseEnService),
    dateSortie: item.DateSortie ? new Date(item.DateSortie) : null,
    causeSortie: item.CauseSortie,
    status: item.Status,
    duree: item.Duree,

    // PrixProfil
    prixProfilMontant: item.PrixProfil.montant,
    prixProfilDevise: item.PrixProfil.devise,
    prixProfilFmt: item.PrixProfil.fmt,

    // ValeurSortie
    valeurSortieMontant: item.ValeurSortie.montant,
    valeurSortieDevise: item.ValeurSortie.devise,
    valeurSortieFmt: item.ValeurSortie.fmt,

    // Clé étrangère Article
    articleId: BigInt(item.Article.Oid),

    anneeId: BigInt(345319370),
    activityId: BigInt(139054534),
    logementId: BigInt(142493021),
  }));

  await prisma.composant.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Composants seedés (${toCreate.length})`);
}
