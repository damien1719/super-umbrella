-- CreateEnum
CREATE TYPE "psychomot"."SectionSource" AS ENUM ('USER', 'BILANPLUME');

-- AlterTable
ALTER TABLE "psychomot"."Section" ADD COLUMN     "source" "psychomot"."SectionSource" NOT NULL DEFAULT 'USER';
