import { describe, it, expect } from 'vitest'
import { bankDetails } from './payment-config'
import { contactInfo } from './contact'

describe('bankDetails', () => {
  it('exposes exactly the required bank transfer fields', () => {
    expect(Object.keys(bankDetails).sort()).toEqual(
      ['bankName', 'beneficiary', 'clabe', 'swift'].sort()
    )
  })

  it('provides non-empty string values for every bank field', () => {
    const fields = ['bankName', 'beneficiary', 'clabe', 'swift'] as const
    for (const field of fields) {
      const value = bankDetails[field]
      expect(typeof value).toBe('string')
      expect(value.trim()).not.toBe('')
    }
  })
})

describe('contactInfo', () => {
  it('exposes exactly the required contact fields', () => {
    expect(Object.keys(contactInfo).sort()).toEqual(
      ['email', 'phone', 'address'].sort()
    )
  })

  it('uses the placeholder phone number', () => {
    expect(contactInfo.phone).toBe('+52 624 123 4567')
  })

  it('provides a well-formed email and a non-empty address', () => {
    expect(contactInfo.email).toMatch(/.+@.+\..+/)
    expect(contactInfo.address.trim()).not.toBe('')
  })
})
