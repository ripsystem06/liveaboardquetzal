'use client'

import { useReducer } from 'react'
import { BookingFlow } from './booking-flow'

export interface Cruise {
  id: string
  name: string
  departureDate: string
  route: string
  pricePerPerson: number
}

export const MOCK_CRUISES: Cruise[] = [
  { id: 'socorro-1', name: 'Socorro Islands', departureDate: '2026-03-15', route: 'Revillagigedo Archipelago', pricePerPerson: 3500 },
  { id: 'cortez-1', name: 'Sea of Cortez', departureDate: '2026-07-09', route: 'Bahía de La Paz', pricePerPerson: 2350 },
  { id: 'magbay-1', name: 'Mag Bay + Socorro', departureDate: '2026-10-16', route: 'Bahía Magdalena → Socorro', pricePerPerson: 5199 },
]

export interface BookingState {
  step: 1 | 2 | 3
  isAuthenticated: boolean
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
}

export const initialBookingState: BookingState = {
  step: 1,
  isAuthenticated: false,
  selectedCruise: null,
  guestCount: 1,
  bookingConfirmed: false,
}

export type BookingAction =
  | { type: 'AUTH_SUCCESS' }
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true }
    case 'SELECT_CRUISE':
      return { ...state, selectedCruise: action.cruise }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.count }
    case 'ADVANCE_STEP': {
      // Step gating: reject advancement unless prerequisites are met
      if (state.step === 1 && !state.isAuthenticated) return state
      if (state.step === 2 && !state.selectedCruise) return state
      if (state.step >= 3) return state
      return { ...state, step: (state.step + 1) as 1 | 2 | 3 }
    }
    case 'GO_BACK':
      if (state.step <= 1) return state
      return { ...state, step: (state.step - 1) as 1 | 2 | 3 }
    case 'CONFIRM_PAYMENT':
      return { ...state, bookingConfirmed: true }
    default:
      return state
  }
}

export function BookingPageClient() {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState)

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <BookingFlow
        step={state.step}
        isAuthenticated={state.isAuthenticated}
        selectedCruise={state.selectedCruise}
        guestCount={state.guestCount}
        bookingConfirmed={state.bookingConfirmed}
        state={state}
        dispatch={dispatch}
      />
    </div>
  )
}