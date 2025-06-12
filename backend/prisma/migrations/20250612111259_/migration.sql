/*
  Warnings:

  - Made the column `ProfilOid` on table `logement` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "logement" DROP CONSTRAINT "logement_ProfilOid_fkey";

-- AlterTable
ALTER TABLE "logement" ALTER COLUMN "ProfilOid" SET NOT NULL;
