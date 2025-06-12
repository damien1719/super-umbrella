// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedProfiles } from './seeds/profile.ts';
import { seedActivities } from './seeds/activities.ts';
import { seedFormeJuridique } from './seeds/formeJuridique.ts';
import { seedArticles } from './seeds/articles.ts';
import { seedImmobilisations } from './seeds/immobilisations.ts';


// … import des autres seedXxx
//import { seedDernier } from './seeds/08-dernierSeed';

const prisma = new PrismaClient();

async function main() {
  // Ordre respecté (pour respecter les FK si nécessaire)
  await seedProfiles();

  await seedFormeJuridique();
  //await seedRoF();
  //await seedSIE();
  //await seedSocietes();
  //await seedAdresses();
  //await seedClients();

  
  await seedActivities();
  // await seedDevises();
  // await seedCalendriers();
  // await seedLiasses();
  // await seedTeletrans();
  // await seedOGAs();
  // await seedReductionDetails();

  //await seedFiscalYears();

//await seedLogements();
  await seedArticles();
  await seedImmobilisations();
// await seedEmprunts(); 
// await seedOperations();      


}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
