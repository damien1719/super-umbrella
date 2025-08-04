/*
  Warnings:

  - You are about to drop the column `content` on the `BilanSectionInstance` table. All the data in the column will be lost.
  - Added the required column `contentNotes` to the `BilanSectionInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generatedContent` to the `BilanSectionInstance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "psychomot"."BilanSectionStatus" AS ENUM ('DRAFT', 'GENERATED', 'REFINED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "psychomot"."BilanSectionInstance" DROP COLUMN "content",
ADD COLUMN     "contentNotes" JSONB NOT NULL,
ADD COLUMN     "generatedContent" JSONB NOT NULL,
ADD COLUMN     "status" "psychomot"."BilanSectionStatus" NOT NULL DEFAULT 'DRAFT';
