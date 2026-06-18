'use client'

import { Minus, Plus } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface GuestSelectorProps {
  value: number
  onChange: (count: number) => void
}

export function GuestSelector({ value, onChange }: GuestSelectorProps) {
  const { t } = useLanguage()

  const canDecrement = value > 1
  const canIncrement = value < 18

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1)
    }
  }

  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label={t('booking.guest.decrement')}
        className="flex size-10 items-center justify-center rounded-full border-2 border-border text-muted-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
      >
        <Minus className="size-4" />
      </button>

      <div className="flex flex-col items-center min-w-[80px]">
        <span className="text-4xl font-serif font-bold text-primary tabular-nums">{value}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-1">{t('booking.guest.label')}</span>
      </div>

      <button
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label={t('booking.guest.increment')}
        className="flex size-10 items-center justify-center rounded-full border-2 border-border text-muted-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}