'use client'

import { useState } from 'react'
import { CreditCard, Building2, Wallet, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { Cruise } from './booking-page-client'

interface PaymentSectionProps {
  cruise: Cruise
  selectedTier: 'basic' | 'standard' | 'premium'
  guestCount: number
  cruiseId: string
  departureDate: string
  route: string
  tierPrice: number
  freeSpaces: number
  paidSpaces: number
  totalAmount: number
  userId: string
  onPaymentComplete: (reservationId: string, paymentMethod: 'paypal' | 'bank_transfer') => void
}

export function PaymentSection({
  cruise,
  selectedTier,
  guestCount,
  cruiseId,
  departureDate,
  route,
  tierPrice,
  freeSpaces,
  paidSpaces,
  totalAmount,
  userId,
  onPaymentComplete,
}: PaymentSectionProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank_transfer' | null>(null)

  const isHalfCharter = guestCount >= 8

  const handlePay = async (method: 'card' | 'paypal' | 'bank') => {
    // For now, treat card as PayPal flow
    const selectedMethod: 'paypal' | 'bank_transfer' = method === 'paypal' || method === 'card' ? 'paypal' : 'bank_transfer'

    setIsProcessing(true)
    setError(null)
    setPaymentMethod(selectedMethod)

    try {
      // Step 1: Create reservation
      const createResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cruiseId,
          cruiseName: cruise.name,
          departureDate,
          route,
          tier: selectedTier,
          tierPrice,
          guestCount,
          paymentMethod: selectedMethod,
        }),
      })

      if (!createResponse.ok) {
        if (createResponse.status === 409) {
          throw new Error('DATE_BLOCKED')
        }
        if (createResponse.status === 401) {
          throw new Error('AUTH_REQUIRED')
        }
        throw new Error('CREATE_FAILED')
      }

      const reservation = await createResponse.json()

      // Step 2: For PayPal, confirm immediately
      if (selectedMethod === 'paypal') {
        const confirmResponse = await fetch(`/api/reservations/${reservation.id}/confirm`, {
          method: 'POST',
        })

        if (!confirmResponse.ok) {
          throw new Error('CONFIRM_FAILED')
        }
      } else {
        // Step 2: For bank transfer, download PDF
        window.open(`/api/reservations/${reservation.id}/pdf`, '_blank')
      }

      // Step 3: Notify parent
      onPaymentComplete(reservation.id, selectedMethod)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'DATE_BLOCKED') {
          setError(t('booking.payment.dateBlocked'))
        } else if (err.message === 'AUTH_REQUIRED') {
          setError(t('booking.payment.authRequired'))
        } else {
          setError(t('booking.payment.error'))
        }
      } else {
        setError(t('booking.payment.error'))
      }
    } finally {
      setIsProcessing(false)
      setPaymentMethod(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
        <h3 className="text-xl font-serif font-bold text-primary mb-6 text-balance">{t('booking.payment.summary')}</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('booking.payment.cruise')}</span>
            <span className="text-sm font-semibold text-primary">{cruise.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('booking.confirmation.tier')}</span>
            <span className="text-sm font-semibold text-primary capitalize">{t(`booking.tier.${selectedTier}`)} (${tierPrice.toLocaleString()} {t('booking.payment.tierPrice')})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('booking.payment.guests')}</span>
            <span className="text-sm font-semibold text-primary">{guestCount}</span>
          </div>
          {isHalfCharter && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('booking.payment.freeSpaces')}</span>
                <span className="text-sm font-semibold text-primary">{freeSpaces}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('booking.payment.paidSpaces')}</span>
                <span className="text-sm font-semibold text-primary">{paidSpaces}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-base font-semibold text-primary">{t('booking.payment.total')}</span>
            <span className="font-serif text-2xl font-bold text-accent tabular-nums">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          {t('booking.payment.payWithCard') ? 'Payment Method' : ''}
        </p>

        {[
          { method: 'card' as const, icon: CreditCard, label: t('booking.payment.payWithCard') },
          { method: 'paypal' as const, icon: Wallet, label: t('booking.payment.payWithPaypal') },
          { method: 'bank' as const, icon: Building2, label: t('booking.payment.payWithBank') },
        ].map(({ method, icon: Icon, label }) => (
          <button
            key={method}
            onClick={() => handlePay(method)}
            disabled={isProcessing}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card px-6 py-5 text-left transition-all hover:border-accent/40 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Icon className="size-6 text-accent" />
            </div>
            <span className="text-base font-semibold text-primary">{label}</span>
            <svg className="ml-auto size-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('booking.payment.processing')}</p>
        </div>
      )}
    </div>
  )
}

function calculatePayment(tierPrice: number, guestCount: number) {
  const freeSpaces = guestCount >= 8 ? Math.floor(guestCount / 8) : 0
  const paidSpaces = guestCount - freeSpaces
  const total = tierPrice * paidSpaces
  return { freeSpaces, paidSpaces, total }
}
