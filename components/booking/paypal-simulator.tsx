'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Check, ShieldCheck, Clock, CreditCard } from 'lucide-react'

interface PayPalSimulatorProps {
  total: number
  onComplete: () => void
  onCancel: () => void
}

type SimStep = 'checkout' | 'processing' | 'success'

export function PayPalSimulator({ total, onComplete, onCancel }: PayPalSimulatorProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<SimStep>('checkout')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + (100 - prev) * 0.15 + 2
        })
      }, 120)
      return () => clearInterval(interval)
    }
  }, [step])

  useEffect(() => {
    if (progress >= 99) {
      const timer = setTimeout(() => setStep('success'), 400)
      return () => clearTimeout(timer)
    }
  }, [progress])

  const handleContinue = () => {
    if (step === 'checkout') {
      setStep('processing')
      setProgress(0)
    } else if (step === 'success') {
      onComplete()
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden">
        {/* Header with PayPal branding */}
        <div className="bg-[#0070ba] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-white" />
              <span className="text-lg font-bold text-white">PayPal</span>
            </div>
            {step !== 'success' && (
              <button onClick={onCancel} className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-8">
          {step === 'checkout' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#0070ba]/10">
                  <ShieldCheck className="size-8 text-[#0070ba]" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-1">PayPal Checkout</h3>
                <p className="text-sm text-muted-foreground">Secure payment simulation</p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment to</span>
                  <span className="font-medium text-primary">Quetzal Liveaboard</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium text-primary">PayPal Balance</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-primary">Total</span>
                  <span className="text-lg font-bold text-[#0070ba]">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full rounded-xl bg-[#0070ba] py-3 text-white font-semibold hover:bg-[#005ea6] active:scale-[0.98] transition-all"
              >
                Pay {formatPrice(total)}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                This is a simulation. No real payment is processed.
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-8 py-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center">
                  <div className="size-10 animate-spin rounded-full border-3 border-[#0070ba]/20 border-t-[#0070ba]" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-1">Processing Payment</h3>
                <p className="text-sm text-muted-foreground">Please wait while we process your transaction...</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0070ba] transition-all duration-200 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
                <Check className="size-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">Payment Successful</h3>
                <p className="text-sm text-muted-foreground">{formatPrice(total)} USD</p>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
                <div className="flex items-start gap-3">
                  <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      Pending Admin Approval
                    </p>
                    <p className="text-xs text-amber-700">
                      Your reservation has been submitted and is now pending review by our team. 
                      You will be notified once it is approved. The selected date is temporarily held for you.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onComplete}
                className="w-full rounded-xl bg-primary py-3 text-primary-foreground font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                View Reservation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
