-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_articleId_fkey";

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;
