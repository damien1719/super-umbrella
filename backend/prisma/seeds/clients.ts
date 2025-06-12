import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedClients() {
  console.log('▶️ seedClients démarré');
  const raw = fs.readFileSync(
    path.join(__dirname, '../seed_json/activities.json'),
    'utf-8'
  );
  const { datas }: { datas: any[] } = JSON.parse(raw);

  const count = datas.length;

  await prisma.client.deleteMany();
  for (let i = 0; i < count; i++) {
    await prisma.client.create({ data: {} });
  }
  console.log(`✅ Clients seeded (${count})`);
}
