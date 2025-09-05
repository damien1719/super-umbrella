-- CreateEnum
CREATE TYPE "psychomot"."ShareRole" AS ENUM ('VIEWER', 'EDITOR');

-- CreateTable
CREATE TABLE "psychomot"."BilanTypeShare" (
    "id" TEXT NOT NULL,
    "bilanTypeId" TEXT NOT NULL,
    "invitedEmail" VARCHAR(255),
    "invitedUserId" UUID,
    "role" "psychomot"."ShareRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BilanTypeShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BilanTypeShare_invitedEmail_idx" ON "psychomot"."BilanTypeShare"("invitedEmail");

-- CreateIndex
CREATE INDEX "BilanTypeShare_invitedUserId_idx" ON "psychomot"."BilanTypeShare"("invitedUserId");

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeShare" ADD CONSTRAINT "BilanTypeShare_bilanTypeId_fkey" FOREIGN KEY ("bilanTypeId") REFERENCES "psychomot"."BilanType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeShare" ADD CONSTRAINT "BilanTypeShare_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
