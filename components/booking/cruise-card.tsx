'use client'

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Cruise } from './booking-page-client'

interface CruiseCardProps {
  cruise: Cruise
  onSelect: (cruise: Cruise) => void
  isSelected?: boolean
}

export function CruiseCard({ cruise, onSelect, isSelected = false }: CruiseCardProps) {
  const { t } = useLanguage()

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
      )}
    >
      <h3 className="text-xl font-serif text-primary mb-2">{cruise.name}</h3>

      <div className="space-y-1 text-sm text-muted-foreground mb-4">
        <p>
          <span className="font-medium text-primary">{t('booking.cruise.departure')}:</span> {cruise.departureDate}
        </p>
        <p>
          <span className="font-medium text-primary">{t('booking.cruise.route')}:</span> {cruise.route}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-primary">
          ${cruise.pricePerPerson.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground"> {t('booking.cruise.pricePerPerson')}</span>
        </p>

        <Button
          onClick={() => onSelect(cruise)}
          variant={isSelected ? 'secondary' : 'default'}
          size="sm"
        >
          {isSelected ? t('booking.cruise.selected') : t('booking.cruise.select')}
        </Button>
      </div>
    </div>
  )
}