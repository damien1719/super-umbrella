-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "gestion";

-- CreateEnum
CREATE TYPE "public"."RegimeCode" AS ENUM ('REAL', 'MICRO');

-- CreateEnum
CREATE TYPE "public"."AmortMethode" AS ENUM ('LINEAIRE', 'DEGRESSIF');

-- CreateEnum
CREATE TYPE "gestion"."Civilite" AS ENUM ('M', 'MM');

-- CreateEnum
CREATE TYPE "gestion"."TypeBien" AS ENUM ('APPARTEMENT', 'MAISON', 'CHAMBRE_PRIVATIVE', 'LOCAL_COMMERCIAL', 'LOCAL_PROFESSIONNEL', 'PARKING', 'ENTREPOT_ATELIER', 'AUTRE');

-- CreateEnum
CREATE TYPE "gestion"."RegimeJuridique" AS ENUM ('COPROPRIETE', 'MONOPROPRIETE');

-- CreateEnum
CREATE TYPE "gestion"."DPE" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G');

-- CreateEnum
CREATE TYPE "gestion"."TypeChauffage" AS ENUM ('GAZ', 'ELECTRIQUE', 'FIOUL', 'BOIS');

-- CreateEnum
CREATE TYPE "gestion"."TypeEauChaude" AS ENUM ('GAZ', 'ELECTRIQUE');

-- CreateEnum
CREATE TYPE "gestion"."CuisineType" AS ENUM ('INDEPENDANTE', 'AMERICAINE', 'SANS');

-- CreateEnum
CREATE TYPE "gestion"."EquipementDivers" AS ENUM ('GARDIEN', 'INTERPHONE', 'ANTENNE_TV_COLLECTIVE', 'ASCENSEUR', 'LOCAL_VELOS', 'LOCAL_POUBELLES');

-- CreateEnum
CREATE TYPE "gestion"."EquipementNTIC" AS ENUM ('FIBRE_OPTIQUE', 'CABLE', 'BOX', 'ANTENNE', 'AUTRE');

-- CreateEnum
CREATE TYPE "gestion"."AutreTypeChauffage" AS ENUM ('POMPE_A_CHALEUR', 'INSERT_BOIS', 'POELE_A_BOIS', 'POELE_A_GRANULES', 'CHEMINEE', 'CLIM', 'CLIM_REVERSIBLE');

-- CreateEnum
CREATE TYPE "gestion"."DocumentType" AS ENUM ('BAIL', 'DPE', 'ETAT_DES_LIEUX', 'FACTURE', 'PHOTO', 'LOCATAIRE_ID', 'JUSTIF_DOMICILE', 'AUTRE');

-- CreateEnum
CREATE TYPE "gestion"."TypeLocataire" AS ENUM ('PARTICULIER', 'PROFESSIONNEL');

-- CreateEnum
CREATE TYPE "gestion"."TypePieceIdentite" AS ENUM ('CNI', 'PASSEPORT', 'PERMIS', 'AUTRE');

-- CreateEnum
CREATE TYPE "gestion"."DepositType" AS ENUM ('ONE_MONTH', 'TWO_MONTHS', 'OTHER');

-- CreateEnum
CREATE TYPE "gestion"."ReferenceQuarter" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- CreateEnum
CREATE TYPE "gestion"."PreviousRentalSituation" AS ENUM ('FIRST_TIME', 'NO_CONTRACT_LAST_18_MONTH', 'HAD_CONTRACT_LAST_18_MONTH');

-- CreateEnum
CREATE TYPE "gestion"."PaymentTerm" AS ENUM ('A_ECHOIR', 'ECHU');

-- CreateEnum
CREATE TYPE "gestion"."PaymentMethod" AS ENUM ('VIREMENT', 'CHEQUE', 'AUTRE');

-- CreateEnum
CREATE TYPE "gestion"."RecoverableChargesMethod" AS ENUM ('PROVISION', 'FORFAITAIRE', 'PERIODIQUE');

-- CreateEnum
CREATE TYPE "gestion"."TypeBail" AS ENUM ('MEUBLE');

-- CreateEnum
CREATE TYPE "gestion"."UsageDestination" AS ENUM ('HABITATION', 'COMMERCIAL', 'MIXTE');

-- CreateEnum
CREATE TYPE "gestion"."Mobilier" AS ENUM ('BOUILLOIRE', 'PORTE_SERVIETTES', 'POUBELLE_SDB', 'POUBELLE_WC', 'ETENDOIR_A_LINGE', 'SERVIETTES_TOILETTE', 'ASPIRATEUR', 'LAVE_LINGE', 'SECHE_LINGE', 'PLANCHE_A_REPASSER', 'CAFETIERE', 'THEIERE', 'TELEVISION', 'LECTEUR_DVD', 'CHAINE_HIFI', 'RADIO', 'FER_A_REPASSER', 'TABLE_BASSE', 'TABLE_DE_CHEVET', 'BUREAU', 'FAUTEUIL_DE_BUREAU', 'FAUTEUIL', 'ARMOIRE', 'PENDERIE', 'COMMODE', 'ETAGERE_DE_RANGEMENT', 'TAIE_D_OREILLER', 'VOLET', 'RIDEAU', 'STORE_OCCULTANT', 'STORE', 'AUTRE_OCCULTATION', 'LUMINAIRE', 'ALESE', 'DRAP_HOUSSE', 'DRAP', 'COUETTE', 'COUVERTURE');

-- CreateTable
CREATE TABLE "public"."profile" (
    "oid" BIGINT NOT NULL,
    "prTexte" VARCHAR(255) NOT NULL,
    "nif" VARCHAR(255) NOT NULL,
    "nif_readonly" BOOLEAN NOT NULL,
    "civilite" "gestion"."Civilite",
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
CREATE TABLE "public"."Activity" (
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
CREATE TABLE "public"."FormeJuridique" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "invalid" BOOLEAN NOT NULL,

    CONSTRAINT "FormeJuridique_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."RoF" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT,

    CONSTRAINT "RoF_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."SIE" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "SIE_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."Societe" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,

    CONSTRAINT "Societe_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."Adresse" (
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
CREATE TABLE "public"."Client" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fiscyear" (
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
CREATE TABLE "public"."logement" (
    "Oid" BIGINT NOT NULL,
    "profilOid" BIGINT NOT NULL,
    "libelle" TEXT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "adresseVide" BOOLEAN NOT NULL,
    "DateLocation" TIMESTAMP(3) NOT NULL,
    "DateVente" TIMESTAMP(3),
    "CauseVente" INTEGER NOT NULL,
    "DateAchat" TIMESTAMP(3) NOT NULL,
    "DateApport" TIMESTAMP(3),
    "adresseComplete" TEXT NOT NULL,
    "superficie" INTEGER NOT NULL,
    "NbPieces" INTEGER NOT NULL,
    "classement" INTEGER NOT NULL,
    "immobilise" BOOLEAN NOT NULL,
    "DateModification" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "ActiviteId" BIGINT NOT NULL,
    "Prix" BIGINT,
    "PrixVente" BIGINT,
    "adresseId" BIGINT,

    CONSTRAINT "logement_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" BIGSERIAL NOT NULL,
    "montant" DECIMAL(20,2),
    "devise" TEXT NOT NULL,
    "fmt" TEXT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."famille" (
    "familleid" BIGINT NOT NULL,
    "mnem" VARCHAR(50) NOT NULL,
    "codeFiscal" INTEGER NOT NULL,

    CONSTRAINT "famille_pkey" PRIMARY KEY ("familleid")
);

-- CreateTable
CREATE TABLE "public"."compte" (
    "compteid" BIGINT NOT NULL,
    "mnem" VARCHAR(10) NOT NULL,
    "caseCerfa" VARCHAR(155),

    CONSTRAINT "compte_pkey" PRIMARY KEY ("compteid")
);

-- CreateTable
CREATE TABLE "public"."article" (
    "Oid" BIGINT NOT NULL,
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

    CONSTRAINT "article_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."articlelinked" (
    "groupOid" BIGINT NOT NULL,
    "linkedOid" BIGINT NOT NULL,

    CONSTRAINT "articlelinked_pkey" PRIMARY KEY ("groupOid","linkedOid")
);

-- CreateTable
CREATE TABLE "public"."immobilisation" (
    "Oid" BIGINT NOT NULL,
    "prTexte" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "DateFinalisee" TIMESTAMP(3),
    "MiseEnService" TIMESTAMP(3) NOT NULL,
    "Duree" INTEGER NOT NULL,
    "DateSortie" TIMESTAMP(3),
    "ValeurSortie.montant" DOUBLE PRECISION NOT NULL,
    "ValeurSortie.devise" TEXT NOT NULL,
    "ValeurSortie.fmt" TEXT NOT NULL,
    "CauseSortie" INTEGER NOT NULL,
    "ValeurCauseSortie" TEXT,
    "Status" INTEGER NOT NULL,
    "Prix.montant" DOUBLE PRECISION NOT NULL,
    "Prix.devise" TEXT NOT NULL,
    "Prix.fmt" TEXT NOT NULL,
    "Article.Oid" BIGINT NOT NULL,
    "Logement.Oid" BIGINT NOT NULL,
    "ActiviteId" BIGINT NOT NULL,

    CONSTRAINT "immobilisation_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."Composants" (
    "Oid" BIGINT NOT NULL,
    "Amortissable" BOOLEAN NOT NULL,
    "Ventilation" DOUBLE PRECISION NOT NULL,
    "MiseEnService" TIMESTAMP(3) NOT NULL,
    "DateSortie" TIMESTAMP(3),
    "CauseSortie" INTEGER NOT NULL,
    "Status" INTEGER NOT NULL,
    "Duree" INTEGER NOT NULL,
    "PrixProfil_montant" DOUBLE PRECISION NOT NULL,
    "PrixProfil_devise" TEXT NOT NULL,
    "PrixProfil_fmt" TEXT NOT NULL,
    "ValeurSortie_montant" DOUBLE PRECISION,
    "ValeurSortie_devise" TEXT,
    "ValeurSortie_fmt" TEXT,
    "ArticleOid" BIGINT NOT NULL,
    "activityId" BIGINT NOT NULL,
    "anneeId" BIGINT NOT NULL,
    "logementId" BIGINT,

    CONSTRAINT "Composants_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."Emprunt" (
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
    "activityId" BIGINT NOT NULL,
    "anneeId" BIGINT NOT NULL,

    CONSTRAINT "Emprunt_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."echeance_emprunt" (
    "Oid" BIGINT NOT NULL,
    "Article.Oid" BIGINT NOT NULL,
    "logementId" BIGINT NOT NULL,
    "DateAchat" TIMESTAMP(3) NOT NULL,
    "YearAchat" INTEGER NOT NULL,
    "Libelle" TEXT NOT NULL,
    "Capital.montant" DECIMAL(14,2) NOT NULL,
    "Capital.devise" TEXT NOT NULL,
    "Capital.fmt" TEXT NOT NULL,
    "Assurance.montant" DECIMAL(14,2) NOT NULL,
    "Assurance.devise" TEXT NOT NULL,
    "Assurance.fmt" TEXT NOT NULL,
    "Frais.montant" DECIMAL(14,2) NOT NULL,
    "Frais.devise" TEXT NOT NULL,
    "Frais.fmt" TEXT NOT NULL,
    "Interets.montant" DECIMAL(14,2) NOT NULL,
    "Interets.devise" TEXT NOT NULL,
    "Interets.fmt" TEXT NOT NULL,
    "Total.montant" DECIMAL(14,2) NOT NULL,
    "Total.devise" TEXT NOT NULL,
    "Total.fmt" TEXT NOT NULL,
    "Status" BOOLEAN NOT NULL,

    CONSTRAINT "echeance_emprunt_pkey" PRIMARY KEY ("Oid")
);

-- CreateTable
CREATE TABLE "public"."operation" (
    "operationid" BIGINT NOT NULL,
    "libelle" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "debut" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "montantTtc" DECIMAL(12,2) NOT NULL,
    "montantTva" DECIMAL(12,2),
    "documentUrl" TEXT,
    "activityId" BIGINT NOT NULL,
    "anneeId" BIGINT NOT NULL,
    "logementId" BIGINT,
    "articleId" BIGINT,
    "payeurId" BIGINT,
    "immoId" BIGINT,

    CONSTRAINT "operation_pkey" PRIMARY KEY ("operationid")
);

-- CreateTable
CREATE TABLE "public"."payeur" (
    "payeurid" BIGINT NOT NULL,
    "nom" TEXT,

    CONSTRAINT "payeur_pkey" PRIMARY KEY ("payeurid")
);

-- CreateTable
CREATE TABLE "public"."CerfaDocument" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'cerfa',
    "path" TEXT NOT NULL,

    CONSTRAINT "CerfaDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fec_entry" (
    "id" SERIAL NOT NULL,
    "JournalCode" VARCHAR(5) NOT NULL,
    "JournalLib" VARCHAR(200) NOT NULL,
    "EcritureNum" VARCHAR(50) NOT NULL,
    "EcritureDate" DATE NOT NULL,
    "CompteNum" VARCHAR(20) NOT NULL,
    "CompteLib" VARCHAR(200) NOT NULL,
    "CompAuxNum" VARCHAR(20),
    "CompAuxLib" VARCHAR(200),
    "PieceRef" VARCHAR(200),
    "PieceDate" DATE,
    "EcritureLib" VARCHAR(200) NOT NULL,
    "Debit" DECIMAL(18,2) NOT NULL,
    "Credit" DECIMAL(18,2) NOT NULL,
    "EcritureLet" VARCHAR(40),
    "DateLet" DATE,
    "ValidDate" DATE,
    "Montantdevise" DECIMAL(18,2),
    "Idevise" CHAR(3),

    CONSTRAINT "fec_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fiscal_bridge" (
    "id" BIGSERIAL NOT NULL,
    "fiscal_year_id" BIGINT NOT NULL,
    "accounting_result" DECIMAL(14,2) NOT NULL,
    "add_back_39c" DECIMAL(14,2) NOT NULL,
    "add_back_other" DECIMAL(14,2) NOT NULL,
    "tax_result" DECIMAL(14,2) NOT NULL,
    "deficit_used" DECIMAL(14,2) NOT NULL,
    "deficit_created" DECIMAL(14,2) NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiscal_bridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tax_losses" (
    "id" BIGSERIAL NOT NULL,
    "amount_origin" DECIMAL(14,2) NOT NULL,
    "remaining" DECIMAL(14,2) NOT NULL,
    "expires_on" TIMESTAMP(3) NOT NULL,
    "ActiviteId" BIGINT NOT NULL,
    "origin_fy_id" BIGINT NOT NULL,

    CONSTRAINT "tax_losses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tax_loss_usages" (
    "id" BIGSERIAL NOT NULL,
    "loss_id" BIGINT NOT NULL,
    "fiscal_year_id" BIGINT NOT NULL,
    "amount_used" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_loss_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deferred_depr_stock" (
    "id" BIGSERIAL NOT NULL,
    "asset_id" BIGINT NOT NULL,
    "origin_fy_id" BIGINT NOT NULL,
    "account_number" TEXT NOT NULL,
    "amount_origin" DECIMAL(14,2) NOT NULL,
    "remaining" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "deferred_depr_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."depr_usages" (
    "id" BIGSERIAL NOT NULL,
    "stockId" BIGINT NOT NULL,
    "asset_id" BIGINT NOT NULL,
    "fiscal_year_id" BIGINT NOT NULL,
    "amount_used" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depr_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Bailleur" (
    "id" TEXT NOT NULL,
    "civilite" "gestion"."Civilite" NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "lieuNaissance" TEXT,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "complementAdresse" TEXT,
    "codePostal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "afficherCoordonnees" BOOLEAN NOT NULL DEFAULT true,
    "rappelerCoordonneesBancaires" BOOLEAN NOT NULL DEFAULT false,
    "iban" TEXT,
    "bic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bailleur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Bien" (
    "id" TEXT NOT NULL,
    "typeBien" "gestion"."TypeBien" NOT NULL,
    "isColocation" BOOLEAN NOT NULL DEFAULT false,
    "adresse" TEXT NOT NULL,
    "complémentAdresse" TEXT,
    "codePostal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "numeroIdentifiantFiscal" TEXT NOT NULL,
    "dpe" "gestion"."DPE" NOT NULL,
    "validiteDPE" TIMESTAMP(3),
    "regimeJuridique" "gestion"."RegimeJuridique" NOT NULL,
    "surfaceHabitable" DOUBLE PRECISION NOT NULL,
    "nombrePieces" INTEGER NOT NULL,
    "anneeConstruction" INTEGER NOT NULL,
    "cuisine" "gestion"."CuisineType" NOT NULL,
    "nombreChambres" INTEGER NOT NULL,
    "nombreSejours" INTEGER NOT NULL,
    "nombreSallesDEau" INTEGER NOT NULL,
    "nombreSallesDeBains" INTEGER NOT NULL,
    "nombreWC" INTEGER NOT NULL,
    "description" TEXT,
    "typeChauffage" "gestion"."TypeChauffage" NOT NULL,
    "autresTypesChauffage" "gestion"."AutreTypeChauffage"[],
    "typeEauChaude" "gestion"."TypeEauChaude" NOT NULL,
    "equipementsDivers" "gestion"."EquipementDivers"[],
    "equipementsNTIC" "gestion"."EquipementNTIC"[],
    "autresPieces" TEXT[],
    "autresInformationsComplementaires" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Cave" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "niveau" INTEGER NOT NULL,
    "bienId" TEXT NOT NULL,

    CONSTRAINT "Cave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Garage" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "niveau" INTEGER NOT NULL,
    "bienId" TEXT NOT NULL,

    CONSTRAINT "Garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Document" (
    "id" TEXT NOT NULL,
    "type" "gestion"."DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bienId" TEXT,
    "locataireId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Locataire" (
    "id" TEXT NOT NULL,
    "type" "gestion"."TypeLocataire" NOT NULL DEFAULT 'PARTICULIER',
    "civilite" "gestion"."Civilite" NOT NULL,
    "prenom" TEXT NOT NULL,
    "deuxiemePrenom" TEXT,
    "nom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "lieuNaissance" TEXT,
    "profession" TEXT,
    "revenusMensuels" DOUBLE PRECISION,
    "typePieceIdentite" "gestion"."TypePieceIdentite",
    "numeroPieceIdentite" TEXT,
    "expirationPieceIdentite" TIMESTAMP(3),
    "pieceIdentiteFileName" TEXT,
    "pieceIdentiteFileUrl" TEXT,
    "emailSecondaire" TEXT,
    "mobile" TEXT,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locataire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Location" (
    "id" TEXT NOT NULL,
    "typeBail" "gestion"."TypeBail"[],
    "leaseStartDate" TIMESTAMP(3) NOT NULL,
    "leaseEndDate" TIMESTAMP(3) NOT NULL,
    "usageDestination" "gestion"."UsageDestination" NOT NULL DEFAULT 'HABITATION',
    "paymentTerm" "gestion"."PaymentTerm" NOT NULL,
    "rentDueDay" INTEGER,
    "paymentMethod" "gestion"."PaymentMethod" NOT NULL,
    "dematerializeReceipt" BOOLEAN NOT NULL DEFAULT true,
    "applyExtraRent" BOOLEAN NOT NULL DEFAULT false,
    "baseRent" DOUBLE PRECISION NOT NULL,
    "monthlyChargesAmount" DOUBLE PRECISION,
    "chargesMethod" "gestion"."RecoverableChargesMethod" NOT NULL,
    "includeWasteTaxInCharges" BOOLEAN NOT NULL DEFAULT false,
    "colocInsuranceSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "rentControlApplicable" BOOLEAN NOT NULL DEFAULT false,
    "referenceRentMinor" DOUBLE PRECISION,
    "referenceRentBase" DOUBLE PRECISION,
    "referenceRentMajor" DOUBLE PRECISION,
    "irlIndex" DOUBLE PRECISION,
    "referenceQuarter" "gestion"."ReferenceQuarter",
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "depositType" "gestion"."DepositType" NOT NULL,
    "signaturePlace" TEXT,
    "signatureDate" TIMESTAMP(3),
    "signatureCopies" INTEGER NOT NULL,
    "annexCoproReglement" BOOLEAN NOT NULL DEFAULT false,
    "annexDiagnosticDossier" BOOLEAN NOT NULL DEFAULT false,
    "annexNoticeInfo" BOOLEAN NOT NULL DEFAULT false,
    "annexEtatDesLieux" BOOLEAN NOT NULL DEFAULT false,
    "annexAutorisationPrealable" BOOLEAN NOT NULL DEFAULT false,
    "annexConventionANAH" BOOLEAN NOT NULL DEFAULT false,
    "annexDiagnosticBruit" BOOLEAN NOT NULL DEFAULT false,
    "annexReferencesLoyers" BOOLEAN NOT NULL DEFAULT false,
    "annexAutres" BOOLEAN NOT NULL DEFAULT false,
    "annexAutresDescription" TEXT,
    "theoreticalExpensesAmount" DOUBLE PRECISION,
    "theoreticalExpensesYear" TEXT,
    "travauxByBailleur" BOOLEAN NOT NULL DEFAULT false,
    "natureTravaux" TEXT,
    "montantTravaux" DOUBLE PRECISION,
    "majorationLoyerTravaux" BOOLEAN NOT NULL DEFAULT false,
    "travauxByLocataire" BOOLEAN NOT NULL DEFAULT false,
    "clauseRenouvellement" BOOLEAN NOT NULL DEFAULT false,
    "partageChargesEnergie" BOOLEAN NOT NULL DEFAULT false,
    "previousSituation" "gestion"."PreviousRentalSituation" NOT NULL,
    "stipulationsParticulieres" TEXT,
    "bienId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion"."Inventaire" (
    "id" TEXT NOT NULL,
    "bienId" TEXT NOT NULL,
    "piece" TEXT NOT NULL,
    "mobilier" "gestion"."Mobilier" NOT NULL,
    "quantite" INTEGER,
    "marque" TEXT,
    "etatEntree" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "immobilisation_ActiviteId_idx" ON "public"."immobilisation"("ActiviteId");

-- CreateIndex
CREATE INDEX "echeance_emprunt_Article.Oid_idx" ON "public"."echeance_emprunt"("Article.Oid");

-- CreateIndex
CREATE INDEX "CerfaDocument_bucket_idx" ON "public"."CerfaDocument"("bucket");

-- CreateIndex
CREATE INDEX "fec_entry_JournalCode_EcritureDate_idx" ON "public"."fec_entry"("JournalCode", "EcritureDate");

-- CreateIndex
CREATE UNIQUE INDEX "fec_entry_JournalCode_EcritureNum_key" ON "public"."fec_entry"("JournalCode", "EcritureNum");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_bridge_fiscal_year_id_snapshot_at_key" ON "public"."fiscal_bridge"("fiscal_year_id", "snapshot_at");

-- CreateIndex
CREATE INDEX "tax_loss_usages_loss_id_fiscal_year_id_idx" ON "public"."tax_loss_usages"("loss_id", "fiscal_year_id");

-- CreateIndex
CREATE INDEX "deferred_depr_stock_origin_fy_id_idx" ON "public"."deferred_depr_stock"("origin_fy_id");

-- CreateIndex
CREATE INDEX "depr_usages_stockId_fiscal_year_id_idx" ON "public"."depr_usages"("stockId", "fiscal_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bailleur_email_key" ON "gestion"."Bailleur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Locataire_emailSecondaire_key" ON "gestion"."Locataire"("emailSecondaire");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_formeJuridiqueOid_fkey" FOREIGN KEY ("formeJuridiqueOid") REFERENCES "public"."FormeJuridique"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_rofOid_fkey" FOREIGN KEY ("rofOid") REFERENCES "public"."RoF"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_roftvaOid_fkey" FOREIGN KEY ("roftvaOid") REFERENCES "public"."RoF"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_sieOid_fkey" FOREIGN KEY ("sieOid") REFERENCES "public"."SIE"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_societeOid_fkey" FOREIGN KEY ("societeOid") REFERENCES "public"."Societe"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "public"."Adresse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fiscyear" ADD CONSTRAINT "fiscyear_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logement" ADD CONSTRAINT "logement_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logement" ADD CONSTRAINT "logement_Prix_fkey" FOREIGN KEY ("Prix") REFERENCES "public"."Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logement" ADD CONSTRAINT "logement_PrixVente_fkey" FOREIGN KEY ("PrixVente") REFERENCES "public"."Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logement" ADD CONSTRAINT "logement_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "public"."Adresse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."article" ADD CONSTRAINT "article_familleOid_fkey" FOREIGN KEY ("familleOid") REFERENCES "public"."famille"("familleid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."article" ADD CONSTRAINT "article_compteOid_fkey" FOREIGN KEY ("compteOid") REFERENCES "public"."compte"("compteid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."articlelinked" ADD CONSTRAINT "articlelinked_groupOid_fkey" FOREIGN KEY ("groupOid") REFERENCES "public"."article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."articlelinked" ADD CONSTRAINT "articlelinked_linkedOid_fkey" FOREIGN KEY ("linkedOid") REFERENCES "public"."article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."immobilisation" ADD CONSTRAINT "immobilisation_Article.Oid_fkey" FOREIGN KEY ("Article.Oid") REFERENCES "public"."article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."immobilisation" ADD CONSTRAINT "immobilisation_Logement.Oid_fkey" FOREIGN KEY ("Logement.Oid") REFERENCES "public"."logement"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."immobilisation" ADD CONSTRAINT "immobilisation_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Composants" ADD CONSTRAINT "Composants_ArticleOid_fkey" FOREIGN KEY ("ArticleOid") REFERENCES "public"."article"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Composants" ADD CONSTRAINT "Composants_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Composants" ADD CONSTRAINT "Composants_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Composants" ADD CONSTRAINT "Composants_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "public"."logement"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Emprunt" ADD CONSTRAINT "Emprunt_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "public"."logement"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Emprunt" ADD CONSTRAINT "Emprunt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Emprunt" ADD CONSTRAINT "Emprunt_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."echeance_emprunt" ADD CONSTRAINT "echeance_emprunt_Article.Oid_fkey" FOREIGN KEY ("Article.Oid") REFERENCES "public"."article"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."echeance_emprunt" ADD CONSTRAINT "echeance_emprunt_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "public"."logement"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation" ADD CONSTRAINT "operation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation" ADD CONSTRAINT "operation_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation" ADD CONSTRAINT "operation_logementId_fkey" FOREIGN KEY ("logementId") REFERENCES "public"."logement"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation" ADD CONSTRAINT "operation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."article"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation" ADD CONSTRAINT "operation_payeurId_fkey" FOREIGN KEY ("payeurId") REFERENCES "public"."payeur"("payeurid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."operation" ADD CONSTRAINT "operation_immoId_fkey" FOREIGN KEY ("immoId") REFERENCES "public"."immobilisation"("Oid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fiscal_bridge" ADD CONSTRAINT "fiscal_bridge_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_losses" ADD CONSTRAINT "tax_losses_ActiviteId_fkey" FOREIGN KEY ("ActiviteId") REFERENCES "public"."Activity"("Oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_losses" ADD CONSTRAINT "tax_losses_origin_fy_id_fkey" FOREIGN KEY ("origin_fy_id") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_loss_usages" ADD CONSTRAINT "tax_loss_usages_loss_id_fkey" FOREIGN KEY ("loss_id") REFERENCES "public"."tax_losses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_loss_usages" ADD CONSTRAINT "tax_loss_usages_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deferred_depr_stock" ADD CONSTRAINT "deferred_depr_stock_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."immobilisation"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deferred_depr_stock" ADD CONSTRAINT "deferred_depr_stock_origin_fy_id_fkey" FOREIGN KEY ("origin_fy_id") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."depr_usages" ADD CONSTRAINT "depr_usages_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "public"."deferred_depr_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."depr_usages" ADD CONSTRAINT "depr_usages_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."immobilisation"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."depr_usages" ADD CONSTRAINT "depr_usages_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscyear"("Oid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion"."Cave" ADD CONSTRAINT "Cave_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "gestion"."Bien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion"."Garage" ADD CONSTRAINT "Garage_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "gestion"."Bien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion"."Document" ADD CONSTRAINT "Document_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "gestion"."Bien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion"."Document" ADD CONSTRAINT "Document_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "gestion"."Locataire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion"."Location" ADD CONSTRAINT "Location_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "gestion"."Bien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion"."Inventaire" ADD CONSTRAINT "Inventaire_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "gestion"."Bien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
