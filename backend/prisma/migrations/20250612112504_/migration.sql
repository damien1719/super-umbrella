-- DropForeignKey
ALTER TABLE "fiscyear" DROP CONSTRAINT "fiscyear_ActiviteId_fkey";

-- AddForeignKey
ALTER TABLE "fiscyear" ADD CONSTRAINT "fiscyear_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;
