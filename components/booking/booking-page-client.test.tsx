import { describe, it, expect } from 'vitest'
import { bookingReducer, initialBookingState } from './booking-page-client'
import type { BookingState, BookingAction } from './booking-page-client'

describe('bookingReducer', () => {
  const mockCruise = {
    id: 'socorro-1',
    name: 'Socorro Islands',
    departureDate: '2026-03-15',
    route: 'Revillagigedo Archipelago',
    pricePerPerson: 3500,
  }

  describe('SELECT_CRUISE', () => {
    it('sets selectedCruise to the given cruise', () => {
      const action: BookingAction = { type: 'SELECT_CRUISE', cruise: mockCruise }
      const result = bookingReducer(initialBookingState, action)
      expect(result.selectedCruise).toEqual(mockCruise)
    })
  })

  describe('SET_GUEST_COUNT', () => {
    it('sets guestCount to the given count', () => {
      const action: BookingAction = { type: 'SET_GUEST_COUNT', count: 5 }
      const result = bookingReducer(initialBookingState, action)
      expect(result.guestCount).toBe(5)
    })
  })

  describe('ADVANCE_STEP', () => {
    it('advances from step 1 to 2', () => {
      const state: BookingState = { ...initialBookingState }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(2)
    })

    it('advances from step 2 to 3 when cruise is selected', () => {
      const state: BookingState = { ...initialBookingState, step: 2, selectedCruise: mockCruise }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(3)
    })

    it('rejects ADVANCE_STEP from step 2 without cruise selected', () => {
      const state: BookingState = { ...initialBookingState, step: 2, selectedCruise: null }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(2)
    })

    it('does not advance beyond step 3', () => {
      const state: BookingState = { ...initialBookingState, step: 3, selectedCruise: mockCruise }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(3)
    })
  })

  describe('GO_BACK', () => {
    it('goes back from step 2 to 1', () => {
      const state: BookingState = { ...initialBookingState, step: 2 }
      const action: BookingAction = { type: 'GO_BACK' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(1)
    })

    it('goes back from step 3 to 2', () => {
      const state: BookingState = { ...initialBookingState, step: 3 }
      const action: BookingAction = { type: 'GO_BACK' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(2)
    })

    it('stays at step 1 when going back from step 1', () => {
      const state: BookingState = { ...initialBookingState, step: 1 }
      const action: BookingAction = { type: 'GO_BACK' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(1)
    })
  })

  describe('CONFIRM_PAYMENT', () => {
    it('sets bookingConfirmed to true', () => {
      const action: BookingAction = { type: 'CONFIRM_PAYMENT' }
      const result = bookingReducer(initialBookingState, action)
      expect(result.bookingConfirmed).toBe(true)
    })
  })
})

describe('MOCK_CRUISES', () => {
  it('contains 3 cruises', async () => {
    const { MOCK_CRUISES } = await import('./booking-page-client')
    expect(MOCK_CRUISES).toHaveLength(3)
  })

  it('has correct Socorro Islands cruise data', async () => {
    const { MOCK_CRUISES } = await import('./booking-page-client')
    const socorro = MOCK_CRUISES.find((c) => c.id === 'socorro-1')
    expect(socorro).toBeDefined()
    expect(socorro?.pricePerPerson).toBe(3500)
  })

  it('has correct Sea of Cortez cruise data', async () => {
    const { MOCK_CRUISES } = await import('./booking-page-client')
    const cortez = MOCK_CRUISES.find((c) => c.id === 'cortez-1')
    expect(cortez).toBeDefined()
    expect(cortez?.pricePerPerson).toBe(2350)
  })

  it('has correct Mag Bay + Socorro cruise data', async () => {
    const { MOCK_CRUISES } = await import('./booking-page-client')
    const magbay = MOCK_CRUISES.find((c) => c.id === 'magbay-1')
    expect(magbay).toBeDefined()
    expect(magbay?.pricePerPerson).toBe(5199)
  })
})