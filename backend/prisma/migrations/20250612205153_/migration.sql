-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_activityId_fkey";

-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_articleId_fkey";

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;
