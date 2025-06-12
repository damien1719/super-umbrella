// prisma/seeds/immobilisations.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedImmobilisations() {
  const files = ['immobilisations.json', 'immobilisations2.json'];
  let all: any[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(__dirname, '../seed_json', file), 'utf-8');
    const parsed = JSON.parse(raw);
    const datas = Array.isArray(parsed.datas) ? parsed.datas : parsed.datas?.Composants || [];
    all = all.concat(datas);
  }

  await prisma.immobilisation.deleteMany();
  for (const item of all) {
    await prisma.immobilisation.create({ data: item as any });
  }
  console.log(`✅ Immobilisations seeded (${all.length})`);
}

