/*
  Warnings:

  - You are about to drop the column `anneeId` on the `article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_anneeId_fkey";

-- AlterTable
ALTER TABLE "article" DROP COLUMN "anneeId";
