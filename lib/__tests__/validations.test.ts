import { describe, it, expect } from 'vitest'
import { CreateCruiseSchema } from '../validations'

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
