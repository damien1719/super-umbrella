-- DropForeignKey
ALTER TABLE "Emprunt" DROP CONSTRAINT "Emprunt_activityId_fkey";

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;
