-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ADD COLUMN     "genPartsSpec" JSONB NOT NULL DEFAULT '{}'::jsonb;
