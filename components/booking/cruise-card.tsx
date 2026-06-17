'use client'

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Anchor, ShipWheel, ChevronRight } from 'lucide-react'
import type { Cruise } from './booking-page-client'
import { useRouter } from 'next/navigation'

interface CruiseCardProps {
  cruise: Cruise
  onSelect: (cruise: Cruise) => void
  isSelected?: boolean
  isLoginRequired?: boolean
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return {
    day: parseInt(day, 10),
    monthIndex: parseInt(month, 10) - 1,
    year,
    dayStr: day,
  }
}

export function CruiseCard({ cruise, onSelect, isSelected = false, isLoginRequired = false }: CruiseCardProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { day, monthIndex, year, dayStr } = parseDate(cruise.departureDate)
  const months = language === 'es' ? MONTHS_ES : MONTHS_EN
  const monthName = months[monthIndex]

  const handleButtonClick = () => {
    if (isLoginRequired) {
      router.push('/booking?step=1')
    } else {
      onSelect(cruise)
    }
  }

  return (
    <div
      className={cn(
        'w-full rounded-2xl border bg-card px-6 py-5 shadow-sm transition-all',
        isSelected
          ? 'border-accent ring-1 ring-accent/30'
          : 'border-border hover:border-secondary/30'
      )}
    >
      {/* Month / Year Header */}
      <div className="mb-4 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        {monthName} {year}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Date + Cruise Info */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Big Departure Date */}
          <div className="flex items-start gap-1.5">
            <span className="text-5xl font-bold leading-none text-primary">
              {dayStr}
            </span>
            <div className="mt-1.5 flex flex-col leading-none">
              <span className="text-sm font-bold uppercase text-primary">
                {monthName}
              </span>
              <span className="text-xs text-muted-foreground">{year}</span>
            </div>
          </div>

          {/* Cruise Details */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-serif font-bold text-primary sm:text-2xl">
              {cruise.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {cruise.boat && (
                <div className="flex items-center gap-1.5">
                  <ShipWheel size={16} className="text-secondary" />
                  <span className="text-sm font-medium">{cruise.boat}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Anchor size={16} className="text-secondary" />
                <span className="text-sm font-medium">{cruise.route}</span>
              </div>
            </div>

            <button className="mt-0.5 flex w-fit items-center gap-1 text-sm font-semibold text-secondary transition hover:text-secondary/80">
              {t('booking.cruise.tripDetails')}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Right: Price + Select */}
        <div className="flex flex-col items-end gap-3">
          {/* Price */}
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('booking.cruise.pricePerPerson')}
            </div>

            <div className="flex items-start gap-1">
              <span className="mt-1 text-sm font-semibold text-primary">USD</span>
              <span className="text-5xl font-bold tracking-tight text-primary">
                {cruise.pricePerPerson.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Select Button */}
          <Button
            onClick={handleButtonClick}
            className={cn(
              'rounded-full px-6 py-3 text-sm font-semibold transition',
              isSelected
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
            )}
          >
            {isLoginRequired ? t('booking.cruise.signIn') : (isSelected ? t('booking.cruise.selected') : t('booking.cruise.select'))}
          </Button>
        </div>
      </div>
    </div>
  )
}
