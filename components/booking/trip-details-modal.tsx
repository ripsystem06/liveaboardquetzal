'use client'

import { ShipWheel, Anchor, CalendarArrowDown, Fish, Clock, Sunrise, Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-primary">{cruise.name}</DialogTitle>
          <DialogDescription>{t('booking.cruise.tripDetails')}</DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-6 pt-2">
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

          {/* Your Day at Sea — daily rhythm */}
          <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
            <h4 className="font-serif text-sm font-semibold text-primary mb-3">
              {t('dest.daySchedule.title') !== 'dest.daySchedule.title' ? t('dest.daySchedule.title') : 'Your Day at Sea'}
            </h4>
            <div className="space-y-2.5">
              {[
                { icon: Sunrise, bg: 'bg-amber-500/10', fg: 'text-amber-500', labelKey: 'dest.morning', descKey: 'dest.daySchedule.morning', fallback: 'Morning', descFallback: 'Continental breakfast, dive briefing, first dive, full breakfast' },
                { icon: Sun, bg: 'bg-sky-500/10', fg: 'text-sky-500', labelKey: 'dest.afternoon', descKey: 'dest.daySchedule.afternoon', fallback: 'Afternoon', descFallback: 'Second dive, lunch, third dive, surface interval' },
                { icon: Moon, bg: 'bg-indigo-500/10', fg: 'text-indigo-500', labelKey: 'dest.evening', descKey: 'dest.daySchedule.evening', fallback: 'Evening', descFallback: 'Fourth dive (optional), dinner, stars on deck' },
              ].map(({ icon: Icon, bg, fg, labelKey, descKey, fallback, descFallback }) => (
                <div key={labelKey} className="flex items-start gap-2.5">
                  <div className={`flex size-6 items-center justify-center rounded-full shrink-0 mt-0.5 ${bg}`}>
                    <Icon size={12} className={fg} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      {t(labelKey) !== labelKey ? t(labelKey) : fallback}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(descKey) !== descKey ? t(descKey) : descFallback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              {t('dest.wetsuitHint') !== 'dest.wetsuitHint' ? t('dest.wetsuitHint') : 'Schedules are flexible and weather-dependent.'}
            </p>
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
        <div className="-mx-6 -mb-6 px-6 py-4 border-t border-border bg-muted/20 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            {t('admin.common.close') || 'Close'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
