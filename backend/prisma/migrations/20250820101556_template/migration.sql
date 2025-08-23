/*
  Warnings:

  - You are about to drop the column `descriptionHtml` on the `Bilan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "psychomot"."Bilan" DROP COLUMN "descriptionHtml",
ADD COLUMN     "descriptionJson" JSONB;

-- AlterTable
ALTER TABLE "psychomot"."BilanSectionInstance" ADD COLUMN     "templateIdUsed" VARCHAR(160),
ADD COLUMN     "templateVersionUsed" INTEGER;

-- AlterTable
ALTER TABLE "psychomot"."Section" ADD COLUMN     "templateOptions" JSONB,
ADD COLUMN     "templateRefId" VARCHAR(160),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "psychomot"."SectionExample" ADD COLUMN     "stylePrompt" TEXT;

-- CreateTable
CREATE TABLE "psychomot"."SectionTemplate" (
    "id" VARCHAR(160) NOT NULL,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "slotsSpec" JSONB NOT NULL,
    "isDeprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "psychomot"."Section" ADD CONSTRAINT "Section_templateRefId_fkey" FOREIGN KEY ("templateRefId") REFERENCES "psychomot"."SectionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
