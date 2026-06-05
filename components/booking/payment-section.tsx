'use client'

import { useState } from 'react'
import { CreditCard, Building2, Wallet } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-serif text-primary">{t('booking.payment.summary')}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('booking.payment.cruise')}:</span>
            <span className="font-medium text-primary">{cruise.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('booking.payment.guests')}:</span>
            <span className="font-medium text-primary">{guestCount}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-medium text-primary">{t('booking.payment.total')}:</span>
            <span className="font-serif text-xl text-accent">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => handlePay('card')}
          disabled={isProcessing}
          className="w-full bg-secondary hover:bg-secondary/90"
          size="lg"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {t('booking.payment.payWithCard')}
        </Button>

        <Button
          onClick={() => handlePay('paypal')}
          disabled={isProcessing}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {t('booking.payment.payWithPaypal')}
        </Button>

        <Button
          onClick={() => handlePay('bank')}
          disabled={isProcessing}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Building2 className="h-4 w-4 mr-2" />
          {t('booking.payment.payWithBank')}
        </Button>
      </div>

      {isProcessing && (
        <p className="text-center text-muted-foreground">{t('booking.payment.confirming')}</p>
      )}
    </div>
  )
}