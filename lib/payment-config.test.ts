import { describe, it, expect } from 'vitest'
import { bankAccounts } from './payment-config'
import { contactInfo } from './contact'

describe('bankAccounts', () => {
  it('exposes two bank accounts (BBVA and Wells Fargo)', () => {
    expect(bankAccounts).toHaveLength(2)
    expect(bankAccounts[0].bankName).toBe('BBVA')
    expect(bankAccounts[1].bankName).toBe('Wells Fargo')
  })

  it('provides non-empty values for every account', () => {
    for (const account of bankAccounts) {
      expect(account.bankName.trim()).not.toBe('')
      expect(account.beneficiary.trim()).not.toBe('')
      expect(account.label.en.trim()).not.toBe('')
      expect(account.label.es.trim()).not.toBe('')
    }
  })

  it('exposes the BBVA Mexican account (CLABE + account number)', () => {
    const bbva = bankAccounts[0]
    expect(bbva.clabe).toMatch(/^\d{18}$/)
    expect(bbva.accountNumber).toMatch(/^\d+$/)
    expect(bbva.routingNumber).toBeUndefined()
    expect(bbva.zelle).toBeUndefined()
  })

  it('exposes the Wells Fargo US account (routing + account + Zelle)', () => {
    const wellsFargo = bankAccounts[1]
    expect(wellsFargo.routingNumber).toMatch(/^\d{9}$/)
    expect(wellsFargo.accountNumber).toMatch(/^\d+$/)
    expect(wellsFargo.zelle).toMatch(/.+@.+\..+/)
    expect(wellsFargo.clabe).toBeUndefined()
  })
})

describe('contactInfo', () => {
  it('exposes exactly the required contact fields', () => {
    expect(Object.keys(contactInfo).sort()).toEqual(
      ['email', 'phones', 'address'].sort()
    )
  })

  it('provides two well-formed phone numbers', () => {
    expect(contactInfo.phones).toHaveLength(2)
    for (const phone of contactInfo.phones) {
      expect(phone).toMatch(/^\+52 \d{3} \d{3} \d{4}$/)
    }
  })

  it('provides a well-formed email and a non-empty address', () => {
    expect(contactInfo.email).toMatch(/.+@.+\..+/)
    expect(contactInfo.address.trim()).not.toBe('')
  })
})
