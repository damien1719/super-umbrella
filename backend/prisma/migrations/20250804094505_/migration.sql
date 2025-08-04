/*
  Warnings:

  - Added the required column `notesUpdatedAt` to the `BilanSectionInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "psychomot"."BilanSectionInstance" ADD COLUMN     "generatedContentCreatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "generatedContentUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "notesCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notesUpdatedAt" TIMESTAMP(3) NOT NULL;
