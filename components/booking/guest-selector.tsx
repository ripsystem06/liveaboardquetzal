'use client'

import { Minus, Plus, Users } from 'lucide-react'
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
    <div
      className="rounded-2xl bg-card px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between">
        {/* Left: label + capacity */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent/10">
              <Users size={14} className="text-accent" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {t('booking.guest.title')}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {t('booking.guest.capacity')}
          </span>
        </div>

        {/* Right: counter */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleDecrement}
            disabled={!canDecrement}
            aria-label={t('booking.guest.decrement')}
            className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent transition-all hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          >
            <Minus size={16} />
          </button>

          <span className="text-5xl font-bold leading-none text-primary tabular-nums min-w-[2ch] text-center">
            {value}
          </span>

          <button
            onClick={handleIncrement}
            disabled={!canIncrement}
            aria-label={t('booking.guest.increment')}
            className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent transition-all hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}