// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/01-users';
import { seedArticles } from './seeds/02-articles';
import { seedImmobilisations } from './seeds/immobilisations';
// … import des autres seedXxx
import { seedDernier } from './seeds/08-dernierSeed';

const prisma = new PrismaClient();

async function main() {
  // Ordre respecté (pour respecter les FK si nécessaire)
  await seedUsers();
  await seedArticles();
  await seedImmobilisations();
  // …
  await seedDernier();
}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
