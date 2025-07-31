-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "gestion";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "psychomot";

-- CreateEnum
CREATE TYPE "public"."Civilite" AS ENUM ('M', 'MME', 'MLLE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('THERAPIST');

-- CreateEnum
CREATE TYPE "psychomot"."SectionKind" AS ENUM ('anamnese', 'tests_standards', 'observations', 'profil_sensoriel', 'CUSTOM_FORM', 'conclusion');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'THERAPIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthAccount" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" INTEGER,
    "userId" UUID NOT NULL,

    CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "civilite" "public"."Civilite",
    "nom" VARCHAR(100),
    "nomUsage" VARCHAR(100),
    "prenom" VARCHAR(100),
    "email" VARCHAR(255),
    "telephonePersoNum" VARCHAR(50),
    "telephoneMobileNum" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."Patient" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" UUID NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."BilanType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BilanType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."Section" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "psychomot"."SectionKind" NOT NULL,
    "description" TEXT,
    "schema" JSONB,
    "defaultContent" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."BilanTypeSection" (
    "id" TEXT NOT NULL,
    "bilanTypeId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "settings" JSONB,

    CONSTRAINT "BilanTypeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."SectionExample" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "SectionExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."Bilan" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "bilanTypeId" TEXT,
    "descriptionHtml" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bilan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychomot"."BilanSectionInstance" (
    "id" TEXT NOT NULL,
    "bilanId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "BilanSectionInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_provider_providerAccountId_key" ON "public"."AuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "public"."profile"("userId");

-- CreateIndex
CREATE INDEX "BilanSectionInstance_bilanId_order_idx" ON "psychomot"."BilanSectionInstance"("bilanId", "order");

-- AddForeignKey
ALTER TABLE "public"."AuthAccount" ADD CONSTRAINT "AuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."Patient" ADD CONSTRAINT "Patient_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanType" ADD CONSTRAINT "BilanType_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."Section" ADD CONSTRAINT "Section_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeSection" ADD CONSTRAINT "BilanTypeSection_bilanTypeId_fkey" FOREIGN KEY ("bilanTypeId") REFERENCES "psychomot"."BilanType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanTypeSection" ADD CONSTRAINT "BilanTypeSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."SectionExample" ADD CONSTRAINT "SectionExample_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."Bilan" ADD CONSTRAINT "Bilan_bilanTypeId_fkey" FOREIGN KEY ("bilanTypeId") REFERENCES "psychomot"."BilanType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."Bilan" ADD CONSTRAINT "Bilan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "psychomot"."Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanSectionInstance" ADD CONSTRAINT "BilanSectionInstance_bilanId_fkey" FOREIGN KEY ("bilanId") REFERENCES "psychomot"."Bilan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychomot"."BilanSectionInstance" ADD CONSTRAINT "BilanSectionInstance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "psychomot"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
