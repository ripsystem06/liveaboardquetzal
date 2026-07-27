'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUp, Compass, Fish, MapPin, Moon, Shell, Sparkles, Star, Sun, Sunrise, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

// ── Types ──────────────────────────────────────────────────────────────────
type DestinationPrefix = 'socorro' | 'cortez' | 'magbay'

interface DestinationPageProps { prefix: DestinationPrefix }

// ── Hero image mapping ─────────────────────────────────────────────────────
const heroImageMap: Record<DestinationPrefix, string> = {
  socorro: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&q=80',
  cortez: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  magbay: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=1200&q=80',
}

// ── Description section images ──────────────────────────────────────────────
const descImageMap: Record<DestinationPrefix, string> = {
  socorro: '/images/panoramicas/Manta el Boiler 1.webp',
  cortez: '/images/panoramicas/burritos galapagos 1.webp',
  magbay: '/images/panoramicas/loreto-magdalena-bay.webp',
}

// ── Zone definitions ────────────────────────────────────────────────────────
interface ZoneInfo { zoneKey: string; siteKeys: string[] }

const ZONES: Record<DestinationPrefix, ZoneInfo[]> = {
  socorro: [
    { zoneKey: 'sanBenedicto', siteKeys: ['boiler', 'canyon'] },
    { zoneKey: 'rocaPartida', siteKeys: ['rocaPartida'] },
    { zoneKey: 'socorroIsland', siteKeys: ['caboPearce'] },
  ],
  cortez: [
    { zoneKey: 'laPazBay', siteKeys: ['losIslotes', 'laPazBay', 'swanneeReef', 'salvatierra', 'elCorralito'] },
    { zoneKey: 'northernIslands', siteKeys: ['elBajo', 'whaleIsland', 'sanFrancisquito'] },
    { zoneKey: 'eastCape', siteKeys: ['lasAnimas', 'caboPulmo'] },
  ],
  magbay: [],
}

const ZONE_DISPLAY: Partial<Record<DestinationPrefix, Record<string, string>>> = {
  socorro: { sanBenedicto: 'San Benedicto', rocaPartida: 'Roca Partida', socorroIsland: 'Socorro Island' },
  cortez: { laPazBay: 'La Paz Bay', northernIslands: 'Northern Islands', eastCape: 'East Cape' },
}

// ── Dive site specs (depth, current, visibility) ────────────────────────────
interface DiveSpec { depth: string; current: string; visibility: string }
const DIVE_SPECS: Partial<Record<DestinationPrefix, Record<string, Record<string, DiveSpec>>>> = {
  socorro: {
    sanBenedicto: {
      boiler:  { depth: '25m',  current: 'Moderate',    visibility: '30m+' },
      canyon:  { depth: '30m',  current: 'Mod–Strong',  visibility: '25m+' },
    },
    rocaPartida: {
      rocaPartida: { depth: '40m+', current: 'Strong',  visibility: 'Variable' },
    },
    socorroIsland: {
      caboPearce:  { depth: '20–30m', current: 'Moderate', visibility: '25m+' },
    },
  },
  cortez: {
    laPazBay: {
      elBajo:     { depth: '30m',  current: 'Moderate',  visibility: '20m+' },
      swanee:     { depth: '18m',  current: 'Mild',      visibility: '15m+' },
      salvatierra:{ depth: '80m',  current: 'Moderate',  visibility: '15m+' },
    },
  },
}

// ── Constants ───────────────────────────────────────────────────────────────
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const
const HIGHLIGHT_KEYS = ['h1','h2','h3','h4','h5','h6'] as const
const HIGHLIGHT_ICONS = [Fish, Waves, Star, Compass, Shell, Sparkles]

// ── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el) } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, isVisible }
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useInView(0.05)
  return (
    <div ref={ref} className="transition-all duration-1000 ease-out"
      style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(40px)', transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ── Shared: Natural-flow section wrapper ─────────────────────────────────────
function PageSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`w-full py-16 md:py-24 relative ${className}`}>
      {children}
    </section>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────────
function HeroSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  return (
    <section className="min-h-screen md:h-screen w-full flex items-center justify-center relative">
      <Image src={heroImageMap[prefix]} alt={t(`${prefix}.title`)} fill className="object-cover" priority unoptimized sizes="100vw" />
      {/* Elegant layered overlay — soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 from-0% via-transparent via-35% via-transparent via-65% to-primary/60 to-100%" />
      {/* Subtle radial vignette at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.15)_100%)]" />
      {/* Bottom fade — smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-t from-background to-transparent" />
      <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
        <FadeIn delay={200}>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-normal text-white leading-[0.9] tracking-tight max-w-5xl mx-auto">
            {t(`${prefix}.title`)}
          </h1>
          <p className="font-sans text-lg md:text-3xl text-white/70 mt-8 max-w-2xl mx-auto italic font-light">
            {t(`${prefix}.subtitle`)}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

// ── Description ─────────────────────────────────────────────────────────────
function DescriptionSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const desc1 = t(`${prefix}.description1`)
  if (desc1 === `${prefix}.description1`) return null
  const desc2 = t(`${prefix}.description2`)
  return (
    <PageSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text — left */}
          <div>
            <FadeIn>
              <p className="font-serif text-base md:text-lg lg:text-xl text-foreground/80 leading-relaxed">{desc1}</p>
              {desc2 !== `${prefix}.description2` && (
                <p className="font-serif text-base md:text-lg lg:text-xl text-foreground/80 leading-relaxed mt-6">{desc2}</p>
              )}
            </FadeIn>
          </div>
          {/* Image — right */}
          <FadeIn delay={150}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={descImageMap[prefix]}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </PageSection>
  )
}

// ── Highlights ──────────────────────────────────────────────────────────────
function HighlightsSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const heading = t(`${prefix}.highlights`)
  if (heading === `${prefix}.highlights`) return null
  const keys = HIGHLIGHT_KEYS.filter(k => t(`${prefix}.${k}`) !== `${prefix}.${k}`)
  if (keys.length === 0) return null
  return (
    <PageSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-12">{heading}</h2>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mx-auto">
          {keys.map((hKey, i) => {
            const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
            return (
              <FadeIn key={hKey} delay={i * 100}>
                <div className="group relative bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-5 md:p-6 transition-all duration-500 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1">
                  <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-normal text-foreground mb-2">{t(`${prefix}.${hKey}`)}</h3>
                  <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">{t(`${prefix}.${hKey}d`)}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </PageSection>
  )
}

// ── Dive Sites ──────────────────────────────────────────────────────────────
function DiveSitesSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const title = t(`${prefix}.diveSites.title`)
  if (title === `${prefix}.diveSites.title`) return null
  const zones = ZONES[prefix]
  const zoneNames = ZONE_DISPLAY[prefix] ?? {}

  const zoneColors: Record<string, { accent: string; border: string; bg: string; badge: string; badgeBorder: string }> = {
    sanBenedicto: { accent: 'text-emerald-300', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', badge: 'bg-emerald-600', badgeBorder: 'border-emerald-500' },
    rocaPartida:  { accent: 'text-cyan-300',    border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    badge: 'bg-cyan-600',    badgeBorder: 'border-cyan-500' },
    socorroIsland:{ accent: 'text-violet-300',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  badge: 'bg-violet-600',  badgeBorder: 'border-violet-500' },
    // Cortez zones
    laPaz:        { accent: 'text-amber-300',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   badge: 'bg-amber-600',   badgeBorder: 'border-amber-500' },
    caboPulmo:    { accent: 'text-orange-300',  border: 'border-orange-500/30',  bg: 'bg-orange-500/10',  badge: 'bg-orange-600',  badgeBorder: 'border-orange-500' },
    loreto:       { accent: 'text-rose-300',    border: 'border-rose-500/30',    bg: 'bg-rose-500/10',    badge: 'bg-rose-600',    badgeBorder: 'border-rose-500' },
  }

  const defaultColor = { accent: 'text-blue-300', border: 'border-blue-500/30', bg: 'bg-blue-500/10', badge: 'bg-blue-600', badgeBorder: 'border-blue-500' }

  return (
    <PageSection className="min-h-[60vh] md:min-h-[70vh]">
      {/* Background image */}
      <Image src={heroImageMap[prefix]} alt="" fill className="object-cover" unoptimized sizes="100vw" />
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[0.95] text-center mb-6 drop-shadow-lg">{title}</h2>
        </FadeIn>

        {/* Zone groups */}
        <div className="space-y-16 md:space-y-24 max-w-5xl mx-auto">
          {zones.map((zone, zi) => {
            const areaIntroKey = `${prefix}.areas.${zone.zoneKey}`
            const areaIntro = t(areaIntroKey)
            const hasAreaIntro = areaIntro !== areaIntroKey

            const sites = zone.siteKeys.map(siteKey => {
              const name = t(`${prefix}.diveSites.${zone.zoneKey}.${siteKey}.name`)
              if (name === `${prefix}.diveSites.${zone.zoneKey}.${siteKey}.name`) return null
              const faunaText = t(`${prefix}.diveSites.${zone.zoneKey}.${siteKey}.fauna`)
              const faunaItems = faunaText !== `${prefix}.diveSites.${zone.zoneKey}.${siteKey}.fauna` ? faunaText.split(', ').slice(0, 2) : []
              const desc = t(`${prefix}.diveSites.${zone.zoneKey}.${siteKey}.description`)
              return { siteKey, name, desc, faunaItems }
            }).filter((s): s is NonNullable<typeof s> => s !== null)

            if (sites.length === 0) return null

            const c = zoneColors[zone.zoneKey] ?? defaultColor
            const zoneNumber = String(zi + 1).padStart(2, '0')
            const isRight = zi % 2 === 1

            return (
              <div key={zone.zoneKey}>
                <FadeIn delay={zi * 150}>
                  <div className={`relative ${isRight ? 'ml-auto' : 'mr-auto'}`} style={{ maxWidth: hasAreaIntro ? '100%' : '42rem' }}>
                    {/* Zone number — large graphic element */}
                    <span className={`absolute -top-6 -left-2 font-serif text-7xl md:text-8xl font-bold ${c.accent} opacity-20 select-none pointer-events-none`}>
                      {zoneNumber}
                    </span>

                    {/* Zone intro with icon */}
                    {hasAreaIntro && (
                      <div className={`relative flex items-start gap-3 mb-8 p-4 md:p-5 rounded-xl ${c.bg} border ${c.border}`}>
                        <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${c.bg} border ${c.border}`}>
                          <MapPin className={`w-4 h-4 ${c.accent}`} />
                        </div>
                        <div>
                          <h3 className={`font-serif text-lg md:text-xl font-normal ${c.accent} mb-1`}>
                            {zoneNames[zone.zoneKey] ?? zone.zoneKey}
                          </h3>
                          <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed">{areaIntro}</p>
                        </div>
                      </div>
                    )}

                    {/* Site cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sites.map(({ siteKey, name, desc, faunaItems }, i) => {
                        const specs = DIVE_SPECS[prefix]?.[zone.zoneKey]?.[siteKey]
                        return (
                        <FadeIn key={`${zone.zoneKey}-${siteKey}`} delay={i * 60}>
                          <div className={`group/card relative bg-white/5 backdrop-blur-xl rounded-xl border ${c.border} p-4 transition-all duration-500 hover:shadow-lg hover:bg-white/10 hover:-translate-y-1`}>
                            {/* Zone badge */}
                            {!hasAreaIntro && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider ${c.badge} text-white border ${c.badgeBorder} mb-1.5`}>
                                {zoneNames[zone.zoneKey] ?? zone.zoneKey}
                              </span>
                            )}
                            <h4 className="font-serif text-base font-normal text-white mb-1">{name}</h4>
                            <p className="font-sans text-xs text-white/70 leading-relaxed mb-1.5 line-clamp-2">{desc}</p>

                            {/* Dive specs strip */}
                            {specs && (
                              <div className="flex gap-3 mb-1.5 pb-1.5 border-b border-white/10">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-label-caps font-bold uppercase tracking-wider text-white/40">Depth</span>
                                  <span className="text-[10px] font-sans text-white/80">{specs.depth}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-label-caps font-bold uppercase tracking-wider text-white/40">Current</span>
                                  <span className="text-[10px] font-sans text-white/80">{specs.current}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-label-caps font-bold uppercase tracking-wider text-white/40">Viz</span>
                                  <span className="text-[10px] font-sans text-white/80">{specs.visibility}</span>
                                </div>
                              </div>
                            )}

                            {faunaItems.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {faunaItems.map(item => (
                                  <span key={item} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-sans font-medium ${c.bg} ${c.accent} border ${c.border}`}>{item.trim()}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </FadeIn>
                      )})}
                    </div>
                  </div>
                </FadeIn>
              </div>
            )
          })}
        </div>
      </div>
    </PageSection>
  )
}

// ── Fauna Calendar ──────────────────────────────────────────────────────────
function CalendarSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t, language } = useLanguage()
  const existing = MONTHS.filter(m => t(`${prefix}.calendar.${m}`) !== `${prefix}.calendar.${m}`)
  if (existing.length === 0) return null

  const monthNames = MONTHS.map(m => {
    const date = new Date(2024, MONTHS.indexOf(m), 1)
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { month: 'short' })
  })

  // Build species → months map by parsing all calendar keys
  const speciesMonths = new Map<string, string[]>()
  existing.forEach(m => {
    const raw = t(`${prefix}.calendar.${m}`)
    raw.split(',').forEach(s => {
      const name = s.replace(/\(peak\)/i, '').trim()
      if (!name) return
      if (!speciesMonths.has(name)) speciesMonths.set(name, [])
      speciesMonths.get(name)!.push(m)
    })
  })

  // Build ordered list of month keys for this destination
  const monthOrder = existing

  // Sort species by number of active months (most present first)
  const species = Array.from(speciesMonths.entries())
    .sort((a, b) => b[1].length - a[1].length)

  // Icons/emojis for common species
  const speciesIcons: Record<string, string> = {
    'humpback whales': '🐋',
    'giant mantas': '🦈',
    'hammerhead sharks': '🔨',
    'bottlenose dolphins': '🐬',
    'dolphins': '🐬',
    'whale sharks': '🦈',
    'false orcas': '🐋',
    'giant bait balls': '🐟',
    'silky sharks': '🦈',
    'galapagos sharks': '🦈',
    'tiger sharks': '🐅',
    'mobula rays': '🦅',
    'sea lions': '🦭',
    'gray whales': '🐋',
    'blue whales': '🐋',
    'sperm whales': '🐋',
    'orca': '🐋',
    'marlin': '🐟',
    'tuna': '🐟',
    'wahoo': '🐟',
    'dorado': '🐟',
    'sardine run': '🐟',
  }

  const getIcon = (name: string): string => {
    const lower = name.toLowerCase()
    for (const [key, icon] of Object.entries(speciesIcons)) {
      if (lower.includes(key)) return icon
    }
    return '●'
  }

  const getSeasonLabel = (months: string[]): string => {
    if (months.length === monthOrder.length) return language === 'es' ? 'Todo el año' : 'Year round'
    const indices = months.map(m => monthOrder.indexOf(m)).sort((a, b) => a - b)
    const first = monthNames[MONTHS.indexOf(months[indices[0]])]
    const last = monthNames[MONTHS.indexOf(months[indices[indices.length - 1]])]
    return `${first}–${last}`
  }

  return (
    <PageSection className="bg-muted/20">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-4">
            {t('dest.calendar')}
          </h2>
          <p className="font-sans text-sm md:text-base text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {language === 'es' ? 'Probabilidad de avistamiento por temporada' : 'Seasonal sighting probability'}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
          {species.map(([name, months], i) => {
            const isYearRound = months.length === monthOrder.length
            const icon = getIcon(name)

            return (
              <FadeIn key={name} delay={i * 60}>
                <div className="group relative bg-card/60 backdrop-blur-sm rounded-2xl border border-border/20 p-5 transition-all duration-500 hover:shadow-lg hover:border-accent/20 hover:-translate-y-1">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xl">{icon}</span>
                    <h4 className="font-serif text-base md:text-lg font-normal text-foreground capitalize leading-tight">
                      {name}
                    </h4>
                  </div>

                  {/* Month timeline strip */}
                  <div className="flex gap-1 mb-2">
                    {monthOrder.map(m => {
                      const isActive = months.includes(m)
                      const isPeak = t(`${prefix}.calendar.${m}`).toLowerCase().includes(`${name} (peak)`)
                      return (
                        <div
                          key={m}
                          title={monthNames[MONTHS.indexOf(m)]}
                          className={`flex-1 h-2 rounded-sm transition-all duration-300 ${
                            isPeak
                              ? 'bg-accent shadow-[0_0_4px_rgba(var(--accent),0.5)]'
                              : isActive
                                ? 'bg-accent/40 group-hover:bg-accent/60'
                                : 'bg-muted/20'
                          }`}
                        />
                      )
                    })}
                  </div>

                  {/* Month labels (compact) */}
                  <div className="flex gap-1 mb-3">
                    {monthOrder.map(m => (
                      <span
                        key={m}
                        className={`flex-1 text-center text-[8px] md:text-[9px] font-sans font-medium uppercase ${
                          months.includes(m) ? 'text-foreground/60' : 'text-muted-foreground/30'
                        }`}
                      >
                        {monthNames[MONTHS.indexOf(m)].charAt(0)}
                      </span>
                    ))}
                  </div>

                  {/* Season label */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-[11px] font-sans text-muted-foreground">
                      {getSeasonLabel(months)}
                    </span>
                    {isYearRound && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold bg-accent/10 text-accent border border-accent/20">
                        {language === 'es' ? 'Todo el año' : 'Year round'}
                      </span>
                    )}
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </PageSection>
  )
}

// ── Gallery Intro ───────────────────────────────────────────────────────────
function GalleryIntro({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const raw = t(`${prefix}.gallery.images`)
  if (raw === `${prefix}.gallery.images`) return null
  return (
    <PageSection className="bg-primary">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <FadeIn delay={300}>
          <p className="font-sans text-xs sm:text-sm md:text-base text-accent uppercase tracking-[0.3em] mb-6">{t(`${prefix}.subtitle`)}</p>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-normal text-white leading-[0.95] tracking-tight max-w-4xl mx-auto">
            {t('gallery.promise')}
          </h2>
          <div className="mt-10 w-20 h-px bg-accent/40 mx-auto" />
          <p className="font-sans text-lg text-white/50 mt-6">{t('gallery.scrollHint')}</p>
        </FadeIn>
      </div>
    </PageSection>
  )
}

// ── Gallery Images ──────────────────────────────────────────────────────────
function GalleryImages({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const raw = t(`${prefix}.gallery.images`)
  if (raw === `${prefix}.gallery.images`) return null
  interface GImg { src: string; alt: string }
  let images: GImg[] = []
  try {
    const p = JSON.parse(raw)
    if (Array.isArray(p)) images = p.map((x: unknown) => typeof x === 'string' ? { src: x, alt: '' } : { src: (x as GImg).src || '', alt: (x as GImg).alt || '' })
  } catch { return null }
  return (
    <>
      {images.map((img, i) => (
        <section key={img.src} className="h-screen w-full relative">
          <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <FadeIn delay={200}>
              <p className="font-serif text-lg md:text-3xl text-white font-normal leading-snug max-w-2xl drop-shadow-lg">{img.alt}</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-12 bg-white/30" />
                <p className="font-sans text-sm text-white/50">{i + 1} / {images.length}</p>
              </div>
            </FadeIn>
          </div>
        </section>
      ))}
    </>
  )
}

// ── Conservation ────────────────────────────────────────────────────────────
function ConservationSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const unesco = t(`${prefix}.conservation.unesco`)
  if (unesco === `${prefix}.conservation.unesco`) return null
  const pa = t(`${prefix}.conservation.protectedArea`)
  const des = t(`${prefix}.conservation.designation`)
  return (
    <PageSection className="bg-primary/90">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-3xl">
        <FadeIn delay={200}>
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-accent"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
          </div>
          <blockquote className="font-serif text-3xl md:text-5xl font-bold text-white leading-snug mb-8 drop-shadow-md">{unesco}</blockquote>
          <div className="w-20 h-px bg-accent/40 mx-auto mb-6" />
          <p className="font-sans text-lg text-white/80 font-medium">{pa !== `${prefix}.conservation.protectedArea` ? pa : ''}</p>
          <p className="font-sans text-sm text-white/50 mt-2">{des !== `${prefix}.conservation.designation` ? des : ''}</p>
        </FadeIn>
      </div>
    </PageSection>
  )
}

// ── Day at Sea ───────────────────────────────────────────────────────────────
function DayAtSeaSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()

  const isLagoon = prefix === 'magbay'
  const baseKey = isLagoon ? `${prefix}.dayInLagoon` : `${prefix}.dayAtSea`
  const heading = t(`${baseKey}.heading`)
  if (heading === `${baseKey}.heading`) return null

  const intro = t(`${baseKey}.intro`)
  const phase1Key = isLagoon ? `${baseKey}.lagoonPhase` : `${baseKey}.morning`
  const phase2Key = isLagoon ? `${baseKey}.archipelagoPhase` : `${baseKey}.afternoon`
  const phase3 = isLagoon ? null : t(`${baseKey}.evening`)
  const note = t(`${baseKey}.note`)

  const phase1 = t(phase1Key)
  const phase2 = t(phase2Key)

  interface PhaseData {
    number: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    content: string
    color: string       // tailwind color prefix e.g. 'amber'
    align: string       // 'left' | 'right'
  }

  const phases: PhaseData[] = [
    {
      number: '01',
      icon: Sunrise,
      label: isLagoon
        ? (t(`${baseKey}.lagoonPhase`) !== `${baseKey}.lagoonPhase` ? t('magbay.dayInLagoon.lagoonHeading') || 'Phase 1' : 'Phase 1')
        : (t('dest.morning') !== 'dest.morning' ? t('dest.morning') : 'Morning'),
      content: phase1,
      color: 'amber',
      align: 'left',
    },
    {
      number: '02',
      icon: Sun,
      label: isLagoon
        ? (t('magbay.dayInLagoon.archipelagoHeading') || 'Phase 2')
        : (t('dest.afternoon') !== 'dest.afternoon' ? t('dest.afternoon') : 'Afternoon'),
      content: phase2,
      color: 'sky',
      align: 'right',
    },
  ]

  // Non-lagoon destinations get the evening phase
  if (!isLagoon && phase3 !== `${baseKey}.evening`) {
    phases.push({
      number: '03',
      icon: Moon,
      label: t('dest.evening') !== 'dest.evening' ? t('dest.evening') : 'Evening',
      content: phase3,
      color: 'indigo',
      align: 'left',
    })
  }

  const colorMap: Record<string, { bg: string; border: string; text: string; soft: string }> = {
    amber:  { bg: 'bg-amber-500/5',   border: 'border-amber-500/20',  text: 'text-amber-400',   soft: 'from-amber-500/5 to-transparent' },
    sky:    { bg: 'bg-sky-500/5',     border: 'border-sky-500/20',    text: 'text-sky-400',     soft: 'from-sky-500/5 to-transparent' },
    indigo: { bg: 'bg-indigo-500/5',  border: 'border-indigo-500/20', text: 'text-indigo-400',  soft: 'from-indigo-500/5 to-transparent' },
  }

  return (
    <PageSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        {/* Heading */}
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-4">
            {heading}
          </h2>
          {intro !== `${baseKey}.intro` && (
            <p className="font-sans text-base md:text-lg text-muted-foreground text-center mb-16 md:mb-20 max-w-2xl mx-auto leading-relaxed">
              {intro}
            </p>
          )}
        </FadeIn>

        {/* Phases */}
        <div className="space-y-16 md:space-y-24">
          {phases.map((phase, i) => {
            const c = colorMap[phase.color]
            const Icon = phase.icon
            const isRight = phase.align === 'right'

            return (
              <FadeIn key={phase.number} delay={i * 150}>
                <div className={`relative max-w-2xl ${isRight ? 'ml-auto' : 'mr-auto'}`}>
                  {/* Number — large graphic element */}
                  <span className={`absolute -top-6 -left-2 font-serif text-7xl md:text-8xl font-bold ${c.text} opacity-15 select-none pointer-events-none`}>
                    {phase.number}
                  </span>

                  {/* Card */}
                  <div className={`relative rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm p-6 md:p-8 overflow-hidden`}>
                    {/* Subtle gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.soft}`} />

                    <div className="relative">
                      {/* Icon + Label header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${c.bg} border ${c.border}`}>
                          <Icon className={`w-4 h-4 ${c.text}`} />
                        </div>
                        <h4 className="font-serif text-xl md:text-2xl font-normal text-foreground">
                          {phase.label}
                        </h4>
                      </div>

                      {/* Content with visual rhythm */}
                      <div className="space-y-3">
                        {phase.content.split('. ').map((sentence, si) => {
                          const trimmed = sentence.trim()
                          if (!trimmed) return null
                          const display = trimmed.endsWith('.') ? trimmed : `${trimmed}.`
                          return (
                            <div key={si} className="flex gap-3">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.bg} border ${c.border}`} />
                              <p className="font-sans text-sm md:text-base text-foreground/80 leading-relaxed">
                                {display}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        {/* Flexibility note */}
        {note !== `${baseKey}.note` && (
          <FadeIn delay={400}>
            <div className="mt-16 flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10 max-w-xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-accent mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <p className="font-sans text-xs md:text-sm text-muted-foreground leading-relaxed">{note}</p>
            </div>
          </FadeIn>
        )}
      </div>
    </PageSection>
  )
}

// ── Water Temperature ───────────────────────────────────────────────────────
function WaterTempSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()

  const title = t(`${prefix}.waterTemp.title`)
  if (title === `${prefix}.waterTemp.title`) return null

  const WATER_TEMP_MONTHS = ['nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may'] as const
  const monthNames = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  const monthLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

  // Get temperature data for each month
  const months = WATER_TEMP_MONTHS
    .map((m, i) => {
      const temp = t(`${prefix}.waterTemp.${m}`)
      if (temp === `${prefix}.waterTemp.${m}`) return null
      return { key: m, label: monthLabels[i], temp }
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)

  if (months.length === 0) return null

  // Parse min/max temp from string like "26–29°C (79–84°F)"
  const parseTempRange = (tempStr: string): { min: number; max: number } | null => {
    const match = tempStr.match(/(\d+)[–-](\d+)/)
    if (!match) return null
    return { min: parseInt(match[1]), max: parseInt(match[2]) }
  }

  // Calculate bar heights relative to min/max of all months
  const allTemps = months.map(m => parseTempRange(m.temp)).filter(Boolean) as { min: number; max: number }[]
  const globalMin = Math.min(...allTemps.map(t => t.min))
  const globalMax = Math.max(...allTemps.map(t => t.max))
  const range = globalMax - globalMin || 1

  return (
    <PageSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-12">{title}</h2>
        </FadeIn>

        <div className="space-y-4">
          {months.map((month, i) => {
            const temps = parseTempRange(month.temp)
            const barLeft = temps ? ((temps.min - globalMin) / range) * 100 : 0
            const barWidth = temps ? ((temps.max - temps.min) / range) * 100 : 60

            return (
              <FadeIn key={month.key} delay={i * 60}>
                <div className="group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-card/40">
                  <span className="w-12 text-right font-serif text-sm md:text-base text-foreground/60 group-hover:text-foreground transition-colors">{month.label}</span>
                  <div className="flex-1 h-8 relative rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="absolute top-0 h-full rounded-full bg-gradient-to-r from-blue-500/40 via-cyan-400/50 to-teal-400/40 group-hover:from-blue-500/60 group-hover:via-cyan-400/60 group-hover:to-teal-400/60 transition-all duration-500"
                      style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 8)}%` }}
                    />
                  </div>
                  <span className="w-32 font-sans text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors">{month.temp}</span>
                </div>
              </FadeIn>
            )
          })}
        </div>

        {/* Wetsuit recommendation */}
        <FadeIn delay={500}>
          <div className="mt-10 p-4 rounded-xl bg-accent/5 border border-accent/10 max-w-md mx-auto text-center">
            <p className="font-sans text-xs md:text-sm text-muted-foreground leading-relaxed">
              {t('dest.wetsuitHint') || 'We recommend a 5mm wetsuit for Nov–Apr and a 3mm for May.'}
            </p>
          </div>
        </FadeIn>
      </div>
    </PageSection>
  )
}

// ── CTA ─────────────────────────────────────────────────────────────────────
function CTASection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()

  // Per-destination CTA keys — fall back to shared keys when absent
  const ctaHeadingKey = `${prefix}.cta`
  const ctaButtonKey = `${prefix}.ctaButton`
  const socialProofKey = `${prefix}.socialProof`

  const ctaHeadingRaw = t(ctaHeadingKey)
  const ctaHeading = ctaHeadingRaw !== ctaHeadingKey ? ctaHeadingRaw : t('dest.bookNow')

  const ctaButtonRaw = t(ctaButtonKey)
  const ctaButton = ctaButtonRaw !== ctaButtonKey ? ctaButtonRaw : t('destination.cta')

  const socialProofRaw = t(socialProofKey)
  const socialProof = socialProofRaw !== socialProofKey ? socialProofRaw : null

  return (
    <PageSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <FadeIn delay={200}>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-normal text-foreground tracking-tight leading-[0.95] mb-4">{ctaHeading}</h2>
          {socialProof && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex -space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-accent/20 border-2 border-background flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-accent"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>
                  </div>
                ))}
              </div>
              <span className="font-sans text-sm text-muted-foreground">{socialProof}</span>
            </div>
          )}
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold text-lg px-10 py-7 rounded-2xl">
            <Link href="/contacto">{ctaButton}<ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </FadeIn>
      </div>
    </PageSection>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export function DestinationPage({ prefix }: DestinationPageProps) {
  const { t } = useLanguage()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset scroll to top on mount
  useEffect(() => {
    const el = document.querySelector('main')
    if (el) el.scrollTop = 0
  }, [])

  // Track scroll for back-to-top button
  useEffect(() => {
    const el = document.querySelector('main')
    if (!el) return
    const onScroll = () => setShowBackToTop(el.scrollTop > el.clientHeight)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    const el = document.querySelector('main')
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <HeroSection prefix={prefix} />
      <DescriptionSection prefix={prefix} />
      <HighlightsSection prefix={prefix} />
      <DayAtSeaSection prefix={prefix} />
      <DiveSitesSection prefix={prefix} />
      <WaterTempSection prefix={prefix} />
      <CalendarSection prefix={prefix} />
      <GalleryIntro prefix={prefix} />
      <GalleryImages prefix={prefix} />
      <ConservationSection prefix={prefix} />
      <CTASection prefix={prefix} />

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 animate-bounce"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  )
}

export default DestinationPage
