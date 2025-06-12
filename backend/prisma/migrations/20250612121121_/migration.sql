-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_compteOid_fkey";

-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_familleOid_fkey";

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_familleOid_fkey" FOREIGN KEY ("familleOid") REFERENCES "famille"("familleid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_compteOid_fkey" FOREIGN KEY ("compteOid") REFERENCES "compte"("compteid") ON DELETE CASCADE ON UPDATE CASCADE;
