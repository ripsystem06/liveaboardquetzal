'use client'

import { useReducer, useEffect } from 'react'
import { useUser } from '@/contexts/user-context'
import { BookingFlow } from './booking-flow'

export interface CruiseTier {
  basic: number
  standard: number
  premium: number
}

export interface Cruise {
  id: string
  name: string
  departureDate: string
  returnDate: string
  route: string
  tiers: CruiseTier
  dives: number
  boat?: string
}

export const MOCK_CRUISES: Cruise[] = [
  { id: 'socorro-1', name: 'Socorro Islands', departureDate: '2026-03-15', returnDate: '2026-03-24', route: 'Revillagigedo Archipelago', tiers: { basic: 2500, standard: 3000, premium: 3500 }, dives: 5, boat: 'Quetzal' },
  { id: 'cortez-1', name: 'Sea of Cortez', departureDate: '2026-07-09', returnDate: '2026-07-18', route: 'Bahía de La Paz', tiers: { basic: 1800, standard: 2350, premium: 2900 }, dives: 5, boat: 'Quetzal' },
  { id: 'magbay-1', name: 'Mag Bay + Socorro', departureDate: '2026-10-16', returnDate: '2026-10-25', route: 'Bahía Magdalena → Socorro', tiers: { basic: 4200, standard: 5199, premium: 6200 }, dives: 5, boat: 'Quetzal' },
]

export interface BookingState {
  step: 1 | 2 | 3
  selectedCruise: Cruise | null
  selectedTier: 'basic' | 'standard' | 'premium' | null
  guestCount: number
  bookingConfirmed: boolean
  loginCompleted: boolean
}

export const initialBookingState: BookingState = {
  step: 1,
  selectedCruise: null,
  selectedTier: null,
  guestCount: 1,
  bookingConfirmed: false,
  loginCompleted: false,
}

export type BookingAction =
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_TIER'; tier: 'basic' | 'standard' | 'premium' }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'LOGIN_COMPLETED' }
  | { type: 'RESET_TO_LOGIN' }

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SELECT_CRUISE':
      return { ...state, selectedCruise: action.cruise, selectedTier: null }
    case 'SET_TIER':
      return { ...state, selectedTier: action.tier }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.count }
    case 'ADVANCE_STEP': {
      // Step gating: reject advancement unless prerequisites are met
      if (state.step === 2 && (!state.selectedCruise || !state.selectedTier)) return state
      if (state.step >= 3) return state
      const newState = { ...state, step: (state.step + 1) as 1 | 2 | 3 }
      // Mark login as completed when advancing from step 1
      if (state.step === 1) {
        return { ...newState, loginCompleted: true }
      }
      return newState
    }
    case 'GO_BACK':
      if (state.step <= 1) return state
      const newStep = (state.step - 1) as 1 | 2 | 3
      // Reset loginCompleted when going back to step 1
      if (state.step === 2) {
        return { ...state, step: newStep, loginCompleted: false }
      }
      return { ...state, step: newStep }
    case 'CONFIRM_PAYMENT':
      return { ...state, bookingConfirmed: true }
    case 'LOGIN_COMPLETED':
      return { ...state, loginCompleted: true, step: 2 }
    case 'RESET_TO_LOGIN':
      return { ...initialBookingState, step: 1 }
    default:
      return state
  }
}

export function BookingPageClient() {
  const { isAuthenticated } = useUser()
  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialBookingState,
    step: isAuthenticated ? 2 : 1,
  })

  // Reset to login step when user logs out while on a later step
  useEffect(() => {
    if (!isAuthenticated && state.step > 1) {
      dispatch({ type: 'RESET_TO_LOGIN' })
    }
  }, [isAuthenticated, state.step])

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <BookingFlow
        step={state.step}
        isAuthenticated={isAuthenticated}
        selectedCruise={state.selectedCruise}
        guestCount={state.guestCount}
        bookingConfirmed={state.bookingConfirmed}
        state={state}
        dispatch={dispatch}
      />
    </div>
  )
}