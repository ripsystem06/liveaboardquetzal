'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { ReservationStatusBadge } from './reservation-status-badge'
import { ReservationActions } from './reservation-actions'
import { Calendar, Users, MapPin, AlertCircle } from 'lucide-react'
import type { ReservationData } from '@/lib/db'

interface ReservationListProps {
  userId: string
}

export function ReservationList({ userId }: ReservationListProps) {
  const { t } = useLanguage()
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/reservations?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch reservations')
        }
        const data = await response.json()
        setReservations(data.reservations || [])
      } catch (err) {
        setError(t('account.reservations.error'))
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchReservations()
    }
  }, [userId, t])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">{t('account.reservations.title')}</h3>
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t('account.reservations.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">{t('account.reservations.title')}</h3>
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">{t('account.reservations.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('account.reservations.empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">{t('account.reservations.title')}</h3>
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  )
}

function ReservationCard({ reservation }: { reservation: ReservationData }) {
  const { t } = useLanguage()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const holdExpiryDate = reservation.holdExpiry
    ? formatDate(reservation.holdExpiry.toISOString())
    : null

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-primary">{reservation.cruiseName}</h4>
          <ReservationStatusBadge status={reservation.status as ReservationStatusBadgeProps['status']} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4" />
          <span>{formatDate(reservation.departureDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4" />
          <span className="truncate">{reservation.route}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span>{reservation.guestCount} {t('booking.payment.guests').toLowerCase()}</span>
        </div>
        <div className="text-muted-foreground capitalize">
          {t(`booking.tier.${reservation.tier}`)} — ${(reservation.totalAmount / 100).toLocaleString()} USD
        </div>
      </div>

      {/* Hold expiry warning */}
      {reservation.status === 'pending_approval' && holdExpiryDate && (
        <p className="text-xs text-amber-600">
          {t('reservation.actions.holdExpires').replace('{date}', holdExpiryDate)}
        </p>
      )}

      {/* Actions */}
      <ReservationActions reservation={reservation} />
    </div>
  )
}

type ReservationStatusBadgeProps = {
  status: 'pending_approval' | 'confirmed' | 'expired' | 'cancelled'
}
