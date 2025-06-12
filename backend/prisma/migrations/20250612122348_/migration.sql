/*
  Warnings:

  - You are about to drop the column `anneeId` on the `immobilisation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "immobilisation" DROP CONSTRAINT "immobilisation_anneeId_fkey";

-- DropIndex
DROP INDEX "immobilisation_ActiviteId_anneeId_idx";

-- AlterTable
ALTER TABLE "immobilisation" DROP COLUMN "anneeId";

-- CreateIndex
CREATE INDEX "immobilisation_ActiviteId_idx" ON "immobilisation"("ActiviteId");
