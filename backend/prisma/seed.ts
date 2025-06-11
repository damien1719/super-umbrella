// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedProfiles } from './seeds/profile.ts';
import { seedActivities } from './seeds/activities.ts';

// … import des autres seedXxx
//import { seedDernier } from './seeds/08-dernierSeed';

const prisma = new PrismaClient();

async function main() {
  // Ordre respecté (pour respecter les FK si nécessaire)
  await seedProfiles();
  await seedActivities();
  //await seedArticles();
  //await seedImmobilisations();
  // …
  //await seedDernier();
}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
