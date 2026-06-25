'use client'

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Anchor, ShipWheel, ChevronRight, Fish, CalendarArrowDown } from 'lucide-react'
import type { Cruise } from './booking-page-client'
import { useRouter } from 'next/navigation'

interface CruiseCardProps {
  cruise: Cruise
  onSelect: (cruise: Cruise) => void
  onSelectTier?: (tier: 'basic' | 'standard' | 'premium') => void
  isSelected?: boolean
  isLoginRequired?: boolean
  selectedTier?: 'basic' | 'standard' | 'premium' | null
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

function getEmbarkationDate(departureDate: string, language: string): string {
  const months = language === 'es' ? MONTHS_ES : MONTHS_EN
  const [year, month, day] = departureDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 1)
  return `${months[date.getMonth()]} ${date.getDate()}`
}

export function CruiseCard({ cruise, onSelect, onSelectTier, isSelected = false, isLoginRequired = false, selectedTier = null }: CruiseCardProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { day, monthIndex, year, dayStr } = parseDate(cruise.departureDate)
  const months = language === 'es' ? MONTHS_ES : MONTHS_EN
  const monthName = months[monthIndex]
  const embarkDate = getEmbarkationDate(cruise.departureDate, language)

  const handleButtonClick = () => {
    if (isLoginRequired) {
      router.push('/booking?step=1')
    } else {
      onSelect(cruise)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price)
  }

  const tiers: Array<{ key: 'basic' | 'standard' | 'premium'; label: string }> = [
    { key: 'basic', label: t('booking.tier.basic') },
    { key: 'standard', label: t('booking.tier.standard') },
    { key: 'premium', label: t('booking.tier.premium') },
  ]

  const handleTierSelect = (tier: 'basic' | 'standard' | 'premium') => {
    if (onSelectTier) {
      onSelectTier(tier)
    }
  }

  return (
    <div
      className={cn(
        'group w-full rounded-2xl bg-card px-6 py-5 transition-all duration-300',
        'shadow-[0_4px_16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
        isSelected
          ? 'ring-2 ring-accent/40 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
          : ''
      )}
    >
      {/* Month / Year Header */}
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {monthName} {year}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Date + Cruise Info */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Big Departure Date */}
          <div className="flex flex-col items-start">
            <div className="flex items-start gap-1.5">
              <span className="text-5xl font-bold leading-none text-primary tabular-nums">
                {dayStr}
              </span>
              <div className="mt-1.5 flex flex-col leading-none">
                <span className="text-sm font-bold uppercase text-primary">
                  {monthName}
                </span>
                <span className="text-xs text-muted-foreground">{year}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-1.5 ml-0.5">
              {t('booking.cruise.embarkation')}: {embarkDate}
            </span>
          </div>

          {/* Cruise Details */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-serif font-bold text-primary sm:text-2xl text-balance">
              {cruise.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {cruise.boat && (
                <div className="flex items-center gap-1.5">
                  <div className="flex size-6 items-center justify-center rounded-full bg-accent/10">
                    <ShipWheel size={14} className="text-accent" />
                  </div>
                  <span className="text-sm font-medium">{cruise.boat}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <div className="flex size-6 items-center justify-center rounded-full bg-accent/10">
                  <Anchor size={14} className="text-accent" />
                </div>
                <span className="text-sm font-medium">{cruise.route}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex size-6 items-center justify-center rounded-full bg-accent/10">
                  <CalendarArrowDown size={14} className="text-accent" />
                </div>
                <span className="text-sm font-medium">
                  {cruise.departureDate} → {cruise.returnDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex size-6 items-center justify-center rounded-full bg-accent/10">
                  <Fish size={14} className="text-accent" />
                </div>
                <span className="text-sm font-medium">{cruise.dives} {t('booking.cruise.dives')}</span>
              </div>
            </div>

            <button className="mt-0.5 flex w-fit items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent/80">
              {t('booking.cruise.tripDetails')}
              <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Right: Price + Select */}
        <div className="flex flex-col items-end gap-3">
          {/* Tier Selection */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              {t('booking.cruise.pricePerPerson')}
            </div>
            <div className="flex flex-wrap gap-2">
              {tiers.map(({ key, label }) => {
                const isActive = selectedTier === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTierSelect(key)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold border-2 transition-all',
                      'border-border bg-card text-muted-foreground',
                      'hover:border-accent/40 hover:shadow-sm',
                      isActive && 'border-accent bg-accent/10 text-accent ring-2 ring-accent/30'
                    )}
                  >
                    <span>{label}</span>
                    <span className="ml-1.5">{formatPrice(cruise.tiers[key])}</span>
                  </button>
                )
              })}
            </div>
            {!selectedTier && (
              <p className="text-xs text-muted-foreground mt-1">{t('booking.tier.selectHint')}</p>
            )}
          </div>

          {/* Select Button */}
          <Button
            onClick={handleButtonClick}
            className={cn(
              'rounded-full px-6 py-3 text-sm font-semibold transition-all active:scale-[0.96]',
              isSelected
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : isLoginRequired
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
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
