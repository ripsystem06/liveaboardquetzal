'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import type { Dispatch } from 'react'
import { Button } from '@/components/ui/button'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
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
  dispatch: Dispatch<BookingAction>
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
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

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
          {/* Auth Tabs — pill style */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-full mb-8">
            <button
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                authTab === 'login'
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('booking.register.loginTab')}
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                authTab === 'register'
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('booking.register.registerTab')}
            </button>
          </div>

          {authTab === 'login' ? (
            <LoginForm dispatch={dispatch} />
          ) : (
            <RegisterForm dispatch={dispatch} />
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-primary">{t('booking.cruise.title')}</h2>
          </div>

          <div className="flex flex-col gap-4">
            {MOCK_CRUISES.map((cruise) => (
              <CruiseCard
                key={cruise.id}
                cruise={cruise}
                onSelect={handleCruiseSelect}
                isSelected={selectedCruise?.id === cruise.id}
                isLoginRequired={!isAuthenticated}
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