import { describe, it, expect } from 'vitest'
import {
  CreateCruiseSchema,
  OtpRequestSchema,
  OtpVerifySchema,
  ReservationStatus,
  PaymentMethod,
  CreateReservationSchema,
  StripeCreateIntentSchema,
  CharterRegistrationSchema,
  PaymentMethodSelectionSchema,
  ReservationStatusUpdateSchema,
} from '../validations'
import { activeTermsVersion } from '../legal/terms'

describe('CreateCruiseSchema', () => {
  const validCruise = {
    name: 'Socorro Island Expedition',
    departureDate: '2026-08-15',
    route: 'Cabo San Lucas → Socorro',
    basicPrice: 2800,
    standardPrice: 3500,
    premiumPrice: 4500,
  }

  it('accepts a valid cruise with all required fields including returnDate', () => {
    const result = CreateCruiseSchema.safeParse({
      ...validCruise,
      returnDate: '2026-08-24',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.returnDate).toBe('2026-08-24')
    }
  })

  it('rejects cruise without returnDate (DI-REQ-002)', () => {
    // This should FAIL until returnDate is added to the schema
    const result = CreateCruiseSchema.safeParse(validCruise)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map(i => i.path.join('.'))
      expect(issues).toContain('returnDate')
    }
  })

  it('rejects cruise with empty returnDate', () => {
    const result = CreateCruiseSchema.safeParse({
      ...validCruise,
      returnDate: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('OtpRequestSchema', () => {
  it('accepts a valid email', () => {
    const result = OtpRequestSchema.safeParse({ email: 'demo@quetzal.com' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('demo@quetzal.com')
  })

  it('rejects a malformed email', () => {
    expect(OtpRequestSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
    expect(OtpRequestSchema.safeParse({ email: '' }).success).toBe(false)
  })

  it('rejects an object without an email field', () => {
    expect(OtpRequestSchema.safeParse({}).success).toBe(false)
  })
})

describe('OtpVerifySchema', () => {
  it('accepts email + 6-digit otp with optional name', () => {
    const result = OtpVerifySchema.safeParse({
      email: 'demo@quetzal.com',
      otp: '123456',
      name: 'Demo',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.otp).toBe('123456')
      expect(result.data.name).toBe('Demo')
    }
  })

  it('accepts email + otp without a name', () => {
    const result = OtpVerifySchema.safeParse({ email: 'demo@quetzal.com', otp: '000000' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBeUndefined()
  })

  it('rejects a non-6-digit otp', () => {
    expect(OtpVerifySchema.safeParse({ email: 'demo@quetzal.com', otp: '12345' }).success).toBe(false)
    expect(OtpVerifySchema.safeParse({ email: 'demo@quetzal.com', otp: 'abcdef' }).success).toBe(false)
    expect(OtpVerifySchema.safeParse({ email: 'demo@quetzal.com', otp: '' }).success).toBe(false)
  })

  it('rejects a malformed email', () => {
    expect(OtpVerifySchema.safeParse({ email: 'bad', otp: '123456' }).success).toBe(false)
  })
})

describe('Reservation v2 validations', () => {
  describe('ReservationStatus', () => {
    it('includes the new approved status', () => {
      expect(ReservationStatus.enum.approved).toBe('approved')
      expect(ReservationStatus.safeParse('approved').success).toBe(true)
    })

    it('still accepts legacy statuses', () => {
      expect(ReservationStatus.safeParse('pending_approval').success).toBe(true)
      expect(ReservationStatus.safeParse('confirmed').success).toBe(true)
      expect(ReservationStatus.safeParse('cancelled').success).toBe(true)
      expect(ReservationStatus.safeParse('expired').success).toBe(true)
    })
  })

  describe('PaymentMethod', () => {
    it('accepts only stripe and wire_transfer', () => {
      expect(PaymentMethod.safeParse('stripe').success).toBe(true)
      expect(PaymentMethod.safeParse('wire_transfer').success).toBe(true)
    })

    it('rejects paypal and bank_transfer (removed providers)', () => {
      expect(PaymentMethod.safeParse('paypal').success).toBe(false)
      expect(PaymentMethod.safeParse('bank_transfer').success).toBe(false)
    })
  })

  describe('CreateReservationSchema', () => {
    const validBody = {
      cruiseId: 'socorro-1',
      cruiseName: 'Socorro Islands',
      departureDate: '2026-07-15',
      route: 'Cabo San Lucas',
      tier: 'premium',
      tierPrice: 3200,
      guestCount: 2,
      freeSpaces: 4,
      paidSpaces: 2,
      totalAmount: 6400,
      termsVersion: activeTermsVersion,
    }

    it('accepts a valid body with the active terms version and no payment method', () => {
      const result = CreateReservationSchema.safeParse(validBody)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.termsVersion).toBe(activeTermsVersion)
        expect(result.data.charterType).toBe('none')
      }
    })

    it('rejects a missing termsVersion', () => {
      const { termsVersion, ...withoutTerms } = validBody
      const result = CreateReservationSchema.safeParse(withoutTerms)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.map((i) => i.path.join('.'))).toContain('termsVersion')
      }
    })

    it('requires termsVersion to be a positive integer (stale-vs-active comparison is the route\'s job)', () => {
      // The schema enforces presence + type only; the route (PR 3) compares the
      // value against `activeTermsVersion` and rejects a stale version with 400.
      expect(CreateReservationSchema.safeParse({ ...validBody, termsVersion: activeTermsVersion - 1 }).success).toBe(true)
      expect(CreateReservationSchema.safeParse({ ...validBody, termsVersion: 0 }).success).toBe(false)
      expect(CreateReservationSchema.safeParse({ ...validBody, termsVersion: '3' }).success).toBe(false)
    })

    it('defaults charterType to none and accepts structured optional cabinDetails', () => {
      const result = CreateReservationSchema.safeParse({
        ...validBody,
        cabinDetails: { count: 4, types: ['double', 'twin'] },
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.charterType).toBe('none')
        expect(result.data.cabinDetails).toEqual({ count: 4, types: ['double', 'twin'] })
      }
    })

    it('rejects a free-text cabin note because cabin details require count and types', () => {
      const result = CreateReservationSchema.safeParse({
        ...validBody,
        cabinDetails: { note: 'Two double cabins' },
      })

      expect(result.success).toBe(false)
    })

    it('succeeds without cabinDetails (informational only)', () => {
      expect(CreateReservationSchema.safeParse(validBody).success).toBe(true)
    })

    it('does not include a paymentMethod field in its parsed output', () => {
      const result = CreateReservationSchema.safeParse({ ...validBody, paymentMethod: 'stripe' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect('paymentMethod' in result.data).toBe(false)
      }
    })
  })

  describe('StripeCreateIntentSchema', () => {
    it('accepts a reservationId', () => {
      expect(StripeCreateIntentSchema.safeParse({ reservationId: 'res_1' }).success).toBe(true)
    })

    it('rejects a missing reservationId', () => {
      expect(StripeCreateIntentSchema.safeParse({}).success).toBe(false)
    })
  })

  describe('CharterRegistrationSchema', () => {
    const validCharter = {
      cruiseId: 'socorro-1',
      cruiseName: 'Socorro Islands',
      departureDate: '2026-07-15',
      route: 'Cabo San Lucas',
      charterType: 'medio',
    }

    it('accepts a medio charter', () => {
      const result = CharterRegistrationSchema.safeParse(validCharter)
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.guestCount).toBe(0)
    })

    it('accepts a full charter with a recorded group size', () => {
      const result = CharterRegistrationSchema.safeParse({ ...validCharter, charterType: 'full', guestCount: 18 })
      expect(result.success).toBe(true)
    })

    it('rejects a "none" charter type (admin registers only medio/full)', () => {
      expect(CharterRegistrationSchema.safeParse({ ...validCharter, charterType: 'none' }).success).toBe(false)
    })

    it('rejects a missing cruiseId', () => {
      const { cruiseId, ...rest } = validCharter
      expect(CharterRegistrationSchema.safeParse(rest).success).toBe(false)
    })
  })

  describe('PaymentMethodSelectionSchema', () => {
    it('accepts stripe and wire_transfer', () => {
      expect(PaymentMethodSelectionSchema.safeParse({ paymentMethod: 'stripe' }).success).toBe(true)
      expect(PaymentMethodSelectionSchema.safeParse({ paymentMethod: 'wire_transfer' }).success).toBe(true)
    })

    it('rejects paypal', () => {
      expect(PaymentMethodSelectionSchema.safeParse({ paymentMethod: 'paypal' }).success).toBe(false)
    })
  })

  describe('ReservationStatusUpdateSchema', () => {
    it('accepts the approved status', () => {
      expect(ReservationStatusUpdateSchema.safeParse({ status: 'approved' }).success).toBe(true)
    })

    it('rejects the expired status (system-only)', () => {
      expect(ReservationStatusUpdateSchema.safeParse({ status: 'expired' }).success).toBe(false)
    })

    it('accepts the confirmWireReceipt flag', () => {
      const result = ReservationStatusUpdateSchema.safeParse({ confirmWireReceipt: true })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.confirmWireReceipt).toBe(true)
    })
  })
})
