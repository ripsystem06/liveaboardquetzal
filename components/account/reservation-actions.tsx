'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { FileDown, Mail, MessageCircle, ClipboardList } from 'lucide-react'
import type { ReservationData } from '@/lib/db'

interface ReservationActionsProps {
  reservation: ReservationData
}

export function ReservationActions({ reservation }: ReservationActionsProps) {
  const { t } = useLanguage()
  const isPending = reservation.status === 'pending_approval'
  const isBankTransfer = reservation.paymentMethod === 'bank_transfer'
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

  if (!isPending) {
    return null
  }

  const whatsappText = encodeURIComponent(
    `Reservation ID: ${reservation.id}\nCruise: ${reservation.cruiseName}\nTotal: $${reservation.totalAmount.toLocaleString()} USD`
  )

  return (
    <div className="flex flex-wrap gap-2">
      {isBankTransfer && (
        <button
          onClick={() => window.open(`/api/reservations/${reservation.id}/pdf`)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <FileDown className="size-3.5" />
          {t('reservation.actions.downloadPdf')}
        </button>
      )}

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
