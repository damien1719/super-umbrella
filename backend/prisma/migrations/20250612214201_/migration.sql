-- CreateTable
CREATE TABLE "CerfaDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'cerfa',
    "path" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CerfaDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CerfaDocument_userId_idx" ON "CerfaDocument"("userId");

-- CreateIndex
CREATE INDEX "CerfaDocument_bucket_idx" ON "CerfaDocument"("bucket");
