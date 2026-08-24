'use client'

import { useLanguage } from '@/contexts/language-context'

export type ReservationStatusBadgeStatus =
  | 'pending_approval'
  | 'approved'
  | 'confirmed'
  | 'expired'
  | 'cancelled'

interface ReservationStatusBadgeProps {
  status: ReservationStatusBadgeStatus
}

const statusStyles: Record<ReservationStatusBadgeStatus, { bg: string; text: string }> = {
  pending_approval: { bg: 'bg-amber-100', text: 'text-amber-800' },
  approved: { bg: 'bg-blue-100', text: 'text-blue-800' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
  expired: { bg: 'bg-red-100', text: 'text-red-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

const statusKeys: Record<ReservationStatusBadgeStatus, string> = {
  pending_approval: 'reservation.status.pending',
  approved: 'reservation.status.approved',
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
