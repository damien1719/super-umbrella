/*
  Warnings:

  - A unique constraint covering the columns `[target,styleHash]` on the table `StylePreset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ALTER COLUMN "genPartsSpec" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "psychomot"."StylePreset" ADD COLUMN     "styleHash" VARCHAR(32);

-- CreateIndex
CREATE UNIQUE INDEX "StylePreset_target_styleHash_key" ON "psychomot"."StylePreset"("target", "styleHash");
