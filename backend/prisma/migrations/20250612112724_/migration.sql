/*
  Warnings:

  - You are about to drop the column `ProfilOid` on the `logement` table. All the data in the column will be lost.
  - Added the required column `profilOid` to the `logement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "logement" DROP COLUMN "ProfilOid",
ADD COLUMN     "profilOid" BIGINT NOT NULL;
