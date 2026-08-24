'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import type { Dispatch } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { LoginForm } from './login-form'
import { CruiseCard } from './cruise-card'
import { GuestSelector } from './guest-selector'
import { type BookingState, type BookingAction, type BookingStep, type CabinType, type Cruise } from './booking-page-client'
import { activeTermsVersion } from '@/lib/legal/terms'
import { Check, Info, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface BookingFlowProps {
  step: BookingStep
  isAuthenticated: boolean
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
  availableCruises: Cruise[]
  cruisesLoading: boolean
  cruisesError: string | null
  state: BookingState
  dispatch: Dispatch<BookingAction>
}

const STEP_LABELS: { n: BookingStep; key: string }[] = [
  { n: 1, key: 'booking.steps.guests' },
  { n: 2, key: 'booking.steps.date' },
  { n: 3, key: 'booking.steps.cabins' },
  { n: 4, key: 'booking.steps.terms' },
]

const CABIN_TYPES: CabinType[] = ['single', 'double', 'twin', 'suite']

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
}: BookingFlowProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const handleSubmit = async () => {
    if (!selectedCruise || !state.selectedTier || !state.termsAccepted || !isAuthenticated || submitting) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const tierPrice = selectedCruise.tiers[state.selectedTier]
      const { freeSpaces, paidSpaces, total } = calculatePayment(tierPrice, guestCount)

      const body = {
        cruiseId: selectedCruise.id,
        cruiseName: selectedCruise.name,
        departureDate: selectedCruise.departureDate,
        route: selectedCruise.route,
        tier: state.selectedTier,
        tierPrice,
        guestCount,
        freeSpaces,
        paidSpaces,
        totalAmount: total,
        termsVersion: activeTermsVersion,
        ...(state.cabinDetails.count !== null ? { cabinDetails: state.cabinDetails } : {}),
      }

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        setSubmitError(t('booking.terms.error'))
        return
      }

      const created = await res.json()
      setReservationId(created.id)
      dispatch({ type: 'CONFIRM_BOOKING' })
    } catch {
      setSubmitError(t('booking.terms.error'))
    } finally {
      setSubmitting(false)
    }
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
        <p className="text-muted-foreground mb-6 text-pretty">{t('booking.confirmation.message')}</p>

        {reservationId && (
          <div className="rounded-xl bg-muted/50 p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('booking.confirmation.reservationId')}</span>
              <span className="font-mono font-medium text-primary">{reservationId}</span>
            </div>
          </div>
        )}

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

  const tierPrice = selectedCruise && state.selectedTier ? selectedCruise.tiers[state.selectedTier] : 0
  const { total } = calculatePayment(tierPrice, guestCount)
  const currentStepLabel = STEP_LABELS.find((s) => s.n === step)?.key

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Step Indicator */}
      <div className="flex items-start justify-center gap-2 mb-4">
        {STEP_LABELS.map((s, index) => (
          <div key={s.n} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  step >= s.n
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.n ? <Check className="size-5" /> : s.n}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wide ${
                  step >= s.n ? 'text-accent font-semibold' : 'text-muted-foreground'
                }`}
              >
                {t(s.key)}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div
                className={`w-10 h-0.5 mt-5 mx-1 rounded-full transition-colors duration-300 ${
                  step > s.n ? 'bg-accent' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <span className="text-sm uppercase tracking-wide text-muted-foreground">
          {currentStepLabel ? t(currentStepLabel) : ''}
        </span>
      </div>

      {/* Step 1: Guests (first input; half-charter notice for shared groups <10) */}
      {step === 1 && (
        <div className="max-w-md mx-auto space-y-6">
          <GuestSelector value={guestCount} onChange={handleGuestChange} />

          {guestCount < 10 && (
            <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4">
              <Info className="size-5 text-accent mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{t('booking.halfCharter.notice')}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleNext} className="bg-secondary hover:bg-secondary/90">
              {t('booking.flow.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Date (cruise selection + tier) */}
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
              <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full">
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
                    selectedTier={selectedCruise?.id === cruise.id ? state.selectedTier : null}
                  />
                ))}
              </div>

              {selectedCruise && !state.selectedTier && (
                <p className="text-sm text-muted-foreground text-center">{t('booking.tier.selectHint')}</p>
              )}

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

      {/* Step 3: Cabins (optional informational) */}
      {step === 3 && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-primary">{t('booking.cabins.title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('booking.cabins.description')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="cabin-count" className="text-sm font-medium">
              {t('booking.cabins.count')}
            </label>
            <Input
              id="cabin-count"
              type="number"
              min="1"
              max="18"
              value={state.cabinDetails.count ?? ''}
              onChange={(event) => {
                const value = event.target.value
                dispatch({ type: 'SET_CABIN_COUNT', count: value ? Number(value) : null })
              }}
              aria-label={t('booking.cabins.count')}
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">{t('booking.cabins.types')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {CABIN_TYPES.map((cabinType) => (
                <label key={cabinType} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={state.cabinDetails.types.includes(cabinType)}
                    onCheckedChange={(checked) => dispatch({
                      type: 'TOGGLE_CABIN_TYPE',
                      cabinType,
                      checked: checked === true,
                    })}
                    aria-label={t(`booking.cabins.types.${cabinType}`)}
                  />
                  {t(`booking.cabins.types.${cabinType}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              {t('booking.flow.back')}
            </Button>
            <Button
              onClick={handleNext}
              disabled={state.cabinDetails.count !== null && state.cabinDetails.types.length === 0}
              className="bg-secondary hover:bg-secondary/90"
            >
              {t('booking.flow.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Terms & Submit */}
      {step === 4 && selectedCruise && state.selectedTier && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-primary">{t('booking.terms.title')}</h2>
          </div>

          {/* Booking summary */}
          <div className="rounded-2xl bg-muted/30 p-4 space-y-2 text-sm">
            <p className="font-semibold text-primary">{t('booking.summary.title')}</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('booking.payment.cruise')}</span>
              <span className="font-medium">{selectedCruise.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('booking.confirmation.tier')}</span>
              <span className="font-medium">{t(`booking.tier.${state.selectedTier}`)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('booking.payment.guests')}</span>
              <span className="font-medium">{guestCount}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">{t('booking.payment.total')}</span>
              <span className="font-semibold text-primary">${total.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Terms acceptance */}
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={state.termsAccepted}
              onCheckedChange={(checked) =>
                dispatch({ type: 'SET_TERMS_ACCEPTED', accepted: checked === true })
              }
              aria-label={t('booking.terms.label')}
            />
            <span className="text-sm text-foreground">{t('booking.terms.label')}</span>
          </label>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          {!isAuthenticated && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('booking.terms.loginRequired')}</p>
              <LoginForm dispatch={dispatch} />
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              {t('booking.flow.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!state.termsAccepted || !isAuthenticated || submitting}
              className="bg-secondary hover:bg-secondary/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('booking.terms.submitting')}
                </>
              ) : (
                t('booking.terms.submit')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
