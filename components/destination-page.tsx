'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUp, Compass, Fish, Shell, Sparkles, Star, Waves } from 'lucide-react'
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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/50 to-primary/80" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {keys.map((hKey, i) => {
            const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
            return (
              <FadeIn key={hKey} delay={i * 100}>
                <div className="group relative bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-5 md:p-7 transition-all duration-500 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1">
                  <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-normal text-foreground mb-2">{t(`${prefix}.${hKey}`)}</h3>
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

  return (
    <PageSection className="min-h-[60vh] md:min-h-[70vh]">
      {/* Background image — same as hero */}
      <Image src={heroImageMap[prefix]} alt="" fill className="object-cover" unoptimized sizes="100vw" />
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[0.95] text-center mb-6 drop-shadow-lg">{title}</h2>
        </FadeIn>

        {/* Zone groups with narrative intros */}
        <div className="space-y-10 max-w-6xl mx-auto">
          {zones.map(zone => {
            // Zone intro narrative (Socorro only — reads {prefix}.areas.{zoneKey})
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

            return (
              <div key={zone.zoneKey}>
                {/* Zone narrative intro */}
                {hasAreaIntro && (
                  <FadeIn delay={100}>
                    <p className="font-sans text-sm md:text-base text-white/70 leading-relaxed mb-5 max-w-3xl text-center mx-auto italic">{areaIntro}</p>
                  </FadeIn>
                )}

                {/* Site cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sites.map(({ siteKey, name, desc, faunaItems }, i) => (
                    <FadeIn key={`${zone.zoneKey}-${siteKey}`} delay={i * 60}>
                      <div className="group/card relative bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4 transition-all duration-500 hover:shadow-lg hover:bg-white/15 hover:-translate-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-blue-600 text-white border border-blue-500 mb-1.5">
                          {zoneNames[zone.zoneKey] ?? zone.zoneKey}
                        </span>
                        <h4 className="font-serif text-base font-normal text-white mb-1">{name}</h4>
                        <p className="font-sans text-xs text-white/70 leading-relaxed mb-1.5 line-clamp-2">{desc}</p>
                        {faunaItems.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {faunaItems.map(item => (
                              <span key={item} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-sans font-medium bg-blue-600/30 text-blue-100 border border-blue-500/30">{item.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PageSection>
  )
}

// ── Calendar ────────────────────────────────────────────────────────────────
function CalendarSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t, language } = useLanguage()
  const existing = MONTHS.filter(m => t(`${prefix}.calendar.${m}`) !== `${prefix}.calendar.${m}`)
  if (existing.length === 0) return null

  const monthNames = MONTHS.map(m => {
    const date = new Date(2024, MONTHS.indexOf(m), 1)
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { month: 'long' })
  })

  return (
    <PageSection className="bg-muted/20">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-10">{t('dest.calendar')}</h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {existing.map((m, i) => {
            const fauna = t(`${prefix}.calendar.${m}`)
            return (
              <FadeIn key={m} delay={40}>
                <div className="p-6 rounded-2xl border bg-card/60 border-border/20 hover:border-accent/30 transition-all duration-500">
                  <h4 className="font-serif text-xl md:text-2xl font-normal text-foreground mb-2">{monthNames[MONTHS.indexOf(m)]}</h4>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">{fauna}</p>
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

  // MagBay uses dayInLagoon keys instead of dayAtSea
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

  const TimeIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center -translate-x-1/2">
      {children}
    </div>
  )

  return (
    <PageSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-4">{heading}</h2>
          {intro !== `${baseKey}.intro` && (
            <p className="font-sans text-base md:text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto leading-relaxed">{intro}</p>
          )}
        </FadeIn>

        {/* Timeline layout */}
        <div className="relative pl-16 md:pl-20 space-y-12 before:absolute before:left-16 md:before:left-20 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
          {/* Phase 1 — Morning / Lagoon */}
          <FadeIn delay={100}>
            <div className="relative">
              <TimeIcon>
                <span className="text-accent text-xs font-bold">1</span>
              </TimeIcon>
              <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-5 md:p-7 transition-all duration-500 hover:shadow-lg hover:border-accent/20">
                <h4 className="font-serif text-lg md:text-xl font-normal text-foreground mb-3">
                  {isLagoon ? t(`${baseKey}.lagoonPhase`) !== `${baseKey}.lagoonPhase` ? t('magbay.dayInLagoon.lagoonHeading') || 'Phase 1' : 'Phase 1' : t('dest.morning') || 'Morning'}
                </h4>
                <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">{phase1}</p>
              </div>
            </div>
          </FadeIn>

          {/* Phase 2 — Afternoon / Archipelago */}
          <FadeIn delay={200}>
            <div className="relative">
              <TimeIcon>
                <span className="text-accent text-xs font-bold">2</span>
              </TimeIcon>
              <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-5 md:p-7 transition-all duration-500 hover:shadow-lg hover:border-accent/20">
                <h4 className="font-serif text-lg md:text-xl font-normal text-foreground mb-3">
                  {isLagoon ? t('magbay.dayInLagoon.archipelagoHeading') || 'Phase 2' : t('dest.afternoon') || 'Afternoon'}
                </h4>
                <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">{phase2}</p>
              </div>
            </div>
          </FadeIn>

          {/* Phase 3 — Evening (non-lagoon only) */}
          {!isLagoon && phase3 !== `${baseKey}.evening` && (
            <FadeIn delay={300}>
              <div className="relative">
                <TimeIcon>
                  <span className="text-accent text-xs font-bold">3</span>
                </TimeIcon>
                <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-5 md:p-7 transition-all duration-500 hover:shadow-lg hover:border-accent/20">
                  <h4 className="font-serif text-lg md:text-xl font-normal text-foreground mb-3">{t('dest.evening') || 'Evening'}</h4>
                  <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">{phase3}</p>
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Flexibility note */}
        {note !== `${baseKey}.note` && (
          <FadeIn delay={400}>
            <div className="mt-10 flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10 max-w-xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-accent mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
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
