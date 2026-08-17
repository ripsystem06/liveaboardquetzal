'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { useUser } from '@/contexts/user-context'
import type { Dispatch } from 'react'
import { Button } from '@/components/ui/button'
import { LoginForm } from './login-form'
import { CruiseCard } from './cruise-card'
import { GuestSelector } from './guest-selector'
import { PaymentSection } from './payment-section'
import { type BookingState, type BookingAction, type Cruise } from './booking-page-client'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface BookingFlowProps {
  step: 1 | 2 | 3
  isAuthenticated: boolean
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
  availableCruises: Cruise[]
  cruisesLoading: boolean
  cruisesError: string | null
  state: BookingState
  dispatch: Dispatch<BookingAction>
  paypalClientId?: string
  paypalEnvironment?: 'sandbox' | 'production'
}

function calculatePayment(tierPrice: number, guestCount: number) {
  const freeSpaces = guestCount >= 8 ? Math.floor(guestCount / 8) : 0
  const paidSpaces = guestCount - freeSpaces
  const total = tierPrice * paidSpaces
  return { freeSpaces, paidSpaces, total }
}

export function BookingFlow({
  step,
  isAuthenticated,
  selectedCruise,
  guestCount,
  bookingConfirmed,
  availableCruises,
  cruisesLoading,
  cruisesError,
  state,
  dispatch,
  paypalClientId,
  paypalEnvironment,
}: BookingFlowProps) {
  const { t } = useLanguage()
  const { user } = useUser()
  const router = useRouter()
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [lastPaymentMethod, setLastPaymentMethod] = useState<'paypal' | 'bank_transfer' | null>(null)

  const handleCruiseSelect = (cruise: Cruise) => {
    dispatch({ type: 'SELECT_CRUISE', cruise })
  }

  const handleTierSelect = (tier: 'basic' | 'standard' | 'premium') => {
    dispatch({ type: 'SET_TIER', tier })
  }

  const handleGuestChange = (count: number) => {
    dispatch({ type: 'SET_GUEST_COUNT', count })
  }

  const handleNext = () => {
    dispatch({ type: 'ADVANCE_STEP' })
  }

  const handleBack = () => {
    dispatch({ type: 'GO_BACK' })
  }

  const handlePaymentComplete = (id: string, paymentMethod: 'paypal' | 'bank_transfer') => {
    setReservationId(id)
    setLastPaymentMethod(paymentMethod)
    dispatch({ type: 'CONFIRM_PAYMENT' })
  }

  if (bookingConfirmed && reservationId) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex size-20 items-center justify-center rounded-full bg-accent/10">
            <Check className="size-10 text-accent" />
          </div>
        </div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-3 text-balance">{t('booking.confirmation.title')}</h2>
        <p className="text-muted-foreground mb-6 text-pretty">{t('booking.confirmation.message')}</p>

        {/* Reservation details */}
        <div className="rounded-xl bg-muted/50 p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('booking.confirmation.reservationId')}</span>
            <span className="font-mono font-medium text-primary">{reservationId}</span>
          </div>
          {lastPaymentMethod && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('booking.confirmation.paymentMethod')}</span>
              <span className="font-medium text-primary capitalize">
                {lastPaymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}
              </span>
            </div>
          )}
          {lastPaymentMethod === 'bank_transfer' && (
            <p className="text-xs text-muted-foreground pt-2">
              {t('reservation.actions.holdExpires')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="rounded-full px-8 py-3 bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
            <Link href="/">{t('booking.confirmation.backHome')}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8 py-3 font-semibold active:scale-[0.96] transition-transform">
            <Link href={`/account?reservation=${reservationId}`}>{t('booking.confirmation.viewAccount')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (bookingConfirmed) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex size-20 items-center justify-center rounded-full bg-accent/10">
            <Check className="size-10 text-accent" />
          </div>
        </div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-3 text-balance">{t('booking.confirmation.title')}</h2>
        <p className="text-muted-foreground mb-8 text-pretty">{t('booking.confirmation.message')}</p>
        <Button asChild className="rounded-full px-8 py-3 bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
          <Link href="/">{t('booking.confirmation.backHome')}</Link>
        </Button>
      </div>
    )
  }

  const tierPrice = selectedCruise ? selectedCruise.tiers[state.selectedTier || 'basic'] : 0
  const { freeSpaces, paidSpaces, total } = calculatePayment(tierPrice, guestCount)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                step >= s
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="size-5" /> : s}
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-0.5 mx-1 rounded-full transition-colors duration-300 ${
                  step > s ? 'bg-accent' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <span className="text-sm uppercase tracking-wide text-muted-foreground">
          {step === 1 && t('booking.steps.login')}
          {step === 2 && t('booking.steps.selectCruise')}
          {step === 3 && t('booking.steps.payment')}
        </span>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="max-w-md mx-auto">
          <LoginForm dispatch={dispatch} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-primary">{t('booking.cruise.title')}</h2>
          </div>

          {cruisesLoading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('calendar.loading')}</p>
            </div>
          )}

          {cruisesError && !cruisesLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <p className="text-sm text-destructive">{cruisesError}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-full"
              >
                Retry
              </Button>
            </div>
          )}

          {!cruisesLoading && !cruisesError && availableCruises.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <p className="text-sm text-muted-foreground">No expeditions available at this time</p>
            </div>
          )}

          {!cruisesLoading && availableCruises.length > 0 && (
            <>
              <div className="flex flex-col gap-4 rounded-2xl bg-muted/20 p-4 sm:p-6">
                {availableCruises.map((cruise) => (
                  <CruiseCard
                    key={cruise.id}
                    cruise={cruise}
                    onSelect={handleCruiseSelect}
                    onSelectTier={handleTierSelect}
                    isSelected={selectedCruise?.id === cruise.id}
                    isLoginRequired={!isAuthenticated}
                    selectedTier={selectedCruise?.id === cruise.id ? state.selectedTier : null}
                  />
                ))}
              </div>

              {selectedCruise && !state.selectedTier && (
                <p className="text-sm text-muted-foreground text-center">{t('booking.tier.selectHint')}</p>
              )}

              <div className="border-t border-border pt-6">
                <GuestSelector value={guestCount} onChange={handleGuestChange} />
              </div>

              {/* Full Charter CTA */}
              <div className="rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-primary">{t('booking.fullCharter.label')}</h3>
                  <p className="text-sm text-muted-foreground">{t('booking.fullCharter.description')}</p>
                  <Button
                    onClick={() => router.push('/contacto')}
                    className="rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-fit"
                  >
                    {t('booking.fullCharter.cta')}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>
                  {t('booking.flow.back')}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedCruise || !state.selectedTier}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {t('booking.flow.next')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && selectedCruise && state.selectedTier && isAuthenticated && (
        <div className="space-y-6">
          <PaymentSection
            cruise={selectedCruise}
            selectedTier={state.selectedTier}
            guestCount={guestCount}
            cruiseId={selectedCruise.id}
            departureDate={selectedCruise.departureDate}
            route={selectedCruise.route}
            tierPrice={tierPrice}
            freeSpaces={freeSpaces}
            paidSpaces={paidSpaces}
            totalAmount={total}
            userId={user?.id || 'demo-user'}
            paypalClientId={paypalClientId}
            paypalEnvironment={paypalEnvironment}
            onPaymentComplete={handlePaymentComplete}
          />

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              {t('booking.flow.back')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
