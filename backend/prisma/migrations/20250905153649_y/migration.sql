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

-- CreateTable
CREATE TABLE "psychomot"."SectionShare" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "invitedEmail" VARCHAR(255),
    "invitedUserId" UUID,
    "role" "psychomot"."ShareRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BilanTypeShare_invitedEmail_idx" ON "psychomot"."BilanTypeShare"("invitedEmail");

-- CreateIndex
CREATE INDEX "BilanTypeShare_invitedUserId_idx" ON "psychomot"."BilanTypeShare"("invitedUserId");

-- CreateIndex
CREATE INDEX "SectionShare_invitedEmail_idx" ON "psychomot"."SectionShare"("invitedEmail");

-- CreateIndex
CREATE INDEX "SectionShare_invitedUserId_idx" ON "psychomot"."SectionShare"("invitedUserId");

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeShare" ADD CONSTRAINT "BilanTypeShare_bilanTypeId_fkey" FOREIGN KEY ("bilanTypeId") REFERENCES "psychomot"."BilanType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeShare" ADD CONSTRAINT "BilanTypeShare_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."SectionShare" ADD CONSTRAINT "SectionShare_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."SectionShare" ADD CONSTRAINT "SectionShare_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
