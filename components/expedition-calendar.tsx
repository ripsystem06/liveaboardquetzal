'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  DollarSign,
  Waves,
  Loader2,
  X,
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Expedition {
  id: string
  name: string
  departureDate: string
  returnDate: string
  route: string
  basicPrice: number
  dives: number
  priceFrom: number
}

interface CalendarData {
  expeditions: Expedition[]
  byDate: Record<string, Expedition[]>
}

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const MONTHS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function formatDateRange(start: string, end: string, language: string): string {
  const months = language === 'es' ? MONTHS_ES : MONTHS_EN
  const parseDate = (d: string) => {
    const [y, m, day] = d.split('-').map(Number)
    return { day, month: months[m - 1], year: y }
  }
  const s = parseDate(start)
  const e = parseDate(end)
  if (!end || start === end) {
    return `${s.month} ${s.day}, ${s.year}`
  }
  if (s.month === e.month && s.year === e.year) {
    return `${s.month} ${s.day}–${e.day}, ${s.year}`
  }
  return `${s.month} ${s.day} – ${e.month} ${e.day}, ${s.year}`
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

function PopoverCard({
  expedition,
  onClose,
  language,
  t,
}: {
  expedition: Expedition
  onClose: () => void
  language: string
  t: (key: string) => string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
      <div
        ref={ref}
        className="w-72 rounded-xl border border-border bg-card p-5 shadow-xl animate-in fade-in-0 zoom-in-95"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <h3 className="font-serif text-lg font-bold text-foreground pr-6 leading-tight">
          {expedition.name}
        </h3>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-accent" />
            <span>{expedition.route}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0 text-accent" />
            <span>{formatDateRange(expedition.departureDate, expedition.returnDate, language)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Waves className="size-3.5 shrink-0 text-accent" />
            <span>{expedition.dives} {t('calendar.dives')}</span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-semibold pt-1 border-t border-border">
            <DollarSign className="size-3.5 shrink-0 text-accent" />
            <span>{t('calendar.from')} {formatPrice(expedition.priceFrom)}</span>
          </div>
        </div>

        <a
          href="/reservar"
          className="mt-4 block w-full rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors active:scale-[0.97]"
        >
          {t('calendar.bookNow')}
        </a>
      </div>
    </div>
  )
}

export function ExpeditionCalendar() {
  const { t, language } = useLanguage()
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [mobileIndex, setMobileIndex] = useState(0)

  const months = useMemo(() => {
    const now = new Date()
    const result: Date[] = []
    for (let i = 0; i < 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      result.push(d)
    }
    return result
  }, [])

  useEffect(() => {
    fetch('/api/cruises/calendar')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const expeditionDates = useMemo(() => {
    if (!data) return []
    return data.expeditions.map((e) => new Date(e.departureDate + 'T00:00:00'))
  }, [data])

  const dateToExpeditions = useMemo(() => {
    if (!data) return new Map<string, Expedition[]>()
    const map = new Map<string, Expedition[]>()
    for (const exp of data.expeditions) {
      const key = exp.departureDate
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(exp)
    }
    return map
  }, [data])

  const visibleMonths = months
  const defaultClassNames = getDefaultClassNames()

  const handleDayClick = (day: Date) => {
    const key = day.toISOString().split('T')[0]
    const exps = dateToExpeditions.get(key)
    if (exps && exps.length > 0) {
      setSelectedExpedition(exps[0])
    } else {
      setSelectedExpedition(null)
    }
  }

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-4 w-32 bg-accent/20 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-64 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground font-sans">{t('calendar.loading')}</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-destructive font-sans text-lg mb-4">{t('calendar.error')}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null)
                setLoading(true)
                fetch('/api/cruises/calendar')
                  .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch')
                    return res.json()
                  })
                  .then((json) => {
                    setData(json)
                    setLoading(false)
                  })
                  .catch((err) => {
                    setError(err.message)
                    setLoading(false)
                  })
              }}
            >
              {t('calendar.retry')}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const hasExpeditions = data && data.expeditions.length > 0

  return (
    <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-sans text-xs md:text-sm text-accent uppercase tracking-[0.2em] mb-3">
            {t('calendar.subtitle')}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight">
            {t('calendar.title')}
          </h2>
        </div>

        {!hasExpeditions ? (
          <div className="max-w-lg mx-auto text-center py-16">
            <CalendarDays className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-sans text-muted-foreground leading-relaxed">
              {t('calendar.noDates')}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: 2-3 months side by side */}
            <div className="hidden md:flex md:justify-center md:gap-4 lg:gap-6">
              {visibleMonths.slice(0, 3).map((m) => (
                <div key={m.toISOString()} className="relative rounded-xl bg-background p-4 shadow-sm border border-border">
                  <DayPicker
                    month={m}
                    mode="single"
                    selected={undefined}
                    onDayClick={handleDayClick}
                    showOutsideDays={false}
                    modifiers={{ expedition: expeditionDates }}
                    modifiersClassNames={{
                      expedition: 'bg-accent/20 text-accent-foreground font-semibold rounded-md',
                    }}
                    classNames={{
                      root: cn('w-fit', defaultClassNames.root),
                      months: cn('flex flex-col', defaultClassNames.months),
                      month: cn('flex flex-col gap-2 w-full', defaultClassNames.month),
                      month_caption: cn(
                        'flex items-center justify-center h-10 font-serif text-foreground font-semibold text-base',
                        defaultClassNames.month_caption,
                      ),
                      nav: cn('hidden', defaultClassNames.nav),
                      table: 'w-full border-collapse',
                      weekdays: cn('flex', defaultClassNames.weekdays),
                      weekday: cn(
                        'text-muted-foreground rounded-md flex-1 font-sans font-normal text-[0.75rem] select-none text-center uppercase tracking-wider',
                        defaultClassNames.weekday,
                      ),
                      week: cn('flex w-full mt-1', defaultClassNames.week),
                      day: cn(
                        'relative w-full p-0 text-center group/day aspect-square select-none',
                        defaultClassNames.day,
                      ),
                      today: cn(
                        'ring-2 ring-accent/50 rounded-md',
                        defaultClassNames.today,
                      ),
                      outside: cn(
                        'text-muted-foreground opacity-0',
                        defaultClassNames.outside,
                      ),
                      disabled: cn(
                        'text-muted-foreground opacity-50',
                        defaultClassNames.disabled,
                      ),
                      hidden: cn('invisible', defaultClassNames.hidden),
                    }}
                    components={{
                      DayButton: ({ day, modifiers, ...props }) => {
                        const key = day.date.toISOString().split('T')[0]
                        const exps = dateToExpeditions.get(key)
                        const hasExp = !!(exps && exps.length > 0)
                        return (
                          <div className="relative size-full">
                            <button
                              {...props}
                              onClick={(e) => {
                                handleDayClick(day.date)
                                if (props.onClick) props.onClick(e)
                              }}
                              className={cn(
                                'flex size-full items-center justify-center rounded-md font-sans text-sm transition-colors',
                                modifiers.today && 'ring-2 ring-accent/50',
                                hasExp && 'bg-accent/20 text-accent-foreground font-semibold',
                                !hasExp && !modifiers.today && 'hover:bg-muted',
                                modifiers.outside && 'invisible',
                                props.className,
                              )}
                            >
                              {day.date.getDate()}
                              {hasExp && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-accent" />
                              )}
                              {exps && exps.length > 0 && day.date.toISOString().split('T')[0] === key && (
                                <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
                                  {selectedExpedition &&
                                   selectedExpedition.departureDate === key ? (
                                    <PopoverCard
                                      expedition={selectedExpedition}
                                      onClose={() => setSelectedExpedition(null)}
                                      language={language}
                                      t={t}
                                    />
                                  ) : null}
                                </div>
                              )}
                            </button>
                          </div>
                        )
                      },
                      Chevron: () => <></>,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Mobile: 1 month at a time with horizontal nav */}
            <div className="md:hidden">
              <div className="relative rounded-xl bg-background p-4 shadow-sm border border-border max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setMobileIndex(Math.max(0, mobileIndex - 1))}
                    disabled={mobileIndex === 0}
                    className="size-8 flex items-center justify-center rounded-full border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors disabled:opacity-30"
                    aria-label={language === 'es' ? 'Mes anterior' : 'Previous month'}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="font-serif text-foreground font-semibold text-base">
                    {months[mobileIndex].toLocaleDateString(
                      language === 'es' ? 'es-MX' : 'en-US',
                      { month: 'long', year: 'numeric' }
                    )}
                  </span>
                  <button
                    onClick={() => setMobileIndex(Math.min(months.length - 1, mobileIndex + 1))}
                    disabled={mobileIndex >= months.length - 1}
                    className="size-8 flex items-center justify-center rounded-full border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors disabled:opacity-30"
                    aria-label={language === 'es' ? 'Mes siguiente' : 'Next month'}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <DayPicker
                  month={months[mobileIndex]}
                  mode="single"
                  selected={undefined}
                  onDayClick={handleDayClick}
                  showOutsideDays={false}
                  modifiers={{ expedition: expeditionDates }}
                  modifiersClassNames={{
                    expedition: 'bg-accent/20 text-accent-foreground font-semibold rounded-md',
                  }}
                  classNames={{
                    root: cn('w-fit mx-auto', defaultClassNames.root),
                    months: cn('flex flex-col', defaultClassNames.months),
                    month: cn('flex flex-col gap-2 w-full', defaultClassNames.month),
                    month_caption: cn('hidden'),
                    nav: cn('hidden'),
                    table: 'w-full border-collapse',
                    weekdays: cn('flex', defaultClassNames.weekdays),
                    weekday: cn(
                      'text-muted-foreground rounded-md flex-1 font-sans font-normal text-[0.75rem] select-none text-center uppercase tracking-wider',
                      defaultClassNames.weekday,
                    ),
                    week: cn('flex w-full mt-1', defaultClassNames.week),
                    day: cn(
                      'relative size-full p-0 text-center group/day aspect-square select-none',
                      defaultClassNames.day,
                    ),
                    today: cn(
                      'ring-2 ring-accent/50 rounded-md',
                      defaultClassNames.today,
                    ),
                    outside: cn(
                      'text-muted-foreground opacity-0',
                      defaultClassNames.outside,
                    ),
                    disabled: cn(
                      'text-muted-foreground opacity-50',
                      defaultClassNames.disabled,
                    ),
                    hidden: cn('invisible', defaultClassNames.hidden),
                  }}
                  components={{
                    DayButton: ({ day, modifiers, ...props }) => {
                      const key = day.date.toISOString().split('T')[0]
                      const exps = dateToExpeditions.get(key)
                      const hasExp = !!(exps && exps.length > 0)
                      return (
                        <div className="relative size-full">
                          <button
                            {...props}
                            onClick={(e) => {
                              handleDayClick(day.date)
                              if (props.onClick) props.onClick(e)
                            }}
                            className={cn(
                              'flex size-full items-center justify-center rounded-md font-sans text-sm transition-colors',
                              modifiers.today && 'ring-2 ring-accent/50',
                              hasExp && 'bg-accent/20 text-accent-foreground font-semibold',
                              !hasExp && !modifiers.today && 'hover:bg-muted',
                              modifiers.outside && 'invisible',
                              props.className,
                            )}
                          >
                            {day.date.getDate()}
                            {hasExp && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-accent" />
                            )}
                          </button>
                        </div>
                      )
                    },
                    Chevron: () => <></>,
                  }}
                />

                {selectedExpedition && (
                  <PopoverCard
                    expedition={selectedExpedition}
                    onClose={() => setSelectedExpedition(null)}
                    language={language}
                    t={t}
                  />
                )}
              </div>

              {/* Mobile month dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {months.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMobileIndex(i)}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === mobileIndex
                        ? 'w-6 h-2 bg-accent'
                        : 'w-2 h-2 bg-border hover:bg-accent/40'
                    )}
                    aria-label={`Month ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <span className="size-2.5 rounded-full bg-accent/40 inline-block" />
              <span className="font-sans text-sm text-muted-foreground">
                {t('calendar.available')}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
