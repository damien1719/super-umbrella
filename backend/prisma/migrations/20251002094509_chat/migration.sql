-- AlterTable
ALTER TABLE "psychomot"."SectionTemplate" ALTER COLUMN "genPartsSpec" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "psychomot"."Conversation" (
    "id" TEXT NOT NULL,
    "bilanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_bilanId_key" ON "psychomot"."Conversation"("bilanId");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "psychomot"."Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "psychomot"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "psychomot"."Message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "psychomot"."Conversation" ADD CONSTRAINT "Conversation_bilanId_fkey" FOREIGN KEY ("bilanId") REFERENCES "psychomot"."Bilan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "psychomot"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
