import { describe, it, expect } from 'vitest'
import { bookingReducer, initialBookingState } from './booking-page-client'
import type { BookingState, BookingAction } from './booking-page-client'

describe('bookingReducer', () => {
  const mockCruise = {
    id: 'socorro-1',
    name: 'Socorro Islands',
    departureDate: '2026-03-15',
    returnDate: '2026-03-24',
    route: 'Revillagigedo Archipelago',
    tiers: { basic: 2500, standard: 3000, premium: 3500 },
    dives: 5,
    boat: 'Quetzal',
  }

  describe('SELECT_CRUISE', () => {
    it('sets selectedCruise to the given cruise', () => {
      const action: BookingAction = { type: 'SELECT_CRUISE', cruise: mockCruise }
      const result = bookingReducer(initialBookingState, action)
      expect(result.selectedCruise).toEqual(mockCruise)
    })

    it('resets selectedTier when selecting a new cruise', () => {
      const stateWithTier: BookingState = { ...initialBookingState, selectedTier: 'premium' as const }
      const action: BookingAction = { type: 'SELECT_CRUISE', cruise: mockCruise }
      const result = bookingReducer(stateWithTier, action)
      expect(result.selectedTier).toBeNull()
    })
  })

  describe('SET_TIER', () => {
    it('sets selectedTier to the given tier', () => {
      const action: BookingAction = { type: 'SET_TIER', tier: 'standard' as const }
      const result = bookingReducer(initialBookingState, action)
      expect(result.selectedTier).toBe('standard')
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

    it('advances from step 2 to 3 when cruise and tier are selected', () => {
      const state: BookingState = { ...initialBookingState, step: 2, selectedCruise: mockCruise, selectedTier: 'standard' }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(3)
    })

    it('rejects ADVANCE_STEP from step 2 without cruise selected', () => {
      const state: BookingState = { ...initialBookingState, step: 2, selectedCruise: null, selectedTier: null }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(2)
    })

    it('rejects ADVANCE_STEP from step 2 without tier selected', () => {
      const state: BookingState = { ...initialBookingState, step: 2, selectedCruise: mockCruise, selectedTier: null }
      const action: BookingAction = { type: 'ADVANCE_STEP' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(2)
    })

    it('does not advance beyond step 3', () => {
      const state: BookingState = { ...initialBookingState, step: 3, selectedCruise: mockCruise, selectedTier: 'standard' }
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

    it('preserves selectedTier when going back from step 3 to 2', () => {
      const state: BookingState = { ...initialBookingState, step: 3, selectedCruise: mockCruise, selectedTier: 'premium' }
      const action: BookingAction = { type: 'GO_BACK' }
      const result = bookingReducer(state, action)
      expect(result.step).toBe(2)
      expect(result.selectedTier).toBe('premium')
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