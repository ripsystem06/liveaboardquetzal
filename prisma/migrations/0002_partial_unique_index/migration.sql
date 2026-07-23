-- Migration: Add partial unique index on pending reservations
-- Prevents double-booking by enforcing uniqueness on (cruiseId, departureDate)
-- but only for reservations with status = 'pending_approval'

CREATE UNIQUE INDEX IF NOT EXISTS "idx_pending_unique_cruise_date"
  ON "Reservation" ("cruiseId", "departureDate")
  WHERE "status" = 'pending_approval';
