'use client'

import { useLanguage } from '@/contexts/language-context'

interface ReservationStatusBadgeProps {
  status: 'pending_approval' | 'confirmed' | 'expired' | 'cancelled'
}

const statusStyles: Record<ReservationStatusBadgeProps['status'], { bg: string; text: string }> = {
  pending_approval: { bg: 'bg-amber-100', text: 'text-amber-800' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
  expired: { bg: 'bg-red-100', text: 'text-red-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

const statusKeys: Record<ReservationStatusBadgeProps['status'], string> = {
  pending_approval: 'reservation.status.pending',
  confirmed: 'reservation.status.confirmed',
  expired: 'reservation.status.expired',
  cancelled: 'reservation.status.cancelled',
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const { t } = useLanguage()
  const { bg, text } = statusStyles[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${bg} ${text}`}
    >
      {t(statusKeys[status])}
    </span>
  )
}
