/*
  Warnings:

  - You are about to drop the column `name` on the `StylePreset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ALTER COLUMN "genPartsSpec" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "psychomot"."StylePreset" DROP COLUMN "name";
