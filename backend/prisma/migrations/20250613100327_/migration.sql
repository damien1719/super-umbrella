/*
  Warnings:

  - Added the required column `activityId` to the `Composants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anneeId` to the `Composants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Composants" ADD COLUMN     "activityId" BIGINT NOT NULL,
ADD COLUMN     "anneeId" BIGINT NOT NULL,
ADD COLUMN     "logementId" BIGINT;

-- AddForeignKey
ALTER TABLE "Composants" ADD CONSTRAINT "Composants_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composants" ADD CONSTRAINT "Composants_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Composants" ADD CONSTRAINT "Composants_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "logement"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;
