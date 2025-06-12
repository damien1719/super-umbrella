-- DropForeignKey
ALTER TABLE "immobilisation" DROP CONSTRAINT "immobilisation_ActiviteId_fkey";

-- AddForeignKey
ALTER TABLE "immobilisation" ADD CONSTRAINT "immobilisation_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;
