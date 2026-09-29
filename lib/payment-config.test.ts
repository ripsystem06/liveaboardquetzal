import { describe, it, expect } from 'vitest'
import { bankAccounts } from './payment-config'
import { contactInfo } from './contact'
import { cancellationContent } from './legal/cancellation'
import { divingRisksContent } from './legal/diving-risks'
import { privacyContent } from './legal/privacy'
import { termsContent } from './legal/terms'
import type { LegalDocument } from './legal/privacy'

// Production customer-facing contact details (user-authorized values).
const productionEmail = 'info@liveaboardquetzal.com'
const productionPhone = '+52 1 646 146 1000'

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

  it('exposes the BBVA Mexican account (CLABE + account number + SWIFT)', () => {
    const bbva = bankAccounts[0]
    expect(bbva.swift).toBe('BCMRMXMMPYM')
    expect(bbva.clabe).toMatch(/^\d{18}$/)
    expect(bbva.accountNumber).toMatch(/^\d+$/)
    expect(bbva.routingNumber).toBeUndefined()
    expect(bbva.zelle).toBeUndefined()
  })

  it('exposes the Wells Fargo US account (routing + account + Zelle + SWIFT)', () => {
    const wellsFargo = bankAccounts[1]
    expect(wellsFargo.swift).toBe('WFBIUS6SXXX')
    expect(wellsFargo.routingNumber).toMatch(/^\d{9}$/)
    expect(wellsFargo.accountNumber).toMatch(/^\d+$/)
    expect(wellsFargo.zelle).toMatch(/.+@.+\..+/)
    expect(wellsFargo.clabe).toBeUndefined()
  })

  it('provides a well-formed SWIFT/BIC code for every account', () => {
    for (const account of bankAccounts) {
      expect(account.swift).toMatch(/^[A-Z0-9]{8,11}$/)
    }
  })
})

describe('contactInfo', () => {
  it('exposes exactly the required contact fields', () => {
    expect(Object.keys(contactInfo).sort()).toEqual(
      ['email', 'phones', 'address'].sort()
    )
  })

  it('exposes the production contact email', () => {
    expect(contactInfo.email).toBe(productionEmail)
  })

  it('exposes the production contact phone', () => {
    expect(contactInfo.phones).toEqual([productionPhone])
  })

  it('keeps a non-empty address', () => {
    expect(contactInfo.address.trim()).not.toBe('')
  })
})

describe('legal contact details', () => {
  const documents: Array<[string, Record<'en' | 'es', LegalDocument>]> = [
    ['privacy policy', privacyContent],
    ['terms & conditions', termsContent],
    ['cancellation policy', cancellationContent],
    ['diving risks', divingRisksContent],
  ]

  const contactLines = {
    en: [`Email: ${productionEmail}`, `Phone: ${productionPhone}`],
    es: [`Correo: ${productionEmail}`, `Teléfono: ${productionPhone}`],
  }

  function documentLines(document: LegalDocument): string[] {
    return document.sections.flatMap((section) => [
      ...section.content,
      ...(section.list ?? []),
    ])
  }

  it.each(documents)(
    '%s states the production email and phone in both languages',
    (_name, document) => {
      expect(documentLines(document.en)).toEqual(
        expect.arrayContaining(contactLines.en)
      )
      expect(documentLines(document.es)).toEqual(
        expect.arrayContaining(contactLines.es)
      )
    }
  )

  it.each(documents)(
    '%s keeps no stale contact email or phone placeholder',
    (_name, document) => {
      const text = [
        ...documentLines(document.en),
        ...documentLines(document.es),
      ].join('\n')

      expect(text).not.toContain('@quetzalliveaboard.com')
      expect(text).not.toContain('XXX-XXXX')
    }
  )
})
