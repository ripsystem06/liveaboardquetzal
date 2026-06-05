'use client'

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { LoginForm } from './login-form'
import { CruiseCard } from './cruise-card'
import { GuestSelector } from './guest-selector'
import { PaymentSection } from './payment-section'
import { MOCK_CRUISES, type BookingState, type BookingAction, type Cruise } from './booking-page-client'
import { Check } from 'lucide-react'
import Link from 'next/link'

interface BookingFlowProps {
  step: 1 | 2 | 3
  isAuthenticated: boolean
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
}

export function BookingFlow({
  step,
  isAuthenticated,
  selectedCruise,
  guestCount,
  bookingConfirmed,
  state,
  dispatch,
}: BookingFlowProps) {
  const { t } = useLanguage()

  const handleLoginSuccess = () => {
    dispatch({ type: 'AUTH_SUCCESS' })
    dispatch({ type: 'ADVANCE_STEP' })
  }

  const handleCruiseSelect = (cruise: Cruise) => {
    dispatch({ type: 'SELECT_CRUISE', cruise })
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

  const handlePay = (method: 'card' | 'paypal' | 'bank') => {
    dispatch({ type: 'CONFIRM_PAYMENT' })
  }

  if (bookingConfirmed) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-serif text-primary mb-4">{t('booking.confirmation.title')}</h2>
        <p className="text-muted-foreground mb-6">{t('booking.confirmation.message')}</p>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/">{t('booking.confirmation.backHome')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                step >= s
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {index < 2 && (
              <div
                className={`w-16 h-1 mx-2 ${
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
        <LoginForm onSuccess={handleLoginSuccess} />
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-primary">{t('booking.cruise.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {MOCK_CRUISES.map((cruise) => (
              <CruiseCard
                key={cruise.id}
                cruise={cruise}
                onSelect={handleCruiseSelect}
                isSelected={selectedCruise?.id === cruise.id}
              />
            ))}
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-serif text-primary mb-4">{t('booking.guest.title')}</h3>
            <GuestSelector value={guestCount} onChange={handleGuestChange} />
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              {t('booking.flow.back')}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedCruise}
              className="bg-secondary hover:bg-secondary/90"
            >
              {t('booking.flow.next')}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedCruise && (
        <div className="space-y-6">
          <PaymentSection
            cruise={selectedCruise}
            guestCount={guestCount}
            onPay={handlePay}
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