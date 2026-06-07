'use client'

import { useReducer } from 'react'
import { useUser } from '@/contexts/user-context'
import { BookingFlow } from './booking-flow'

export interface Cruise {
  id: string
  name: string
  departureDate: string
  route: string
  pricePerPerson: number
  boat?: string
}

export const MOCK_CRUISES: Cruise[] = [
  { id: 'socorro-1', name: 'Socorro Islands', departureDate: '2026-03-15', route: 'Revillagigedo Archipelago', pricePerPerson: 3500, boat: 'Quetzal' },
  { id: 'cortez-1', name: 'Sea of Cortez', departureDate: '2026-07-09', route: 'Bahía de La Paz', pricePerPerson: 2350, boat: 'Quetzal' },
  { id: 'magbay-1', name: 'Mag Bay + Socorro', departureDate: '2026-10-16', route: 'Bahía Magdalena → Socorro', pricePerPerson: 5199, boat: 'Quetzal' },
]

export interface BookingState {
  step: 1 | 2 | 3
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
  loginCompleted: boolean
}

export const initialBookingState: BookingState = {
  step: 1,
  selectedCruise: null,
  guestCount: 1,
  bookingConfirmed: false,
  loginCompleted: false,
}

export type BookingAction =
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'LOGIN_COMPLETED' }

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SELECT_CRUISE':
      return { ...state, selectedCruise: action.cruise }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.count }
    case 'ADVANCE_STEP': {
      // Step gating: reject advancement unless prerequisites are met
      if (state.step === 2 && !state.selectedCruise) return state
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
    default:
      return state
  }
}

export function BookingPageClient() {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState)
  const { isAuthenticated } = useUser()

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