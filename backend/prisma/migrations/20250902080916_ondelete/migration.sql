-- DropForeignKey
ALTER TABLE "psychomot"."BilanTypeSection" DROP CONSTRAINT "BilanTypeSection_bilanTypeId_fkey";

-- DropForeignKey
ALTER TABLE "psychomot"."BilanTypeSection" DROP CONSTRAINT "BilanTypeSection_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "psychomot"."SectionExample" DROP CONSTRAINT "SectionExample_sectionId_fkey";

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeSection" ADD CONSTRAINT "BilanTypeSection_bilanTypeId_fkey" FOREIGN KEY ("bilanTypeId") REFERENCES "psychomot"."BilanType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeSection" ADD CONSTRAINT "BilanTypeSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."SectionExample" ADD CONSTRAINT "SectionExample_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
