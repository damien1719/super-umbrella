import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedArticles() {
  const files = [
    'articles_6.json',
    'articles_7.json',
    'articles_16.json',
    'articles_divers.json',
  ];

  let all: any[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(__dirname, '../seed_json', file), 'utf-8');
    const { datas } = JSON.parse(raw);
    if (Array.isArray(datas)) {
      all = all.concat(datas);
    }
  }

  await prisma.article.deleteMany();
  for (const item of all) {
    await prisma.article.create({ data: item as any });
  }
  console.log(`✅ Articles seeded (${all.length})`);
}

