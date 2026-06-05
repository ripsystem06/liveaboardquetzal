'use client'

import { Minus, Plus } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'

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
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label={t('booking.guest.decrement')}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex flex-col items-center min-w-[80px]">
        <span className="text-3xl font-serif text-primary">{value}</span>
        <span className="text-sm text-muted-foreground">{t('booking.guest.label')}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label={t('booking.guest.increment')}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}