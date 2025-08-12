-- AlterEnum
ALTER TYPE "psychomot"."SectionKind" ADD VALUE 'bilan_complet';

-- AlterTable
ALTER TABLE "public"."profile" ADD COLUMN     "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingVersion" TEXT NOT NULL DEFAULT '1';
