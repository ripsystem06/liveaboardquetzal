-- Reservation Model v2: fixed capacity 18, charter/cabin/terms/email fields, Stripe + wire-transfer providers (additive)

-- AlterEnum — extend PaymentProvider while preserving legacy `paypal` rows
ALTER TYPE "PaymentProvider" ADD VALUE 'stripe';
ALTER TYPE "PaymentProvider" ADD VALUE 'wire_transfer';

-- AlterTable — Cruise.capacity: backfill existing rows to 18, then lock to exactly 18
ALTER TABLE "Cruise" ADD COLUMN "capacity" INTEGER;
UPDATE "Cruise" SET "capacity" = 18;
ALTER TABLE "Cruise" ALTER COLUMN "capacity" SET NOT NULL;
ALTER TABLE "Cruise" ALTER COLUMN "capacity" SET DEFAULT 18;
ALTER TABLE "Cruise" ADD CONSTRAINT "Cruise_capacity_check" CHECK ("capacity" = 18);

-- AlterTable — Reservation: charter, cabin, terms, and confirmation-email fields
ALTER TABLE "Reservation" ADD COLUMN "charterType" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "Reservation" ADD COLUMN "cabinDetails" JSONB;
ALTER TABLE "Reservation" ADD COLUMN "termsVersion" INTEGER;
ALTER TABLE "Reservation" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Reservation" ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3);

-- AlterTable — paymentMethod becomes nullable, then migrate legacy values
ALTER TABLE "Reservation" ALTER COLUMN "paymentMethod" DROP NOT NULL;
UPDATE "Reservation" SET "paymentMethod" = 'wire_transfer' WHERE "paymentMethod" = 'bank_transfer';
UPDATE "Reservation" SET "paymentMethod" = NULL WHERE "paymentMethod" = 'paypal';
