'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Badge } from '@/components/ui/badge'

type Reservation = {
  id: string
  cruiseName: string
  date: string
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed'
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    cruiseName: 'Socorro Islands Expedition',
    date: '2026-03-15',
    guests: 2,
    totalPrice: 6998,
    status: 'confirmed',
  },
  {
    id: '2',
    cruiseName: 'Sea of Cortez Adventure',
    date: '2026-07-09',
    guests: 4,
    totalPrice: 9400,
    status: 'pending',
  },
  {
    id: '3',
    cruiseName: 'Mag Bay + Socorro',
    date: '2025-10-16',
    guests: 2,
    totalPrice: 10398,
    status: 'completed',
  },
]

export function ReservationHistory() {
  const { t } = useLanguage()
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    // Try to read from localStorage first
    try {
      const stored = localStorage.getItem('quetzal_reservations')
      if (stored) {
        setReservations(JSON.parse(stored))
      } else {
        // Seed with mock data if empty
        localStorage.setItem('quetzal_reservations', JSON.stringify(MOCK_RESERVATIONS))
        setReservations(MOCK_RESERVATIONS)
      }
    } catch {
      setReservations(MOCK_RESERVATIONS)
    }
  }, [])

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('account.noReservations')}
      </div>
    )
  }

  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<Reservation['status'], 'default' | 'secondary' | 'outline'> = {
      pending: 'default', // yellow/amber
      confirmed: 'secondary', // blue
      completed: 'outline', // green-ish
    }
    return (
      <Badge variant={variants[status]}>
        {t(`account.status.${status}`)}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="border rounded-lg p-4 space-y-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{reservation.cruiseName}</h3>
              <p className="text-sm text-muted-foreground">
                {reservation.date} • {reservation.guests} guests
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${reservation.totalPrice.toLocaleString()}</p>
              {getStatusBadge(reservation.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}