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

export type BookingStep = 1 | 2 | 3 | 4
export type CabinType = 'single' | 'double' | 'twin' | 'suite'

export interface CabinDetails {
  count: number | null
  types: CabinType[]
}

export interface BookingState {
  // Guests are always first; authentication is required only before submission.
  step: BookingStep
  selectedCruise: Cruise | null
  selectedTier: 'basic' | 'standard' | 'premium' | null
  guestCount: number
  cabinDetails: CabinDetails
  termsAccepted: boolean
  bookingConfirmed: boolean
  loginCompleted: boolean
  availableCruises: Cruise[]
  cruisesLoading: boolean
  cruisesError: string | null
}

export const initialBookingState: BookingState = {
  step: 1,
  selectedCruise: null,
  selectedTier: null,
  guestCount: 1,
  cabinDetails: { count: null, types: [] },
  termsAccepted: false,
  bookingConfirmed: false,
  loginCompleted: false,
  availableCruises: [],
  cruisesLoading: true,
  cruisesError: null,
}

export type BookingAction =
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_TIER'; tier: 'basic' | 'standard' | 'premium' }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'SET_CABIN_COUNT'; count: number | null }
  | { type: 'TOGGLE_CABIN_TYPE'; cabinType: CabinType; checked: boolean }
  | { type: 'SET_TERMS_ACCEPTED'; accepted: boolean }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_BOOKING' }
  | { type: 'LOGIN_COMPLETED' }
  | { type: 'SET_CRUISES'; cruises: Cruise[] }
  | { type: 'SET_CRUISES_ERROR'; error: string }

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SELECT_CRUISE':
      return { ...state, selectedCruise: action.cruise, selectedTier: null }
    case 'SET_TIER':
      return { ...state, selectedTier: action.tier }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.count }
    case 'SET_CABIN_COUNT':
      return { ...state, cabinDetails: { ...state.cabinDetails, count: action.count } }
    case 'TOGGLE_CABIN_TYPE': {
      const types = action.checked
        ? [...state.cabinDetails.types, action.cabinType]
        : state.cabinDetails.types.filter((type) => type !== action.cabinType)
      return { ...state, cabinDetails: { ...state.cabinDetails, types } }
    }
    case 'SET_TERMS_ACCEPTED':
      return { ...state, termsAccepted: action.accepted }
    case 'ADVANCE_STEP': {
      // Date selection requires a cruise + tier; everything else advances freely.
      if (state.step === 2 && (!state.selectedCruise || !state.selectedTier)) return state
      if (state.step >= 4) return state
      return { ...state, step: (state.step + 1) as BookingStep }
    }
    case 'GO_BACK': {
      if (state.step <= 1) return state
      const newStep = (state.step - 1) as BookingStep
      return { ...state, step: newStep }
    }
    case 'CONFIRM_BOOKING':
      return { ...state, bookingConfirmed: true }
    case 'LOGIN_COMPLETED':
      return { ...state, loginCompleted: true }
    case 'SET_CRUISES':
      return { ...state, availableCruises: action.cruises, cruisesLoading: false, cruisesError: null }
    case 'SET_CRUISES_ERROR':
      return { ...state, cruisesError: action.error, cruisesLoading: false }
    default:
      return state
  }
}

export function BookingPageClient({ oauthStep: _oauthStep }: { oauthStep?: number }) {
  const { isAuthenticated } = useUser()

  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialBookingState,
    loginCompleted: isAuthenticated,
  })

  useEffect(() => {
    async function fetchCruises() {
      try {
        const res = await fetch('/api/cruises/calendar')
        if (!res.ok) throw new Error('Failed to fetch cruises')
        const data = await res.json()
        const cruises: Cruise[] = (data.expeditions || []).map((exp: Record<string, unknown>) => ({
          id: exp.id as string,
          name: exp.name as string,
          departureDate: exp.departureDate as string,
          returnDate: exp.returnDate as string,
          route: exp.route as string,
          tiers: {
            basic: (exp.basicPrice as number) || 0,
            standard: (exp.standardPrice as number) || 0,
            premium: (exp.premiumPrice as number) || 0,
          },
          dives: (exp.dives as number) || 0,
          boat: exp.boat as string | undefined,
        }))
        dispatch({ type: 'SET_CRUISES', cruises })
      } catch (err) {
        dispatch({ type: 'SET_CRUISES_ERROR', error: err instanceof Error ? err.message : 'Failed to load cruises' })
      }
    }
    fetchCruises()
  }, [])

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <BookingFlow
        step={state.step}
        isAuthenticated={isAuthenticated}
        selectedCruise={state.selectedCruise}
        guestCount={state.guestCount}
        bookingConfirmed={state.bookingConfirmed}
        availableCruises={state.availableCruises}
        cruisesLoading={state.cruisesLoading}
        cruisesError={state.cruisesError}
        state={state}
        dispatch={dispatch}
      />
    </div>
  )
}
