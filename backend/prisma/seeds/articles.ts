// backend/prisma/seeds/seedArticles.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedArticles() {
  const fiscalYearMap: Record<string, number> = {
    'articles_6.json': 6,
    'articles_7.json': 7,
    'articles_16.json': 16,
    'articles_divers.json': 0, // à adapter
  };

  const files = Object.keys(fiscalYearMap);

  // Accumulateur de tous les enregistrements transformés
  const articlesToInsert: {
    id: number;
    masked: boolean;
    mnem: string | null;
    prTexte: string;
    description: string | null;
    groupe: string | null;
    nonLiee: boolean;
    docPrixMin: number | null;
    docRequired: boolean;
    immoAjout: boolean;
    immoGroupe: number | null;
    immoPrixMini: number | null;
    commentRequired: boolean;
    dureeMini: number;
    dureeMaxi: number;
    dureeDefaut: number;
    dureeRequis: boolean;
    modeAvance: boolean;
    exploitantRequis: boolean;
    periodeRequis: boolean;
    immoAide: string | null;
    groupeSaisie: string | null;
    duplicateMonth: boolean;
    familleOid: number;
    compteOid: number | null;
    //anneeId: number;
  }[] = [];

  for (const file of files) {
    //const anneeId = fiscalYearMap[file];
    //if (!anneeId) throw new Error(`Pas de mapping fiscalYear pour ${file}`);

    const raw = fs.readFileSync(path.join(__dirname, '../seed_json', file), 'utf-8');
    const { datas } = JSON.parse(raw) as { datas: any[] };

    for (const item of datas) {
      if (!item.Famille?.Oid) continue;  // on ne garde que ceux avec Famille

      const compOid = (item.Compte && typeof item.Compte.Oid === 'number')
        ? item.Compte.Oid
        : null;

      articlesToInsert.push({
        id:              item.Oid,
        masked:          item.Masked ?? false,
        mnem:            item.Mnem ?? null,
        prTexte:         item.prTexte ?? '',
        description:     item.Description ?? null,
        groupe:          item.Groupe ?? null,
        nonLiee:         item.NonLiee ?? false,
        docPrixMin:      (typeof item.DocPrixMin === 'number' && item.DocPrixMin >= 0)
                          ? item.DocPrixMin : null,
        docRequired:     item.DocRequired ?? false,
        immoAjout:       item.ImmoAjout ?? false,
        immoGroupe:      typeof item.ImmoGroupe === 'number' ? item.ImmoGroupe : null,
        immoPrixMini:    (typeof item.ImmoPrixMini === 'number' && item.ImmoPrixMini >= 0)
                          ? item.ImmoPrixMini : null,
        commentRequired: item.CommentRequired ?? false,
        dureeMini:       typeof item.DureeMini   === 'number' ? item.DureeMini   : 0,
        dureeMaxi:       typeof item.DureeMaxi   === 'number' ? item.DureeMaxi   : 0,
        dureeDefaut:     typeof item.DureeDefaut === 'number' ? item.DureeDefaut : 0,
        dureeRequis:     item.DureeRequis  ?? false,
        modeAvance:      item.ModeAvance   ?? false,
        exploitantRequis: item.ExploitantRequis ?? false,
        periodeRequis:    item.PeriodeRequis   ?? false,
        immoAide:         item.ImmoAide || null,
        groupeSaisie:     item.GroupeSaisie || null,
        duplicateMonth:   item.DuplicateMonth ?? false,
        familleOid:       item.Famille.Oid,
        compteOid:        compOid,
        //anneeId:          anneeId,
      });
    }
  }

  // Purge et bulk insert avec skipDuplicates
  await prisma.article.deleteMany();
  const result = await prisma.article.createMany({
    data: articlesToInsert,
    skipDuplicates: true,
  });

  console.log(`✅ Articles seeded. Attempted: ${articlesToInsert.length}, Inserted: ${result.count}`);
}
