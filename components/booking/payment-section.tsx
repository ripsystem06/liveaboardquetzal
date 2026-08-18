'use client'

import { useState } from 'react'
import { CreditCard, Building2, Wallet, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
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
  paypalClientId?: string
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
  paypalClientId,
  onPaymentComplete,
}: PaymentSectionProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paypalReservationId, setPaypalReservationId] = useState<string | null>(null)

  const isHalfCharter = guestCount >= 8

  const createReservation = async (paymentMethod: 'paypal' | 'bank_transfer'): Promise<string> => {
    const createResponse = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cruiseId,
        cruiseName: cruise.name,
        departureDate,
        route,
        tier: selectedTier,
        tierPrice,
        guestCount,
        freeSpaces,
        paidSpaces,
        totalAmount,
        paymentMethod,
      }),
    })

    if (!createResponse.ok) {
      if (createResponse.status === 409) throw new Error('DATE_BLOCKED')
      if (createResponse.status === 401) throw new Error('AUTH_REQUIRED')
      throw new Error('CREATE_FAILED')
    }

    const reservation = await createResponse.json()
    return reservation.id
  }

  const startPayPal = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const reservationId = await createReservation('paypal')
      setPaypalReservationId(reservationId)
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
    }
  }

  const handleBankTransfer = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const reservationId = await createReservation('bank_transfer')
      window.open(`/api/reservations/${reservationId}/pdf`, '_blank')
      onPaymentComplete(reservationId, 'bank_transfer')
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
    }
  }

  const handlePay = (method: 'card' | 'paypal' | 'bank') => {
    // card + paypal both route to PayPal; bank keeps the transfer-PDF flow.
    if (method === 'bank') {
      void handleBankTransfer()
    } else {
      void startPayPal()
    }
  }

  const createPayPalOrder = async (): Promise<string> => {
    if (!paypalReservationId) throw new Error('No pending reservation')
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: paypalReservationId }),
    })
    if (!res.ok) throw new Error('CREATE_ORDER_FAILED')
    const data = (await res.json()) as { orderId: string }
    return data.orderId
  }

  const approvePayPalOrder = async (orderId: string): Promise<void> => {
    if (!paypalReservationId) return
    const res = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: paypalReservationId, orderId }),
    })
    if (!res.ok) {
      setError(t('booking.payment.error'))
      return
    }
    setPaypalReservationId(null)
    onPaymentComplete(paypalReservationId, 'paypal')
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
            <span className="text-sm font-semibold text-primary capitalize">{t(`booking.tier.${selectedTier}`)} (${tierPrice.toLocaleString('en-US')} {t('booking.payment.tierPrice')})</span>
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
            <span className="font-serif text-2xl font-bold text-accent tabular-nums">${totalAmount.toLocaleString('en-US')}</span>
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

      {/* Real PayPal checkout — amount is derived server-side from the reservation */}
      {paypalReservationId && paypalClientId && (
        <PayPalScriptProvider
          options={{ clientId: paypalClientId, currency: 'USD', intent: 'capture' }}
        >
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={createPayPalOrder}
            onApprove={async (data) => {
              await approvePayPalOrder(data.orderID)
            }}
            onCancel={() => setPaypalReservationId(null)}
            onError={() => setError(t('booking.payment.error'))}
          />
        </PayPalScriptProvider>
      )}
    </div>
  )
}
