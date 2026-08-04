import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BookingFlow } from './booking-flow'
import type { BookingState, BookingAction, Cruise } from './booking-page-client'

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

describe('BookingFlow', () => {
  const mockState: BookingState = {
    step: 1,
    selectedCruise: null,
    selectedTier: null,
    guestCount: 1,
    bookingConfirmed: false,
    loginCompleted: false,
    availableCruises: [],
    cruisesLoading: false,
    cruisesError: null,
  }

  const mockDispatch = vi.fn()

  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders step indicator with 3 steps', () => {
    renderWithProviders(
      <BookingFlow
        step={1}
        isAuthenticated={false}
        selectedCruise={null}
        guestCount={1}
        bookingConfirmed={false}
        availableCruises={[]}
        cruisesLoading={false}
        cruisesError={null}
        state={mockState}
        dispatch={mockDispatch}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders LoginForm on step 1', () => {
    renderWithProviders(
      <BookingFlow
        step={1}
        isAuthenticated={false}
        selectedCruise={null}
        guestCount={1}
        bookingConfirmed={false}
        availableCruises={[]}
        cruisesLoading={false}
        cruisesError={null}
        state={mockState}
        dispatch={mockDispatch}
      />
    )

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('renders cruise cards on step 2', () => {
    const state: BookingState = { ...mockState, step: 2, loginCompleted: true }
    renderWithProviders(
      <BookingFlow
        step={2}
        isAuthenticated={true}
        selectedCruise={null}
        guestCount={1}
        bookingConfirmed={false}
        availableCruises={[mockCruise]}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
  })

  it('renders back button on step 2', () => {
    const state: BookingState = { ...mockState, step: 2, loginCompleted: true }
    renderWithProviders(
      <BookingFlow
        step={2}
        isAuthenticated={true}
        selectedCruise={null}
        guestCount={1}
        bookingConfirmed={false}
        availableCruises={[mockCruise]}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('renders payment section on step 3', () => {
    const state: BookingState = { ...mockState, step: 3, loginCompleted: true, selectedCruise: mockCruise, selectedTier: 'standard' }
    renderWithProviders(
      <BookingFlow
        step={3}
        isAuthenticated={true}
        selectedCruise={mockCruise}
        guestCount={2}
        bookingConfirmed={false}
        availableCruises={[]}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    // Payment section contains booking summary
    expect(screen.getByText(/socorro islands/i)).toBeInTheDocument()
  })

  it('dispatches GO_BACK when Back is clicked on step 2', async () => {
    const user = userEvent.setup()
    const state: BookingState = { ...mockState, step: 2, loginCompleted: true }
    renderWithProviders(
      <BookingFlow
        step={2}
        isAuthenticated={true}
        selectedCruise={null}
        guestCount={1}
        bookingConfirmed={false}
        availableCruises={[mockCruise]}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GO_BACK' })
  })

  it('shows confirmation view when bookingConfirmed is true', () => {
    const state: BookingState = { ...mockState, step: 3, loginCompleted: true, selectedCruise: mockCruise, selectedTier: 'standard', bookingConfirmed: true }
    renderWithProviders(
      <BookingFlow
        step={3}
        isAuthenticated={true}
        selectedCruise={mockCruise}
        guestCount={2}
        bookingConfirmed={true}
        availableCruises={[]}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument()
  })

  it('confirmation screen shows a link to return home', () => {
    const state: BookingState = {
      ...mockState,
      step: 3,
      loginCompleted: true,
      selectedCruise: mockCruise,
      selectedTier: 'standard',
      bookingConfirmed: true,
    }
    renderWithProviders(
      <BookingFlow
        step={3}
        isAuthenticated={true}
        selectedCruise={mockCruise}
        guestCount={2}
        bookingConfirmed={true}
        availableCruises={[]}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    // The confirmation has a link back to home
    const links = screen.getAllByRole('link')
    const homeLink = links.find(link => link.getAttribute('href') === '/')
    expect(homeLink).toBeInTheDocument()
  })

  it('shows sign-in buttons on step 2 when user is unauthenticated', () => {
    const state: BookingState = { ...mockState, step: 2, loginCompleted: false }
    const threeCruises = [mockCruise, { ...mockCruise, id: 'c1' }, { ...mockCruise, id: 'c2' }]
    renderWithProviders(
      <BookingFlow
        step={2}
        isAuthenticated={false}
        selectedCruise={null}
        guestCount={1}
        bookingConfirmed={false}
        availableCruises={threeCruises}
        cruisesLoading={false}
        cruisesError={null}
        state={state}
        dispatch={mockDispatch}
      />
    )

    expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /sign in/i })).toHaveLength(3)
  })
})