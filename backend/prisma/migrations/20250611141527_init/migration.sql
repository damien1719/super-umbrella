-- CreateTable
CREATE TABLE "Emprunt" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "logementId" BIGINT NOT NULL,
    "dateEmprunt" TIMESTAMP(3),
    "dateEcheance" TIMESTAMP(3),
    "dateConstitution" TEXT,
    "capitalEmprunte" DOUBLE PRECISION NOT NULL,
    "capitalInitial" DOUBLE PRECISION NOT NULL,
    "echeancesDiffere" INTEGER NOT NULL,
    "capitalRestant" DOUBLE PRECISION NOT NULL,
    "capitalRestantDate" TIMESTAMP(3),
    "commentairesClient" TEXT,
    "partExclure" INTEGER NOT NULL,
    "partActive" INTEGER NOT NULL,
    "partVentile" INTEGER NOT NULL,
    "taux" DOUBLE PRECISION NOT NULL,
    "tauxType" INTEGER NOT NULL,
    "echeancesInterval" INTEGER NOT NULL,
    "echeancesMontant" DOUBLE PRECISION NOT NULL,
    "assuranceIncluse" BOOLEAN NOT NULL,
    "assuranceType" INTEGER NOT NULL,
    "assuranceTaux" DOUBLE PRECISION NOT NULL,
    "assuranceMontant" DOUBLE PRECISION NOT NULL,
    "DeviseOid" INTEGER NOT NULL,
    "constitue" BOOLEAN NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "Emprunt_pkey" PRIMARY KEY ("Oid")
);

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "logement"("logementid") ON DELETE RESTRICT ON UPDATE CASCADE;
