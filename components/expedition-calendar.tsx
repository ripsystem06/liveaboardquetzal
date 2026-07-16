'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarDays,
  MapPin,
  Waves,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'

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

const ROUTE_IMAGES: Record<string, string> = {
  'Socorro Islands': '/images/panoramicas/Manta el Boiler 1.webp',
  'Sea of Cortez': '/images/panoramicas/Delfin Kike.webp',
  'Magdalena Bay': '/images/panoramicas/loreto-magdalena-bay.webp',
}

const DEFAULT_IMAGE = '/images/panoramicas/ROca Partida .webp'

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MONTHS_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const MONTHS_SHORT_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function getRouteImage(route: string): string {
  return ROUTE_IMAGES[route] || DEFAULT_IMAGE
}

function getDaysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

function parseDate(d: string): { day: number; month: number; year: number } {
  const [y, m, day] = d.split('-').map(Number)
  return { day, month: m, year: y }
}

function ExpeditionCard({ expedition, language, t }: {
  expedition: Expedition
  language: string
  t: (key: string) => string
}) {
  const monthsShort = language === 'es' ? MONTHS_SHORT_ES : MONTHS_SHORT_EN
  const departure = parseDate(expedition.departureDate)
  const returnDate = parseDate(expedition.returnDate)
  const days = getDaysBetween(expedition.departureDate, expedition.returnDate)
  const hasReturn = expedition.returnDate && expedition.returnDate !== expedition.departureDate

  return (
    <Link
      href="/booking"
      className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl hover:border-accent/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 md:h-auto md:w-[40%] md:min-h-[280px] shrink-0 overflow-hidden">
        <Image
          src={getRouteImage(expedition.route)}
          alt={expedition.name}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent md:bg-gradient-to-r md:from-transparent md:via-primary/30 md:to-card" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col justify-between p-6 md:p-8 flex-1">
        {/* Date Block */}
        <div className="flex items-start gap-4 mb-6">
          <div className="inline-flex rounded-xl overflow-hidden shadow-md shrink-0">
            <div className="bg-primary px-5 py-3 text-center text-white">
              <span className="block font-sans text-[10px] uppercase tracking-[0.15em] leading-tight">
                {monthsShort[departure.month - 1]}
              </span>
              <span className="block font-serif text-3xl font-bold leading-none mt-0.5">
                {departure.day}
              </span>
            </div>
            {hasReturn && (
              <div className="bg-primary/80 px-4 py-3 text-center text-white/90 flex flex-col items-center justify-center">
                <span className="block w-3 border-t border-white/30 mb-1" />
                <span className="font-sans text-sm font-medium">{returnDate.day}</span>
              </div>
            )}
          </div>

          {/* Route & Name */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-accent mb-1">
              <MapPin className="size-3.5 shrink-0" />
              <span className="font-sans text-xs font-semibold uppercase tracking-wider truncate">
                {expedition.route}
              </span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground leading-tight line-clamp-2">
              {expedition.name}
            </h3>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span className="font-sans text-sm">{days} {t('calendar.days')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Waves className="size-4 shrink-0" />
            <span className="font-sans text-sm">{expedition.dives} {t('calendar.dives')}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-5 border-t border-border">
          <div>
            <span className="font-sans text-xs text-muted-foreground">{t('calendar.from')}</span>
            <span className="font-serif text-2xl font-bold text-accent ml-1">
              {formatPrice(expedition.priceFrom)}
            </span>
          </div>
          <Button size="sm" className="rounded-full gap-1.5 group/btn">
            {t('calendar.bookNow')}
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-48 md:h-auto md:w-[40%] md:min-h-[280px] bg-muted animate-pulse shrink-0" />
      <div className="flex-1 p-6 md:p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-[72px] h-[72px] rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-5 w-full bg-muted rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="pt-5 border-t border-border flex justify-between">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function ExpeditionCalendar() {
  const { t, language } = useLanguage()
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/cruises/calendar')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((json) => {
        setExpeditions(json.expeditions || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const grouped = useMemo(() => {
    const months = language === 'es' ? MONTHS_ES : MONTHS_EN
    const map = new Map<string, Expedition[]>()
    for (const exp of expeditions) {
      const d = parseDate(exp.departureDate)
      const key = `${months[d.month - 1]} ${d.year}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(exp)
    }
    return Array.from(map.entries())
  }, [expeditions, language])

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="h-6 w-48 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="max-w-5xl mx-auto space-y-16">
            {[1, 2].map((m) => (
              <div key={m}>
                <div className="h-5 w-36 bg-muted rounded mx-auto mb-8 animate-pulse" />
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground font-sans">{t('calendar.loading')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 md:py-32 bg-background">
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
                    setExpeditions(json.expeditions || [])
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

  const hasExpeditions = expeditions.length > 0

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-primary tracking-tight">
            {t('calendar.subtitle')}
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
          <div className="max-w-5xl mx-auto space-y-20">
            {grouped.map(([monthLabel, exps]) => (
              <div key={monthLabel}>
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-border" />
                  <h3 className="font-serif text-xl md:text-2xl font-normal text-primary tracking-wide whitespace-nowrap">
                    {monthLabel}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {exps.map((exp) => (
                    <ExpeditionCard
                      key={exp.id}
                      expedition={exp}
                      language={language}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
