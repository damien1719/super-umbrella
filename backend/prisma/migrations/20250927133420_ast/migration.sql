-- AlterTable
ALTER TABLE "psychomot"."Section" ADD COLUMN     "astSnippets" JSONB;

-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ALTER COLUMN "genPartsSpec" SET DEFAULT '{}'::jsonb;
