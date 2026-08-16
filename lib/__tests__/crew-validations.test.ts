import { describe, it, expect } from 'vitest'
import { computeTargetStatus, enforceDocRequirements, assertEditable } from '../crew-registration'

describe('computeTargetStatus', () => {
  it('draft → submitted when submit is true', () => {
    expect(computeTargetStatus('draft', true)).toBe('submitted')
  })

  it('submitted → submitted when submit is true', () => {
    expect(computeTargetStatus('submitted', true)).toBe('submitted')
  })

  it('rejected → submitted when submit is true (resubmit reopens review)', () => {
    expect(computeTargetStatus('rejected', true)).toBe('submitted')
  })

  it('draft stays draft when submit is false', () => {
    expect(computeTargetStatus('draft', false)).toBe('draft')
  })

  it('submitted stays submitted when submit is false', () => {
    expect(computeTargetStatus('submitted', false)).toBe('submitted')
  })

  it('rejected → submitted when submit is false (edit reopens review)', () => {
    expect(computeTargetStatus('rejected', false)).toBe('submitted')
  })

  it('approved is terminal regardless of submit flag', () => {
    expect(computeTargetStatus('approved', true)).toBe('approved')
    expect(computeTargetStatus('approved', false)).toBe('approved')
  })
})

describe('enforceDocRequirements', () => {
  it('returns no missing docs when all mandatory kinds are present', () => {
    const guests = [{ id: 'g1', isNitroxCertified: false }]
    const documents = [
      { guestId: 'g1', kind: 'passport_ine' as const },
      { guestId: 'g1', kind: 'dive_cert' as const },
      { guestId: 'g1', kind: 'dive_insurance' as const },
    ]
    expect(enforceDocRequirements(guests, documents)).toEqual([])
  })

  it('requires passport_ine, dive_cert, and dive_insurance per guest', () => {
    const guests = [{ id: 'g1', isNitroxCertified: false }]
    expect(enforceDocRequirements(guests, [])).toEqual([
      { guestId: 'g1', kind: 'passport_ine' },
      { guestId: 'g1', kind: 'dive_cert' },
      { guestId: 'g1', kind: 'dive_insurance' },
    ])
  })

  it('identifies a single missing mandatory document', () => {
    const guests = [{ id: 'g1', isNitroxCertified: false }]
    const documents = [
      { guestId: 'g1', kind: 'passport_ine' as const },
      { guestId: 'g1', kind: 'dive_cert' as const },
    ]
    expect(enforceDocRequirements(guests, documents)).toEqual([
      { guestId: 'g1', kind: 'dive_insurance' },
    ])
  })

  it('requires nitrox_cert when isNitroxCertified is true', () => {
    const guests = [{ id: 'g1', isNitroxCertified: true }]
    const documents = [
      { guestId: 'g1', kind: 'passport_ine' as const },
      { guestId: 'g1', kind: 'dive_cert' as const },
      { guestId: 'g1', kind: 'dive_insurance' as const },
    ]
    expect(enforceDocRequirements(guests, documents)).toEqual([
      { guestId: 'g1', kind: 'nitrox_cert' },
    ])
  })

  it('does not require nitrox_cert when isNitroxCertified is false', () => {
    const guests = [{ id: 'g1', isNitroxCertified: false }]
    const documents = [
      { guestId: 'g1', kind: 'passport_ine' as const },
      { guestId: 'g1', kind: 'dive_cert' as const },
      { guestId: 'g1', kind: 'dive_insurance' as const },
    ]
    expect(enforceDocRequirements(guests, documents)).toEqual([])
  })

  it('handles multiple guests independently', () => {
    const guests = [
      { id: 'g1', isNitroxCertified: true },
      { id: 'g2', isNitroxCertified: false },
    ]
    const documents = [
      { guestId: 'g1', kind: 'passport_ine' as const },
      { guestId: 'g1', kind: 'dive_cert' as const },
      { guestId: 'g1', kind: 'dive_insurance' as const },
      { guestId: 'g1', kind: 'nitrox_cert' as const },
      { guestId: 'g2', kind: 'passport_ine' as const },
      { guestId: 'g2', kind: 'dive_cert' as const },
    ]
    expect(enforceDocRequirements(guests, documents)).toEqual([
      { guestId: 'g2', kind: 'dive_insurance' },
    ])
  })

  it('ignores documents belonging to unknown guests', () => {
    const guests = [{ id: 'g1', isNitroxCertified: false }]
    const documents = [
      { guestId: 'g1', kind: 'passport_ine' as const },
      { guestId: 'g1', kind: 'dive_cert' as const },
      { guestId: 'g1', kind: 'dive_insurance' as const },
      { guestId: 'ghost', kind: 'passport_ine' as const },
    ]
    expect(enforceDocRequirements(guests, documents)).toEqual([])
  })
})

describe('assertEditable', () => {
  it('does not throw for draft, submitted, or rejected', () => {
    expect(() => assertEditable('draft')).not.toThrow()
    expect(() => assertEditable('submitted')).not.toThrow()
    expect(() => assertEditable('rejected')).not.toThrow()
  })

  it('throws for approved', () => {
    expect(() => assertEditable('approved')).toThrow()
  })
})
