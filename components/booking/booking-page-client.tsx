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

export interface BookingState {
  step: 1 | 2 | 3
  selectedCruise: Cruise | null
  selectedTier: 'basic' | 'standard' | 'premium' | null
  guestCount: number
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
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'LOGIN_COMPLETED' }
  | { type: 'RESET_TO_LOGIN' }
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
    case 'SET_CRUISES':
      return { ...state, availableCruises: action.cruises, cruisesLoading: false, cruisesError: null }
    case 'SET_CRUISES_ERROR':
      return { ...state, cruisesError: action.error, cruisesLoading: false }
    default:
      return state
  }
}

export function BookingPageClient({ oauthStep }: { oauthStep?: number }) {
  const { isAuthenticated } = useUser()

  // Determine initial step: oauthStep from searchParams takes precedence
  const initialStep = (): 1 | 2 | 3 => {
    if (oauthStep === 2 && isAuthenticated) return 2
    if (isAuthenticated) return 2
    return 1
  }

  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialBookingState,
    step: initialStep(),
    loginCompleted: isAuthenticated && oauthStep === 2,
  })

  // Reset to login step when user logs out while on a later step
  useEffect(() => {
    if (!isAuthenticated && state.step > 1) {
      dispatch({ type: 'RESET_TO_LOGIN' })
    }
  }, [isAuthenticated, state.step])

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