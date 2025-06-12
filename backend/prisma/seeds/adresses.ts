import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawAdresse {
  NumeroRue: string;
  Adresse: string;
  AdresseComplement: string;
  CodePostal: string;
  Ville: string;
  Etat?: { prTexte: string | null; Mnem: string | null };
  Pays: { prTexte: string; Mnem: string };
}

export async function seedAdresses() {
  console.log('▶️ seedAdresses démarré');
  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas }: { datas: any[] } = JSON.parse(raw);

  const adrs: RawAdresse[] = datas.map(d => d.Adresse as RawAdresse);
  const unique = adrs.filter((v, i, a) =>
    a.findIndex(x =>
      x.NumeroRue === v.NumeroRue &&
      x.Adresse === v.Adresse &&
      x.CodePostal === v.CodePostal &&
      x.Ville === v.Ville
    ) === i
  );

  await prisma.adresse.deleteMany();
  await prisma.adresse.createMany({
    data: unique.map(a => ({
      numeroRue: a.NumeroRue,
      adresse: a.Adresse,
      adresseComplement: a.AdresseComplement || null,
      codePostal: a.CodePostal,
      ville: a.Ville,
      etatTexte: a.Etat?.prTexte ?? null,
      etatMnem: a.Etat?.Mnem ?? null,
      paysTexte: a.Pays.prTexte,
      paysMnem: a.Pays.Mnem,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Adresses seeded (${unique.length})`);
}
