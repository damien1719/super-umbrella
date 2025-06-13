/*
  Warnings:

  - Added the required column `Duree` to the `Composants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Composants" ADD COLUMN     "Duree" INTEGER NOT NULL;
