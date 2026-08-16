-- Crew Registration: 1:1 Reservation + per-guest rows + per-guest documents (additive)

-- CreateEnum
CREATE TYPE "CrewRegistrationStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "CrewDocumentKind" AS ENUM ('passport_ine', 'dive_cert', 'dive_insurance', 'nitrox_cert');

-- CreateEnum
CREATE TYPE "CertificationLevel" AS ENUM ('open_water', 'advanced', 'rescue', 'divemaster', 'instructor');

-- CreateEnum
CREATE TYPE "EquipmentSize" AS ENUM ('xs', 's', 'm', 'l', 'xl', 'xxl');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('a_positive', 'a_negative', 'b_positive', 'b_negative', 'ab_positive', 'ab_negative', 'o_positive', 'o_negative');

-- CreateTable
CREATE TABLE "CrewRegistration" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "status" "CrewRegistrationStatus" NOT NULL DEFAULT 'draft',
    "rejectReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "arrivalFlight" TEXT NOT NULL,
    "arrivalDate" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "departureFlight" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "hotelAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewRegistrationGuest" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "guestIndex" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "certificationLevel" "CertificationLevel" NOT NULL,
    "logbookDives" INTEGER,
    "diveInsurancePolicyNo" TEXT NOT NULL,
    "isNitroxCertified" BOOLEAN NOT NULL DEFAULT false,
    "weightKg" INTEGER,
    "ballastKg" INTEGER,
    "photoEquipment" TEXT,
    "bcdSize" "EquipmentSize",
    "wetsuitSize" "EquipmentSize",
    "finsSize" TEXT,
    "maskSize" TEXT,
    "bootiesSize" TEXT,
    "medicalLimitations" TEXT,
    "allergies" TEXT,
    "bloodType" "BloodType",
    "dietaryRestrictions" TEXT,
    "ec1Name" TEXT NOT NULL,
    "ec1Relation" TEXT NOT NULL,
    "ec1Phone" TEXT NOT NULL,
    "ec2Name" TEXT NOT NULL,
    "ec2Relation" TEXT NOT NULL,
    "ec2Phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewRegistrationGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewRegistrationDocument" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "kind" "CrewDocumentKind" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewRegistrationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrewRegistration_reservationId_key" ON "CrewRegistration"("reservationId");

-- CreateIndex
CREATE INDEX "CrewRegistration_status_idx" ON "CrewRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CrewRegistrationGuest_registrationId_guestIndex_key" ON "CrewRegistrationGuest"("registrationId", "guestIndex");

-- CreateIndex
CREATE UNIQUE INDEX "CrewRegistrationDocument_guestId_kind_key" ON "CrewRegistrationDocument"("guestId", "kind");

-- AddForeignKey
ALTER TABLE "CrewRegistration" ADD CONSTRAINT "CrewRegistration_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewRegistrationGuest" ADD CONSTRAINT "CrewRegistrationGuest_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "CrewRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewRegistrationDocument" ADD CONSTRAINT "CrewRegistrationDocument_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "CrewRegistrationGuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

