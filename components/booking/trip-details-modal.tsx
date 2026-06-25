'use client'

import { X, ShipWheel, Anchor, CalendarArrowDown, Fish, Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { Cruise } from './booking-page-client'

interface TripDetailsModalProps {
  cruise: Cruise
  embarkDate: string
  onClose: () => void
}

export function TripDetailsModal({ cruise, embarkDate, onClose }: TripDetailsModalProps) {
  const { t } = useLanguage()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-serif font-bold text-primary">{cruise.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('booking.cruise.tripDetails')}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('booking.cruise.embarkation')}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">{embarkDate}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Night boarding</p>
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarArrowDown size={14} className="text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('booking.cruise.departure')}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">{formatDate(cruise.departureDate)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">→ {formatDate(cruise.returnDate)}</p>
            </div>
          </div>

          {/* Trip Info */}
          <div className="space-y-3">
            {cruise.boat && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/10 shrink-0">
                  <ShipWheel size={16} className="text-accent" />
                </div>
                <div>
                  <span className="font-medium text-primary">{cruise.boat}</span>
                  <span className="text-muted-foreground ml-1">— {t('booking.cruise.boat')}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <Anchor size={16} className="text-accent" />
              </div>
              <div>
                <span className="font-medium text-primary">{cruise.route}</span>
                <span className="text-muted-foreground ml-1">— {t('booking.cruise.route')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <Fish size={16} className="text-accent" />
              </div>
              <div>
                <span className="font-medium text-primary">{cruise.dives} {t('booking.cruise.dives')}</span>
                <span className="text-muted-foreground ml-1">— 9-day expedition</span>
              </div>
            </div>
          </div>

          {/* Duration bar */}
          <div className="rounded-xl bg-accent/5 border border-accent/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Departure</p>
                <p className="font-semibold text-primary">{cruise.departureDate}</p>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 rounded-full bg-accent/20 relative">
                  <div className="absolute inset-0 rounded-full bg-accent/40" />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">9 days · {cruise.dives} dive days</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Return</p>
                <p className="font-semibold text-primary">{cruise.returnDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
