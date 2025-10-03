-- CreateEnum
CREATE TYPE "psychomot"."PresetTarget" AS ENUM ('TITLE', 'SUBTITLE', 'PARAGRAPH');

-- CreateEnum
CREATE TYPE "psychomot"."PresetVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ALTER COLUMN "genPartsSpec" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "psychomot"."StylePreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" "psychomot"."PresetTarget" NOT NULL,
    "style" JSONB NOT NULL,
    "visibility" "psychomot"."PresetVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StylePreset_pkey" PRIMARY KEY ("id")
);
