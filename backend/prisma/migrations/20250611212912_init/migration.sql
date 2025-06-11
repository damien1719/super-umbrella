/*
  Warnings:

  - The primary key for the `article` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `oid` on the `article` table. All the data in the column will be lost.
  - The primary key for the `immobilisation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `coutHT` on the `immobilisation` table. All the data in the column will be lost.
  - You are about to drop the column `dateAchat` on the `immobilisation` table. All the data in the column will be lost.
  - You are about to drop the column `duree` on the `immobilisation` table. All the data in the column will be lost.
  - You are about to drop the column `immoid` on the `immobilisation` table. All the data in the column will be lost.
  - You are about to drop the column `methode` on the `immobilisation` table. All the data in the column will be lost.
  - The primary key for the `logement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adresse` on the `logement` table. All the data in the column will be lost.
  - You are about to drop the column `exploitantOid` on the `logement` table. All the data in the column will be lost.
  - You are about to drop the column `logementid` on the `logement` table. All the data in the column will be lost.
  - You are about to drop the column `exerciceId` on the `operation` table. All the data in the column will be lost.
  - You are about to drop the `auth_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exercice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activityId` to the `Emprunt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anneeId` to the `Emprunt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Oid` to the `article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anneeId` to the `article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ActiviteId` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Article.Oid` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CauseSortie` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Duree` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Logement.Oid` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MiseEnService` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Oid` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Prix.devise` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Prix.fmt` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Prix.montant` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Status` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ValeurSortie.devise` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ValeurSortie.fmt` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ValeurSortie.montant` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anneeId` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prTexte` to the `immobilisation` table without a default value. This is not possible if the table is not empty.
  - Made the column `libelle` on table `immobilisation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ActiviteId` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CauseVente` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DateAchat` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DateLocation` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DateModification` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NbPieces` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Oid` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adresseComplete` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adresseVide` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classement` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `immobilise` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `libelle` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prTexte` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superficie` to the `logement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityId` to the `operation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anneeId` to the `operation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Emprunt" DROP CONSTRAINT "Emprunt_logementId_fkey";

-- DropForeignKey
ALTER TABLE "articlelinked" DROP CONSTRAINT "articlelinked_groupOid_fkey";

-- DropForeignKey
ALTER TABLE "articlelinked" DROP CONSTRAINT "articlelinked_linkedOid_fkey";

-- DropForeignKey
ALTER TABLE "logement" DROP CONSTRAINT "logement_exploitantOid_fkey";

-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_articleId_fkey";

-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_exerciceId_fkey";

-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_immoId_fkey";

-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_logementId_fkey";

-- AlterTable
ALTER TABLE "Emprunt" ADD COLUMN     "activityId" BIGINT NOT NULL,
ADD COLUMN     "anneeId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "article" DROP CONSTRAINT "article_pkey",
DROP COLUMN "oid",
ADD COLUMN     "Oid" BIGINT NOT NULL,
ADD COLUMN     "anneeId" BIGINT NOT NULL,
ADD CONSTRAINT "article_pkey" PRIMARY KEY ("Oid");

-- AlterTable
ALTER TABLE "immobilisation" DROP CONSTRAINT "immobilisation_pkey",
DROP COLUMN "coutHT",
DROP COLUMN "dateAchat",
DROP COLUMN "duree",
DROP COLUMN "immoid",
DROP COLUMN "methode",
ADD COLUMN     "ActiviteId" BIGINT NOT NULL,
ADD COLUMN     "Article.Oid" BIGINT NOT NULL,
ADD COLUMN     "CauseSortie" INTEGER NOT NULL,
ADD COLUMN     "DateFinalisee" TIMESTAMP(3),
ADD COLUMN     "DateSortie" TIMESTAMP(3),
ADD COLUMN     "Duree" INTEGER NOT NULL,
ADD COLUMN     "Logement.Oid" BIGINT NOT NULL,
ADD COLUMN     "MiseEnService" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Oid" BIGINT NOT NULL,
ADD COLUMN     "Prix.devise" TEXT NOT NULL,
ADD COLUMN     "Prix.fmt" TEXT NOT NULL,
ADD COLUMN     "Prix.montant" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "Status" INTEGER NOT NULL,
ADD COLUMN     "ValeurCauseSortie" TEXT,
ADD COLUMN     "ValeurSortie.devise" TEXT NOT NULL,
ADD COLUMN     "ValeurSortie.fmt" TEXT NOT NULL,
ADD COLUMN     "ValeurSortie.montant" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "anneeId" BIGINT NOT NULL,
ADD COLUMN     "prTexte" TEXT NOT NULL,
ALTER COLUMN "libelle" SET NOT NULL,
ADD CONSTRAINT "immobilisation_pkey" PRIMARY KEY ("Oid");

-- AlterTable
ALTER TABLE "logement" DROP CONSTRAINT "logement_pkey",
DROP COLUMN "adresse",
DROP COLUMN "exploitantOid",
DROP COLUMN "logementid",
ADD COLUMN     "ActiviteId" BIGINT NOT NULL,
ADD COLUMN     "CauseVente" INTEGER NOT NULL,
ADD COLUMN     "DateAchat" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "DateApport" TIMESTAMP(3),
ADD COLUMN     "DateLocation" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "DateModification" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "DateVente" TIMESTAMP(3),
ADD COLUMN     "NbPieces" INTEGER NOT NULL,
ADD COLUMN     "Oid" BIGINT NOT NULL,
ADD COLUMN     "Prix" BIGINT,
ADD COLUMN     "PrixVente" BIGINT,
ADD COLUMN     "ProfilOid" BIGINT,
ADD COLUMN     "adresseComplete" TEXT NOT NULL,
ADD COLUMN     "adresseId" BIGINT,
ADD COLUMN     "adresseVide" BOOLEAN NOT NULL,
ADD COLUMN     "classement" INTEGER NOT NULL,
ADD COLUMN     "immobilise" BOOLEAN NOT NULL,
ADD COLUMN     "libelle" TEXT NOT NULL,
ADD COLUMN     "prTexte" TEXT NOT NULL,
ADD COLUMN     "status" INTEGER NOT NULL,
ADD COLUMN     "superficie" INTEGER NOT NULL,
ADD CONSTRAINT "logement_pkey" PRIMARY KEY ("Oid");

-- AlterTable
ALTER TABLE "operation" DROP COLUMN "exerciceId",
ADD COLUMN     "activityId" BIGINT NOT NULL,
ADD COLUMN     "anneeId" BIGINT NOT NULL;

-- DropTable
DROP TABLE "auth_profile";

-- DropTable
DROP TABLE "exercice";

-- CreateTable
CREATE TABLE "Activity" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "canModify" BOOLEAN NOT NULL,
    "integrale" BOOLEAN NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "coExploitation" BOOLEAN NOT NULL,
    "numeroSIRET" TEXT NOT NULL,
    "tva" BOOLEAN NOT NULL,
    "rofReadonly" BOOLEAN NOT NULL,
    "numeroTVA" TEXT NOT NULL,
    "debutActivite" TIMESTAMP(3) NOT NULL,
    "debutRegimeReel" TEXT,
    "anneeDebutCompta" INTEGER NOT NULL,
    "premiereAnneeOuverte" INTEGER NOT NULL,
    "offre" TEXT NOT NULL,
    "derniereAnneeFermee" INTEGER NOT NULL,
    "canInitiate" BOOLEAN NOT NULL,
    "finActivite" TEXT,
    "finActiviteCause" INTEGER NOT NULL,
    "dateCauseCessation" TEXT,
    "fraisAcquisition" INTEGER NOT NULL,
    "fraisAcquisitionAnnee" INTEGER NOT NULL,
    "fraisAcquisitionLabel" TEXT NOT NULL,
    "annees" INTEGER NOT NULL,
    "anneeCloturee" BOOLEAN NOT NULL,
    "fraisAcquisitionConfirmer" BOOLEAN NOT NULL,
    "fraisAcquisitionOption" BOOLEAN NOT NULL,
    "modifierDebutActivite" BOOLEAN NOT NULL,
    "nbreActivite" INTEGER NOT NULL,
    "hasPaiedYear" BOOLEAN NOT NULL,
    "formeJuridiqueOid" BIGINT,
    "rofOid" BIGINT,
    "roftvaOid" BIGINT,
    "sieOid" BIGINT,
    "societeOid" BIGINT,
    "adresseId" BIGINT,
    "clientId" BIGINT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "FormeJuridique" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "invalid" BOOLEAN NOT NULL,

    CONSTRAINT "FormeJuridique_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "RoF" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT,

    CONSTRAINT "RoF_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "SIE" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "SIE_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "Societe" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,

    CONSTRAINT "Societe_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "Adresse" (
    "id" BIGSERIAL NOT NULL,
    "numeroRue" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "adresseComplement" TEXT,
    "codePostal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "etatTexte" TEXT,
    "etatMnem" TEXT,
    "paysTexte" TEXT NOT NULL,
    "paysMnem" TEXT NOT NULL,

    CONSTRAINT "Adresse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscyear" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "anneeFiscale" INTEGER NOT NULL,
    "importCompta" BOOLEAN NOT NULL,
    "importRCSV" BOOLEAN NOT NULL,
    "importDCSV" BOOLEAN NOT NULL,
    "RepriseComptabilite" BOOLEAN NOT NULL,
    "clotureVersion" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "integrale" BOOLEAN NOT NULL,
    "modeAvance" BOOLEAN NOT NULL,
    "step" INTEGER NOT NULL,
    "FirstYear" BOOLEAN NOT NULL,
    "YearCount" INTEGER NOT NULL,
    "HasSIRET" BOOLEAN NOT NULL,
    "dateSoumission" TEXT,
    "numeroOGA" TEXT NOT NULL,
    "ReductionImpotOGA" INTEGER NOT NULL,
    "renoncerRIOGA" BOOLEAN NOT NULL,
    "reductionImpotOGALabel" TEXT NOT NULL,
    "commentairesClient" TEXT,
    "repartitionVerifier" BOOLEAN NOT NULL,
    "accesOGA" BOOLEAN NOT NULL,
    "CanCloture" BOOLEAN NOT NULL,
    "ValidControls" BOOLEAN NOT NULL,
    "testimonial" BOOLEAN NOT NULL,
    "DernierControle" TIMESTAMP(3) NOT NULL,
    "ActiviteId" BIGINT NOT NULL,

    CONSTRAINT "fiscyear_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" BIGSERIAL NOT NULL,
    "montant" DECIMAL(20,2),
    "devise" TEXT NOT NULL,
    "fmt" TEXT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "immobilisation_ActiviteId_anneeId_idx" ON "immobilisation"("ActiviteId", "anneeId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_formeJuridiqueOid_fkey" FOREIGN KEY ("formeJuridiqueOid") REFERENCES "FormeJuridique"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_rofOid_fkey" FOREIGN KEY ("rofOid") REFERENCES "RoF"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_roftvaOid_fkey" FOREIGN KEY ("roftvaOid") REFERENCES "RoF"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sieOid_fkey" FOREIGN KEY ("sieOid") REFERENCES "SIE"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_societeOid_fkey" FOREIGN KEY ("societeOid") REFERENCES "Societe"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "Adresse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscyear" ADD CONSTRAINT "fiscyear_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "Activity"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "Activity"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_ProfilOid_fkey" FOREIGN KEY ("ProfilOid") REFERENCES "profile"("oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_Prix_fkey" FOREIGN KEY ("Prix") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_PrixVente_fkey" FOREIGN KEY ("PrixVente") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logement" ADD CONSTRAINT "logement_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "Adresse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articlelinked" ADD CONSTRAINT "articlelinked_groupOid_fkey" FOREIGN KEY ("groupOid") REFERENCES "article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articlelinked" ADD CONSTRAINT "articlelinked_linkedOid_fkey" FOREIGN KEY ("linkedOid") REFERENCES "article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobilisation" ADD CONSTRAINT "immobilisation_Article.Oid_fkey" FOREIGN KEY ("Article.Oid") REFERENCES "article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobilisation" ADD CONSTRAINT "immobilisation_Logement.Oid_fkey" FOREIGN KEY ("Logement.Oid") REFERENCES "logement"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobilisation" ADD CONSTRAINT "immobilisation_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "Activity"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobilisation" ADD CONSTRAINT "immobilisation_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "logement"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "logement"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_immoId_fkey" FOREIGN KEY ("immoId") REFERENCES "immobilisation"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;
