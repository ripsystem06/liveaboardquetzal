import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BookingFlow } from './booking-flow'
import type { BookingState, Cruise } from './booking-page-client'

const mockCruise: Cruise = {
  id: 'socorro-1',
  name: 'Socorro Islands',
  departureDate: '2026-03-15',
  returnDate: '2026-03-24',
  route: 'Revillagigedo Archipelago',
  tiers: { basic: 2500, standard: 3000, premium: 3500 },
  dives: 5,
  boat: 'Quetzal',
}

const mockState = {
  step: 1,
  selectedCruise: null,
  selectedTier: null,
  guestCount: 1,
  cabinDetails: { count: null, types: [] },
  termsAccepted: false,
  bookingConfirmed: false,
  loginCompleted: false,
  availableCruises: [],
  cruisesLoading: false,
  cruisesError: null,
} as BookingState

describe('BookingFlow', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    mockDispatch.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function renderFlow(overrides: Partial<BookingState> = {}, extraProps: Partial<Parameters<typeof BookingFlow>[0]> = {}) {
    const state: BookingState = { ...mockState, ...overrides }
    return renderWithProviders(
      <BookingFlow
        step={state.step}
        isAuthenticated={extraProps.isAuthenticated ?? true}
        selectedCruise={extraProps.selectedCruise ?? state.selectedCruise}
        guestCount={extraProps.guestCount ?? state.guestCount}
        bookingConfirmed={extraProps.bookingConfirmed ?? state.bookingConfirmed}
        availableCruises={extraProps.availableCruises ?? state.availableCruises}
        cruisesLoading={extraProps.cruisesLoading ?? state.cruisesLoading}
        cruisesError={extraProps.cruisesError ?? state.cruisesError}
        state={state}
        dispatch={extraProps.dispatch ?? mockDispatch}
      />,
    )
  }

  it('renders guests as step 1 and never renders authentication before it', () => {
    renderFlow({ step: 1 }, { isAuthenticated: false })

    expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /login/i })).not.toBeInTheDocument()
  })

  it('shows the shared half-charter notice for groups below ten guests', () => {
    renderFlow({ step: 1, guestCount: 5 })

    expect(screen.getByText(/shared half charter/i)).toBeInTheDocument()
  })

  it('renders cruise cards at the date step', () => {
    renderFlow({ step: 2, availableCruises: [mockCruise] })

    expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
  })

  it('captures cabin count and types through structured controls', async () => {
    const user = userEvent.setup()
    renderFlow({ step: 3 })

    await user.clear(screen.getByRole('spinbutton', { name: /cabin count/i }))
    await user.type(screen.getByRole('spinbutton', { name: /cabin count/i }), '4')
    await user.click(screen.getByRole('checkbox', { name: /double cabins/i }))

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_CABIN_COUNT', count: 4 })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_CABIN_TYPE', cabinType: 'double', checked: true })
  })

  it('allows omission of optional cabin details', () => {
    renderFlow({ step: 3, cabinDetails: { count: null, types: [] } })

    expect(screen.getByText(/optional/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
  })

  it('requires authentication before enabling reservation submission', () => {
    renderFlow(
      { step: 4, selectedCruise: mockCruise, selectedTier: 'standard', termsAccepted: true },
      { isAuthenticated: false },
    )

    expect(screen.getByText(/sign in to submit your reservation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit reservation/i })).toBeDisabled()
  })

  it('does not offer payment UI during booking', () => {
    renderFlow({ step: 4, selectedCruise: mockCruise, selectedTier: 'standard', termsAccepted: true })

    expect(screen.queryByRole('button', { name: /pay/i })).not.toBeInTheDocument()
  })

  it('submits structured cabin details for an authenticated guest', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 'res-1', status: 'pending_approval' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    renderFlow({
      step: 4,
      selectedCruise: mockCruise,
      selectedTier: 'standard',
      termsAccepted: true,
      cabinDetails: { count: 4, types: ['double', 'twin'] },
    })

    await user.click(screen.getByRole('button', { name: /submit reservation/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.cabinDetails).toEqual({ count: 4, types: ['double', 'twin'] })
    expect(body.termsVersion).toBe(3)
  })
})
