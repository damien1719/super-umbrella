/*
  Warnings:

  - The primary key for the `profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `oid` on the `profile` table. All the data in the column will be lost.
  - Added the required column `profileId` to the `Bien` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gestion"."Bien" ADD COLUMN     "profileId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."profile" DROP CONSTRAINT "profile_pkey",
DROP COLUMN "oid",
ADD COLUMN     "id" BIGINT NOT NULL,
ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "gestion"."Bien" ADD CONSTRAINT "Bien_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
