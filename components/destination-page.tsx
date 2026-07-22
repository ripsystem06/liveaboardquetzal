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

// ── Shared: Scroll-snap section wrapper ─────────────────────────────────────
function SnapSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`h-screen w-full snap-start flex items-center justify-center overflow-y-auto relative px-4 py-12 md:py-16 ${className}`}>
      {children}
    </section>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────────
function HeroSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  return (
    <SnapSection>
      <Image src={heroImageMap[prefix]} alt={t(`${prefix}.title`)} fill className="object-cover" priority unoptimized sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/50 to-primary/80" />
      <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
        <FadeIn delay={200}>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-normal text-white leading-[0.9] tracking-tight max-w-5xl mx-auto">
            {t(`${prefix}.title`)}
          </h1>
          <p className="font-sans text-xl md:text-3xl text-white/70 mt-8 max-w-2xl mx-auto italic font-light">
            {t(`${prefix}.subtitle`)}
          </p>
        </FadeIn>
      </div>
    </SnapSection>
  )
}

// ── Description ─────────────────────────────────────────────────────────────
function DescriptionSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const desc1 = t(`${prefix}.description1`)
  if (desc1 === `${prefix}.description1`) return null
  const desc2 = t(`${prefix}.description2`)
  return (
    <SnapSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl text-center">
        <FadeIn>
          <p className="font-serif text-2xl md:text-4xl text-foreground/80 leading-relaxed text-justify">{desc1}</p>
          {desc2 !== `${prefix}.description2` && (
            <p className="font-serif text-2xl md:text-4xl text-foreground/80 leading-relaxed text-justify mt-8">{desc2}</p>
          )}
        </FadeIn>
      </div>
    </SnapSection>
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
    <SnapSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-12">{heading}</h2>
        </FadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {keys.map((hKey, i) => {
            const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
            return (
              <FadeIn key={hKey} delay={i * 100}>
                <div className="group relative bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 p-7 md:p-9 transition-all duration-500 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1">
                  <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-normal text-foreground mb-2">{t(`${prefix}.${hKey}`)}</h3>
                  <p className="font-sans text-base text-muted-foreground leading-relaxed">{t(`${prefix}.${hKey}d`)}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </SnapSection>
  )
}

// ── Dive Sites ──────────────────────────────────────────────────────────────
function DiveSitesSection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const title = t(`${prefix}.diveSites.title`)
  if (title === `${prefix}.diveSites.title`) return null
  const zones = ZONES[prefix]
  const zoneNames = ZONE_DISPLAY[prefix] ?? {}
  const allSites = zones.flatMap(zone => zone.siteKeys.map(sk => ({ zoneKey: zone.zoneKey, siteKey: sk })))
  return (
    <SnapSection>
      {/* Background image — same as hero */}
      <Image src={heroImageMap[prefix]} alt="" fill className="object-cover" unoptimized sizes="100vw" />
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[0.95] text-center mb-6 drop-shadow-lg">{title}</h2>
        </FadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-6xl mx-auto">
          {allSites.map(({ zoneKey, siteKey }, i) => {
            const name = t(`${prefix}.diveSites.${zoneKey}.${siteKey}.name`)
            if (name === `${prefix}.diveSites.${zoneKey}.${siteKey}.name`) return null
            const faunaText = t(`${prefix}.diveSites.${zoneKey}.${siteKey}.fauna`)
            const faunaItems = faunaText !== `${prefix}.diveSites.${zoneKey}.${siteKey}.fauna` ? faunaText.split(', ').slice(0, 2) : []
            return (
              <FadeIn key={`${zoneKey}-${siteKey}`} delay={i * 60}>
                <div className="group/card relative bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-4 transition-all duration-500 hover:shadow-lg hover:bg-white/15 hover:-translate-y-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-blue-600 text-white border border-blue-500 mb-1.5">
                    {zoneNames[zoneKey] ?? zoneKey}
                  </span>
                  <h4 className="font-serif text-base font-normal text-white mb-1">{name}</h4>
                  <p className="font-sans text-xs text-white/70 leading-relaxed mb-1.5 line-clamp-2">{t(`${prefix}.diveSites.${zoneKey}.${siteKey}.description`)}</p>
                  {faunaItems.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {faunaItems.map(item => (
                        <span key={item} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-sans font-medium bg-blue-600/30 text-blue-100 border border-blue-500/30">{item.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </SnapSection>
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
    <SnapSection className="bg-muted/20">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-foreground tracking-tight leading-[0.95] text-center mb-10">{t('dest.calendar')}</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
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
    </SnapSection>
  )
}

// ── Gallery Intro ───────────────────────────────────────────────────────────
function GalleryIntro({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  const raw = t(`${prefix}.gallery.images`)
  if (raw === `${prefix}.gallery.images`) return null
  return (
    <SnapSection className="bg-primary">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <FadeIn delay={300}>
          <p className="font-sans text-sm md:text-base text-accent uppercase tracking-[0.3em] mb-6">{t(`${prefix}.subtitle`)}</p>
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-white leading-[0.95] tracking-tight max-w-4xl mx-auto">
            {t('gallery.promise')}
          </h2>
          <div className="mt-10 w-20 h-px bg-accent/40 mx-auto" />
          <p className="font-sans text-lg text-white/50 mt-6">{t('gallery.scrollHint')}</p>
        </FadeIn>
      </div>
    </SnapSection>
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
        <SnapSection key={img.src}>
          <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <FadeIn delay={200}>
              <p className="font-serif text-xl md:text-3xl text-white font-normal leading-snug max-w-2xl drop-shadow-lg">{img.alt}</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-12 bg-white/30" />
                <p className="font-sans text-sm text-white/50">{i + 1} / {images.length}</p>
              </div>
            </FadeIn>
          </div>
        </SnapSection>
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
    <SnapSection className="bg-primary/90">
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
    </SnapSection>
  )
}

// ── CTA ─────────────────────────────────────────────────────────────────────
function CTASection({ prefix }: { prefix: DestinationPrefix }) {
  const { t } = useLanguage()
  return (
    <SnapSection className="bg-background">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <FadeIn delay={200}>
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-foreground tracking-tight leading-[0.95] mb-8">{t('dest.bookNow')}</h2>
          <p className="font-sans text-xl md:text-2xl text-muted-foreground mb-10 max-w-xl mx-auto font-light">{t(`${prefix}.subtitle`)}</p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold text-lg px-10 py-7 rounded-2xl">
            <Link href="/contacto">{t('destination.cta')}<ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </FadeIn>
      </div>
    </SnapSection>
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
      <DiveSitesSection prefix={prefix} />
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
