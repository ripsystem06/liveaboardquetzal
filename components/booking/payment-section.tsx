'use client'

import { useState } from 'react'
import { CreditCard, Building2, Wallet } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { Cruise } from './booking-page-client'

interface PaymentSectionProps {
  cruise: Cruise
  guestCount: number
  onPay: (method: 'card' | 'paypal' | 'bank') => void
}

export function PaymentSection({ cruise, guestCount, onPay }: PaymentSectionProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)

  const total = cruise.pricePerPerson * guestCount

  const handlePay = (method: 'card' | 'paypal' | 'bank') => {
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      onPay(method)
    }, 500)
  }

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
        <h3 className="text-xl font-serif font-bold text-primary mb-6 text-balance">{t('booking.payment.summary')}</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('booking.payment.cruise')}</span>
            <span className="text-sm font-semibold text-primary">{cruise.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('booking.payment.guests')}</span>
            <span className="text-sm font-semibold text-primary">{guestCount}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-base font-semibold text-primary">{t('booking.payment.total')}</span>
            <span className="font-serif text-2xl font-bold text-accent tabular-nums">${total.toLocaleString()}</span>
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
          <p className="text-sm text-muted-foreground">{t('booking.payment.confirming')}</p>
        </div>
      )}
    </div>
  )
}