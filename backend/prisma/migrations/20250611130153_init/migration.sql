-- CreateEnum
CREATE TYPE "RegimeCode" AS ENUM ('REAL', 'MICRO');

-- CreateEnum
CREATE TYPE "Civilite" AS ENUM ('M', 'MM');

-- CreateEnum
CREATE TYPE "AmortMethode" AS ENUM ('LINEAIRE', 'DEGRESSIF');

-- CreateTable
CREATE TABLE "exercice" (
    "id" SERIAL NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "regime_code" "RegimeCode" NOT NULL,
    "abattement" DECIMAL(5,2),

    CONSTRAINT "exercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "oid" BIGINT NOT NULL,
    "prTexte" VARCHAR(255) NOT NULL,
    "nif" VARCHAR(20) NOT NULL,
    "nif_readonly" BOOLEAN NOT NULL,
    "civilite" "Civilite",
    "nom" VARCHAR(100) NOT NULL,
    "nomUsage" VARCHAR(100),
    "activiteReadonly" BOOLEAN NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "telephonePersoNum" VARCHAR(50),
    "telephoneMobileNum" VARCHAR(50),

    CONSTRAINT "profile_pkey" PRIMARY KEY ("oid")
);

-- CreateTable
CREATE TABLE "logement" (
    "logementid" BIGINT NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "exploitantOid" BIGINT,

    CONSTRAINT "logement_pkey" PRIMARY KEY ("logementid")
);

-- CreateTable
CREATE TABLE "famille" (
    "familleid" BIGINT NOT NULL,
    "mnem" VARCHAR(50) NOT NULL,
    "codeFiscal" INTEGER NOT NULL,

    CONSTRAINT "famille_pkey" PRIMARY KEY ("familleid")
);

-- CreateTable
CREATE TABLE "compte" (
    "compteid" BIGINT NOT NULL,
    "mnem" VARCHAR(10) NOT NULL,
    "caseCerfa" VARCHAR(5),

    CONSTRAINT "compte_pkey" PRIMARY KEY ("compteid")
);

-- CreateTable
CREATE TABLE "article" (
    "oid" BIGINT NOT NULL,
    "masked" BOOLEAN NOT NULL,
    "mnem" VARCHAR(20),
    "prTexte" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "groupe" TEXT,
    "nonLiee" BOOLEAN NOT NULL,
    "docPrixMin" DECIMAL(10,2),
    "docRequired" BOOLEAN NOT NULL,
    "immoAjout" BOOLEAN NOT NULL,
    "immoGroupe" INTEGER,
    "immoPrixMini" DECIMAL(12,2),
    "commentRequired" BOOLEAN NOT NULL,
    "dureeMini" INTEGER NOT NULL,
    "dureeMaxi" INTEGER NOT NULL,
    "dureeDefaut" INTEGER NOT NULL,
    "dureeRequis" BOOLEAN NOT NULL,
    "modeAvance" BOOLEAN NOT NULL,
    "exploitantRequis" BOOLEAN NOT NULL,
    "periodeRequis" BOOLEAN NOT NULL,
    "immoAide" TEXT,
    "groupeSaisie" TEXT,
    "duplicateMonth" BOOLEAN NOT NULL,
    "familleOid" BIGINT NOT NULL,
    "compteOid" BIGINT,

    CONSTRAINT "article_pkey" PRIMARY KEY ("oid")
);

-- CreateTable
CREATE TABLE "articlelinked" (
    "groupOid" BIGINT NOT NULL,
    "linkedOid" BIGINT NOT NULL,

    CONSTRAINT "articlelinked_pkey" PRIMARY KEY ("groupOid","linkedOid")
);

-- CreateTable
CREATE TABLE "payeur" (
    "payeurid" BIGINT NOT NULL,
    "nom" TEXT,

    CONSTRAINT "payeur_pkey" PRIMARY KEY ("payeurid")
);

-- CreateTable
CREATE TABLE "immobilisation" (
    "immoid" BIGINT NOT NULL,
    "libelle" TEXT,
    "coutHT" DECIMAL(12,2),
    "dateAchat" TIMESTAMP(3),
    "duree" INTEGER,
    "methode" "AmortMethode",

    CONSTRAINT "immobilisation_pkey" PRIMARY KEY ("immoid")
);

-- CreateTable
CREATE TABLE "operation" (
    "operationid" BIGINT NOT NULL,
    "libelle" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "debut" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "montantTtc" DECIMAL(12,2) NOT NULL,
    "montantTva" DECIMAL(12,2),
    "documentUrl" TEXT,
    "exerciceId" INTEGER NOT NULL,
    "logementId" BIGINT,
    "articleId" BIGINT,
    "payeurId" BIGINT,
    "immoId" BIGINT,

    CONSTRAINT "operation_pkey" PRIMARY KEY ("operationid")
);

-- CreateTable
CREATE TABLE "auth_profile" (
    "oid" BIGINT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "classeOid" INTEGER NOT NULL,
    "classeMnem" VARCHAR(50) NOT NULL,
    "trust" BOOLEAN NOT NULL,
    "ro" BOOLEAN NOT NULL,
    "profile" VARCHAR(50) NOT NULL,
    "fullname" VARCHAR(255) NOT NULL,
    "modeAvance" BOOLEAN NOT NULL,
    "logoUrl" TEXT,
    "responsableOid" BIGINT,
    "responsableName" TEXT,
    "responsableImage" TEXT,

    CONSTRAINT "auth_profile_pkey" PRIMARY KEY ("oid")
);

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_exploitantOid_fkey" FOREIGN KEY ("exploitantOid") REFERENCES "profile"("oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_familleOid_fkey" FOREIGN KEY ("familleOid") REFERENCES "famille"("familleid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_compteOid_fkey" FOREIGN KEY ("compteOid") REFERENCES "compte"("compteid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articlelinked" ADD CONSTRAINT "articlelinked_groupOid_fkey" FOREIGN KEY ("groupOid") REFERENCES "article"("oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articlelinked" ADD CONSTRAINT "articlelinked_linkedOid_fkey" FOREIGN KEY ("linkedOid") REFERENCES "article"("oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "exercice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "logement"("logementid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_payeurId_fkey" FOREIGN KEY ("payeurId") REFERENCES "payeur"("payeurid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_immoId_fkey" FOREIGN KEY ("immoId") REFERENCES "immobilisation"("immoid") ON DELETE SET NULL ON UPDATE CASCADE;
