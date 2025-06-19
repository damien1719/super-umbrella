// prisma/seeds/profile.ts
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface RawProfile {
  oid: number;
  id: string;
  classeoid: number;
  classemnem: string;
  trust: boolean;
  ro: boolean;
  user: string;
  profile: string;
  name: string;
  modeavance: boolean;
  LogoUrl: string;
  responsable: {
    oid: number;
    name: string;
    image: string;
  };
}

export async function seedProfiles() {

  // Lire le JSON brut
  const raw = fs.readFileSync(path.join(__dirname, '../seed_json/profile.json'), 'utf-8');
  const { datas }: { datas: RawProfile[] } = JSON.parse(raw);

  // Vider la table avant d'insérer
  await prisma.profile.deleteMany();

  // Préparer et insérer
  const toCreate = datas.map(item => {
    // Séparer prénom / nom depuis le champ name
    const [prenom, ...rest] = item.name.split(' ');
    const nom = rest.join(' ');

    return {
      oid: BigInt(item.oid),
      prTexte: item.profile,            // Texte de profil tel que "Client"
      nif: item.id,                     // Identifiant (email)
      nifReadonly: item.ro,             // drapeau readonly
      civilite: null,                   // non fourni dans le JSON
      nom,
      nomUsage: null,                   // non fourni
      activiteReadonly: item.modeavance,
      prenom,
      email: item.user,                 // email utilisateur
      telephonePersoNum: null,          // non fourni
      telephoneMobileNum: null,         // non fourni
    };
  });

  await prisma.profile.createMany({
    data: toCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Profiles seeded (${toCreate.length})`);
}
