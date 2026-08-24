import { describe, it, expect } from 'vitest'
import { bookingReducer, initialBookingState } from './booking-page-client'
import type { BookingAction, BookingState } from './booking-page-client'

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

  it('starts with guests as the first booking step', () => {
    expect(initialBookingState.step).toBe(1)
    expect(initialBookingState.guestCount).toBe(1)
  })

  it('advances from guests to date selection', () => {
    expect(bookingReducer(initialBookingState, { type: 'ADVANCE_STEP' }).step).toBe(2)
  })

  it('requires a cruise and tier before leaving date selection', () => {
    const result = bookingReducer(
      { ...initialBookingState, step: 2 },
      { type: 'ADVANCE_STEP' },
    )

    expect(result.step).toBe(2)
  })

  it('advances from a selected date to structured cabin details', () => {
    const state: BookingState = {
      ...initialBookingState,
      step: 2,
      selectedCruise: mockCruise,
      selectedTier: 'standard',
    }

    expect(bookingReducer(state, { type: 'ADVANCE_STEP' }).step).toBe(3)
  })

  it('stores a structured cabin count and types', () => {
    const withCount = bookingReducer(
      initialBookingState,
      { type: 'SET_CABIN_COUNT', count: 4 } as BookingAction,
    )
    const result = bookingReducer(
      withCount,
      { type: 'TOGGLE_CABIN_TYPE', cabinType: 'double', checked: true } as BookingAction,
    )

    expect(result.cabinDetails).toEqual({ count: 4, types: ['double'] })
  })

  it('removes a toggled cabin type without changing the cabin count', () => {
    const state = {
      ...initialBookingState,
      cabinDetails: { count: 2, types: ['double', 'twin'] },
    } as BookingState
    const result = bookingReducer(
      state,
      { type: 'TOGGLE_CABIN_TYPE', cabinType: 'double', checked: false } as BookingAction,
    )

    expect(result.cabinDetails).toEqual({ count: 2, types: ['twin'] })
  })

  it('keeps cabin details optional when no count is selected', () => {
    expect(initialBookingState.cabinDetails).toEqual({ count: null, types: [] })
  })

  it('confirms a completed booking without advancing past the terms step', () => {
    const state = {
      ...initialBookingState,
      step: 4,
      selectedCruise: mockCruise,
      selectedTier: 'standard',
    } as BookingState
    const result = bookingReducer(state, { type: 'CONFIRM_BOOKING' })

    expect(result.bookingConfirmed).toBe(true)
    expect(bookingReducer(state, { type: 'ADVANCE_STEP' }).step).toBe(4)
  })

  it('does not reset booking progress when authentication changes', () => {
    const state = {
      ...initialBookingState,
      step: 3,
      guestCount: 5,
      selectedCruise: mockCruise,
      selectedTier: 'premium',
    } as BookingState
    const result = bookingReducer(state, { type: 'LOGIN_COMPLETED' })

    expect(result.step).toBe(3)
    expect(result.guestCount).toBe(5)
  })
})
