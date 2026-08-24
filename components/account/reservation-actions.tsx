'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { CreditCard, Landmark, Mail, MessageCircle, ClipboardList, Loader2, AlertCircle } from 'lucide-react'
import { isReservationPaid } from '@/lib/reservation-config'
import { confirmCardPayment } from '@/lib/stripe-client'
import type { BankAccount } from '@/lib/payment-config'
import type { ReservationData } from '@/lib/db'

interface ReservationActionsProps {
  reservation: ReservationData
}

export function ReservationActions({ reservation }: ReservationActionsProps) {
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState<'card' | 'wire' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wireInstructions, setWireInstructions] = useState<BankAccount[] | null>(null)

  const isExpired = reservation.status === 'expired'

  if (isExpired) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {t('reservation.actions.expiredMessage')}
      </p>
    )
  }

  if (reservation.status === 'confirmed') {
    return (
      <Link
        href={`/account/crew-registration/${reservation.id}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
      >
        <ClipboardList className="size-3.5" />
        {t('crew.cta')}
      </Link>
    )
  }

  // Approved: offer payment (Stripe card + wire transfer) only while unpaid.
  // Payment is post-approval only; a paid reservation offers no further options.
  if (reservation.status === 'approved') {
    if (isReservationPaid(reservation)) {
      return null
    }

    const handleCardPayment = async () => {
      setLoading('card')
      setError(null)
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: reservation.id }),
        })
        if (!res.ok) {
          setError(t('reservation.actions.paymentError'))
          return
        }
        const { clientSecret } = await res.json()
        const confirmError = await confirmCardPayment(clientSecret, window.location.href)
        if (confirmError) setError(confirmError)
      } catch {
        setError(t('reservation.actions.paymentError'))
      } finally {
        setLoading(null)
      }
    }

    const handleWirePayment = async () => {
      setLoading('wire')
      setError(null)
      try {
        const res = await fetch(`/api/reservations/${reservation.id}/payment-method`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: 'wire_transfer' }),
        })
        if (!res.ok) {
          setError(t('reservation.actions.paymentError'))
          return
        }
        const data = await res.json()
        setWireInstructions(data.instructions ?? null)
      } catch {
        setError(t('reservation.actions.paymentError'))
      } finally {
        setLoading(null)
      }
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCardPayment}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {loading === 'card' ? <Loader2 className="size-3.5 animate-spin" /> : <CreditCard className="size-3.5" />}
            {t('reservation.actions.payCard')}
          </button>
          <button
            onClick={handleWirePayment}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {loading === 'wire' ? <Loader2 className="size-3.5 animate-spin" /> : <Landmark className="size-3.5" />}
            {t('reservation.actions.payWire')}
          </button>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        {wireInstructions && <WireInstructions accounts={wireInstructions} language={language} />}
      </div>
    )
  }

  // pending_approval (and any other non-terminal status): share actions only.
  const whatsappText = encodeURIComponent(
    `Reservation ID: ${reservation.id}\nCruise: ${reservation.cruiseName}\nTotal: $${reservation.totalAmount.toLocaleString()} USD`
  )

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`mailto:?subject=Reservation ${reservation.id}&body=${encodeURIComponent(
          `Reservation ID: ${reservation.id}\nCruise: ${reservation.cruiseName}\nDate: ${reservation.departureDate}\nTotal: $${reservation.totalAmount.toLocaleString()} USD`
        )}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        <Mail className="size-3.5" />
        {t('reservation.actions.emailReceipt')}
      </a>

      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-200 transition-colors"
      >
        <MessageCircle className="size-3.5" />
        {t('reservation.actions.whatsappReceipt')}
      </a>
    </div>
  )
}

function WireInstructions({
  accounts,
  language,
}: {
  accounts: BankAccount[]
  language: 'en' | 'es'
}) {
  const { t } = useLanguage()

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-3">
      <p className="text-xs font-semibold text-primary">
        {t('reservation.actions.wireInstructions.title')}
      </p>
      {accounts.map((account, index) => (
        <div
          key={`${account.bankName}-${account.clabe ?? account.routingNumber ?? account.zelle ?? index}`}
          className="text-xs space-y-1 text-muted-foreground"
        >
          <p className="font-medium text-foreground">{account.label[language]}</p>
          <p>{account.beneficiary}</p>
          {account.swift && <p>SWIFT: {account.swift}</p>}
          {account.clabe && <p>CLABE: {account.clabe}</p>}
          {account.routingNumber && <p>{t('reservation.actions.wireRouting')}: {account.routingNumber}</p>}
          {account.accountNumber && <p>{t('reservation.actions.wireAccount')}: {account.accountNumber}</p>}
          {account.zelle && <p>Zelle: {account.zelle}</p>}
        </div>
      ))}
    </div>
  )
}
