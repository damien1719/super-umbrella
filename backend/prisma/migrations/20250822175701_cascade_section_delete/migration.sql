-- DropForeignKey
ALTER TABLE "psychomot"."BilanSectionInstance" DROP CONSTRAINT "BilanSectionInstance_bilanId_fkey";

-- DropForeignKey
ALTER TABLE "psychomot"."BilanSectionInstance" DROP CONSTRAINT "BilanSectionInstance_sectionId_fkey";

-- AddForeignKey
ALTER TABLE "psychomot"."BilanSectionInstance" ADD CONSTRAINT "BilanSectionInstance_bilanId_fkey" FOREIGN KEY ("bilanId") REFERENCES "psychomot"."Bilan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanSectionInstance" ADD CONSTRAINT "BilanSectionInstance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
