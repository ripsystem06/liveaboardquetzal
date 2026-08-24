import { describe, it, expect } from 'vitest'
import {
  VESSEL_CAPACITY,
  VIABLE_MIN,
  closedSpots,
  sumClosedSpots,
  isReservationPaid,
  isDepartureViable,
  shouldSendConfirmationEmail,
} from '../reservation-config'

describe('reservation-config constants', () => {
  it('freezes VESSEL_CAPACITY at 18', () => {
    expect(VESSEL_CAPACITY).toBe(18)
  })

  it('sets VIABLE_MIN to 11 actual passengers', () => {
    expect(VIABLE_MIN).toBe(11)
  })
})

describe('closedSpots', () => {
  it('closes all 18 spots for a full charter regardless of group size', () => {
    expect(closedSpots({ charterType: 'full', guestCount: 8 })).toBe(18)
    expect(closedSpots({ charterType: 'full', guestCount: 18 })).toBe(18)
  })

  it('closes 9 spots for a medio charter regardless of group size', () => {
    expect(closedSpots({ charterType: 'medio', guestCount: 4 })).toBe(9)
    expect(closedSpots({ charterType: 'medio', guestCount: 18 })).toBe(9)
  })

  it('closes 9 spots for a shared (non-charter) group under 10', () => {
    expect(closedSpots({ guestCount: 1 })).toBe(9)
    expect(closedSpots({ guestCount: 5 })).toBe(9)
    expect(closedSpots({ guestCount: 9 })).toBe(9)
  })

  it('closes the exact guest count for a non-charter group of 10 or more', () => {
    expect(closedSpots({ guestCount: 10 })).toBe(10)
    expect(closedSpots({ guestCount: 14 })).toBe(14)
    expect(closedSpots({ guestCount: 18 })).toBe(18)
  })

  it('treats an explicit "none" charterType like a shared booking', () => {
    expect(closedSpots({ charterType: 'none', guestCount: 5 })).toBe(9)
    expect(closedSpots({ charterType: 'none', guestCount: 12 })).toBe(12)
  })
})

describe('sumClosedSpots', () => {
  it('sums an empty active set to zero', () => {
    expect(sumClosedSpots([])).toBe(0)
  })

  it('sums closed spots across mixed reservations', () => {
    expect(
      sumClosedSpots([
        { charterType: 'medio', guestCount: 4 },
        { guestCount: 14 },
        { guestCount: 2 },
      ])
    ).toBe(9 + 14 + 9)
  })

  it('excludes expired/cancelled by leaving them out of the active set', () => {
    // Callers filter status; the helper only sums what it is given.
    expect(sumClosedSpots([{ guestCount: 10 }, { guestCount: 4 }])).toBe(19)
  })
})

describe('isReservationPaid', () => {
  it('derives paid from a confirmed status even without payment records', () => {
    expect(isReservationPaid({ status: 'confirmed' })).toBe(true)
  })

  it('derives paid from a completed payment record', () => {
    expect(
      isReservationPaid({
        status: 'approved',
        paymentRecords: [{ status: 'completed' }],
      })
    ).toBe(true)
  })

  it('does not derive paid from a pending or failed payment record', () => {
    expect(
      isReservationPaid({
        status: 'approved',
        paymentRecords: [{ status: 'pending' }],
      })
    ).toBe(false)
    expect(
      isReservationPaid({
        status: 'approved',
        paymentRecords: [{ status: 'failed' }],
      })
    ).toBe(false)
  })

  it('does not derive paid from an unpaid approved reservation', () => {
    expect(isReservationPaid({ status: 'approved' })).toBe(false)
    expect(isReservationPaid({ status: 'approved', paymentRecords: [] })).toBe(false)
  })

  it('does not derive paid from cancelled or pending_approval without a completed record', () => {
    expect(isReservationPaid({ status: 'cancelled' })).toBe(false)
    expect(isReservationPaid({ status: 'pending_approval' })).toBe(false)
  })
})

describe('isDepartureViable', () => {
  it('is viable at exactly 11 active passengers with no charter', () => {
    expect(
      isDepartureViable([{ guestCount: 11 }, { guestCount: 0 }])
    ).toBe(true)
  })

  it('is viable at 11 passengers spread across multiple reservations', () => {
    expect(
      isDepartureViable([
        { guestCount: 6 },
        { guestCount: 5 },
      ])
    ).toBe(true)
  })

  it('is viable for any contracted medio charter regardless of count', () => {
    expect(isDepartureViable([{ guestCount: 4, charterType: 'medio' }])).toBe(true)
    expect(isDepartureViable([{ guestCount: 1, charterType: 'medio' }])).toBe(true)
  })

  it('is not viable for 10 passengers with no charter (manual negotiation)', () => {
    expect(isDepartureViable([{ guestCount: 10 }])).toBe(false)
  })

  it('does not treat a full charter as an exception when under 11 passengers', () => {
    expect(isDepartureViable([{ guestCount: 8, charterType: 'full' }])).toBe(false)
  })

  it('treats a full charter with 11+ passengers as viable via passenger count', () => {
    expect(isDepartureViable([{ guestCount: 12, charterType: 'full' }])).toBe(true)
  })

  it('is not viable for an empty active set', () => {
    expect(isDepartureViable([])).toBe(false)
  })

  it('does not count a shared (none) charter under 10 as a viability exception', () => {
    expect(isDepartureViable([{ guestCount: 5, charterType: 'none' }])).toBe(false)
  })
})

describe('shouldSendConfirmationEmail', () => {
  it('fires for an approved reservation with a completed payment and no prior email', () => {
    expect(
      shouldSendConfirmationEmail({
        status: 'approved',
        confirmationEmailSentAt: null,
        paymentRecords: [{ status: 'completed' }],
      })
    ).toBe(true)
  })

  it('never fires on approval alone (unpaid approved reservation)', () => {
    expect(
      shouldSendConfirmationEmail({
        status: 'approved',
        confirmationEmailSentAt: null,
        paymentRecords: [],
      })
    ).toBe(false)
  })

  it('never fires when confirmationEmailSentAt is already set (at-most-once)', () => {
    expect(
      shouldSendConfirmationEmail({
        status: 'approved',
        confirmationEmailSentAt: new Date('2026-08-01T00:00:00Z'),
        paymentRecords: [{ status: 'completed' }],
      })
    ).toBe(false)
  })

  it('does not fire before approval even when a completed record exists', () => {
    expect(
      shouldSendConfirmationEmail({
        status: 'pending_approval',
        confirmationEmailSentAt: null,
        paymentRecords: [{ status: 'completed' }],
      })
    ).toBe(false)
  })

  it('does not fire for a confirmed reservation (email only when approved)', () => {
    expect(
      shouldSendConfirmationEmail({
        status: 'confirmed',
        confirmationEmailSentAt: null,
        paymentRecords: [{ status: 'completed' }],
      })
    ).toBe(false)
  })
})
