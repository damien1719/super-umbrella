-- CreateEnum
CREATE TYPE "psychomot"."Job" AS ENUM ('PSYCHOMOTRICIEN', 'ERGOTHERAPEUTE', 'NEUROPSYCHOLOGUE');

-- AlterTable
ALTER TABLE "psychomot"."Section" ADD COLUMN     "job" "psychomot"."Job";
