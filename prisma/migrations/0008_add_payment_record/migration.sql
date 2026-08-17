-- Payments: PaymentProvider/PaymentStatus enums + PaymentRecord receipt table (additive)

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('paypal');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'paypal',
    "providerOrderId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amountUsd" INTEGER NOT NULL,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_providerOrderId_key" ON "PaymentRecord"("providerOrderId");

-- CreateIndex
CREATE INDEX "PaymentRecord_reservationId_idx" ON "PaymentRecord"("reservationId");

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
