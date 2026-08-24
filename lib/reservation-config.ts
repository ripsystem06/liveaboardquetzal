/**
 * Reservation domain configuration and pure helpers.
 *
 * Single source of truth for vessel capacity, departure viability, derived
 * paid state, and the confirmation-email predicate. These helpers are pure:
 * they never read Prisma, a request body, or any runtime/DB value. Occupancy
 * math (design decision #2) must never accept `capacity` as an input — it is
 * fixed here and enforced in PostgreSQL by `CHECK (capacity = 18)`.
 */

export const VESSEL_CAPACITY = 18 as const
export const VIABLE_MIN = 11 as const

/** Contracted charter type. Only admin-registered contracts record `medio`/`full`. */
export type CharterType = 'none' | 'medio' | 'full'

const HALF_CHARTER_SPOTS = 9

export interface OccupancyInput {
  charterType?: CharterType | string | null
  guestCount: number
}

/**
 * Number of spots a single reservation closes on its departure date
 * (design decision #8):
 *   - full charter → VESSEL_CAPACITY (18)
 *   - medio charter → 9
 *   - shared (none / absent) group under 10 → 9
 *   - otherwise → guestCount
 *
 * Status filtering (expired/cancelled) is the caller's responsibility when
 * summing occupancy for a date.
 */
export function closedSpots(reservation: OccupancyInput): number {
  if (reservation.charterType === 'full') return VESSEL_CAPACITY
  if (reservation.charterType === 'medio') return HALF_CHARTER_SPOTS
  if (reservation.guestCount < 10) return HALF_CHARTER_SPOTS
  return reservation.guestCount
}

/**
 * Total occupied spots for a date = sum of `closedSpots` over the given
 * reservations. Pure reduction over `closedSpots`; the caller is responsible
 * for passing only ACTIVE rows (excluding `expired`/`cancelled`) when computing
 * occupancy for a departure date.
 */
export function sumClosedSpots(reservations: OccupancyInput[]): number {
  return reservations.reduce((sum, r) => sum + closedSpots(r), 0)
}

export interface PaymentRecordLike {
  status: string
}

export interface PaidLike {
  status: string
  paymentRecords?: PaymentRecordLike[]
}

/**
 * Derived paid state (design decision #3): `status === 'confirmed'` OR a
 * completed PaymentRecord. `paid` is never a stored boolean.
 */
export function isReservationPaid(reservation: PaidLike): boolean {
  if (reservation.status === 'confirmed') return true
  return reservation.paymentRecords?.some((record) => record.status === 'completed') ?? false
}

export interface ViabilityPassenger {
  guestCount: number
  charterType?: string | null
}

/**
 * Departure viability (design decision #9): `Σ guestCount ≥ 11` OR a contracted
 * `medio` charter. A `full` charter is NOT an exception — it is viable only via
 * ≥11 actual passengers or the manual operational workflow.
 *
 * Caller passes the ACTIVE (non-expired/non-cancelled) reservation set.
 */
export function isDepartureViable(reservations: ViabilityPassenger[]): boolean {
  const totalPassengers = reservations.reduce((sum, r) => sum + r.guestCount, 0)
  if (totalPassengers >= VIABLE_MIN) return true
  return reservations.some((r) => r.charterType === 'medio')
}

export interface ConfirmationEmailInput {
  status: string
  confirmationEmailSentAt?: Date | null
  paymentRecords?: PaymentRecordLike[]
}

/**
 * Idempotent confirmation-email predicate: fire only when `approved` AND payment
 * validated (via `isReservationPaid`) AND not yet emailed. Approval alone never
 * sends. Wire-confirm callers (admin) must evaluate this before transitioning
 * status to `confirmed`, or gate on `confirmationEmailSentAt` directly.
 */
export function shouldSendConfirmationEmail(reservation: ConfirmationEmailInput): boolean {
  if (reservation.status !== 'approved') return false
  if (!isReservationPaid(reservation)) return false
  if (reservation.confirmationEmailSentAt) return false
  return true
}
