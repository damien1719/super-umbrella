// backend/prisma/seeds/seedImmobilisations.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO : adaptez ces IDs à votre contexte
const DEFAULT_ACTIVITY_ID = "139054534";

export async function seedImmobilisations() {
  // Si vous avez plusieurs fichiers, listez-les ici
  const files = [
    'immobilisations.json',
    // 'immobilisations_2.json',
  ];

  const rows: Array<{
    id: bigint;
    prTexte: string;
    libelle: string;
    dateFinalisee: Date | null;
    miseEnService: Date;
    duree: number;
    dateSortie: Date | null;
    valeurSortieMontant: number;
    valeurSortieDevise: string;
    valeurSortieFmt: string;
    causeSortie: number;
    valeurCauseSortie: string | null;
    status: number;
    prixMontant: number;
    prixDevise: string;
    prixFmt: string;
    articleOid: bigint;
    logementOid: bigint;
    activityId: bigint;
  }> = [];

  for (const file of files) {
    const raw = fs.readFileSync(
      path.join(__dirname, '../seed_json', file),
      'utf-8'
    );
    const { datas } = JSON.parse(raw) as { datas: any[] };

    for (const item of datas) {
      // Vérifications basiques
      if (
        typeof item.Oid !== 'number' ||
        !item.Article?.Oid ||
        !item.Logement?.Oid
      ) {
        console.warn(`⏭️ Ignored immobilisation, Oid manquant:`, item);
        continue;
      }

      // Parsing dates
      const parseDate = (s: string): Date | null =>
        s && !s.startsWith('0000') ? new Date(s) : null;

      rows.push({
        id: BigInt(item.Oid),
        prTexte: String(item.prTexte ?? ''),
        libelle: String(item.Libelle ?? ''),
        dateFinalisee: parseDate(item.DateFinalisee),
        miseEnService: parseDate(item.MiseEnService) ?? new Date(), // champ non nullable
        duree: Number(item.Duree ?? 0),
        dateSortie: parseDate(item.DateSortie),
        valeurSortieMontant: Number(item.ValeurSortie?.montant ?? 0),
        valeurSortieDevise: String(item.ValeurSortie?.devise ?? 'EUR'),
        valeurSortieFmt: String(item.ValeurSortie?.fmt ?? ''),
        causeSortie: Number(item.CauseSortie ?? 0),
        valeurCauseSortie: item.ValeurCauseSortie || null,
        status: Number(item.Status ?? 0),

        // aplatissement de Prix
        prixMontant: Number(item.Prix?.montant ?? 0),
        prixDevise: String(item.Prix?.devise ?? 'EUR'),
        prixFmt: String(item.Prix?.fmt ?? ''),

        // relations scalaires
        articleOid: BigInt(item.Article.Oid),
        logementOid: BigInt(item.Logement.Oid),
        activityId: BigInt(DEFAULT_ACTIVITY_ID),
      });
    }
  }

  // purge et insertion en lot
  await prisma.immobilisation.deleteMany();
  const result = await prisma.immobilisation.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(
    `✅ Immobilisations seeded. Tentatives: ${rows.length}, Insérées: ${result.count}`
  );
}
