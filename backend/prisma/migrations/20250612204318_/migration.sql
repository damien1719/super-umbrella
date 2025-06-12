-- CreateTable
CREATE TABLE "Composants" (
    "Oid" INTEGER NOT NULL,
    "Amortissable" BOOLEAN NOT NULL,
    "Ventilation" DOUBLE PRECISION NOT NULL,
    "MiseEnService" TIMESTAMP(3) NOT NULL,
    "DateSortie" TIMESTAMP(3),
    "CauseSortie" INTEGER NOT NULL,
    "Status" INTEGER NOT NULL,
    "PrixProfil_montant" DOUBLE PRECISION NOT NULL,
    "PrixProfil_devise" TEXT NOT NULL,
    "PrixProfil_fmt" TEXT NOT NULL,
    "ValeurSortie_montant" DOUBLE PRECISION,
    "ValeurSortie_devise" TEXT,
    "ValeurSortie_fmt" TEXT,
    "ArticleOid" BIGINT NOT NULL,

    CONSTRAINT "Composants_pkey" PRIMARY KEY ("Oid")
);

-- AddForeignKey
ALTER TABLE "Composants" ADD CONSTRAINT "Composants_ArticleOid_fkey" FOREIGN KEY ("ArticleOid") REFERENCES "article"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;
