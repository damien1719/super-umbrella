// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedProfiles } from './seeds/profile.ts';
import { seedActivities } from './seeds/activities.ts';
import { seedFormeJuridique } from './seeds/formeJuridique.ts';
import { seedArticles } from './seeds/articles.ts';
import { seedImmobilisations } from './seeds/immobilisations.ts';
import { seedRoF } from './seeds/rof.ts';
import { seedSIE } from './seeds/sie.ts';
import { seedSocietes } from './seeds/societes.ts';
import { seedAdresses } from './seeds/adresses.ts';
import { seedClients } from './seeds/clients.ts';
import { seedFiscalYears } from './seeds/fiscalYears.ts';
import { seedLogements } from './seeds/logements.ts';
import { seedEmprunts } from './seeds/emprunts.ts';
import { seedOperations } from './seeds/operations.ts';
import { seedFamilles } from './seeds/familles.ts';
import { seedComptes } from './seeds/comptes.ts';
import { seedComposants } from './seeds/composants.ts';
const prisma = new PrismaClient();
async function main() {
    await seedProfiles();
    await seedFormeJuridique();
    await seedRoF();
    await seedSIE();
    await seedSocietes();
    await seedAdresses();
    await seedClients();
    await seedActivities();
    //await seedDevises();
    //await seedCalendriers();
    //await seedLiasses();
    //await seedTeletrans();
    //await seedOGAs();
    //await seedReductionDetails();
    await seedFiscalYears();
    await seedLogements();
    await seedFamilles();
    await seedComptes();
    await seedArticles();
    await seedImmobilisations();
    await seedEmprunts();
    await seedOperations();
    await seedComposants();
}
main()
    .catch(e => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
