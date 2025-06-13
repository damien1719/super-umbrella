/*
  Warnings:

  - You are about to drop the column `insertedAt` on the `CerfaDocument` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CerfaDocument` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CerfaDocument_userId_idx";

-- AlterTable
ALTER TABLE "CerfaDocument" DROP COLUMN "insertedAt",
DROP COLUMN "userId";
