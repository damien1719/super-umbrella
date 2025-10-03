/*
  Warnings:

  - Added the required column `role` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "psychomot"."MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- AlterTable
ALTER TABLE "psychomot"."Message" ADD COLUMN     "role" "psychomot"."MessageRole" NOT NULL;

-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ALTER COLUMN "genPartsSpec" SET DEFAULT '{}'::jsonb;
