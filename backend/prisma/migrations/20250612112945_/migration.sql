-- DropForeignKey
ALTER TABLE "logement" DROP CONSTRAINT "logement_ActiviteId_fkey";

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;
