/*
  Warnings:

  - The primary key for the `Composants` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Composants" DROP CONSTRAINT "Composants_pkey",
ALTER COLUMN "Oid" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Composants_pkey" PRIMARY KEY ("Oid");
