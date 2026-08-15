import { describe, it, expect } from 'vitest'
import { CreateCruiseSchema, OtpRequestSchema, OtpVerifySchema } from '../validations'

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
