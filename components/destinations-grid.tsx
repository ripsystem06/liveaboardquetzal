'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

const destinations = [
  {
    id: 'socorro',
    titleKey: 'destinations.socorro.title',
    descKey: 'destinations.socorro.description',
    image: '/images/panoramicas/Isla Socorro.webp',
    href: '/destinos/islas-socorro',
    align: 'left' as const,
  },
  {
    id: 'magbay',
    titleKey: 'destinations.magbay.title',
    descKey: 'destinations.magbay.description',
    image: '/images/panoramicas/loreto-magdalena-bay.webp',
    href: '/destinos/bahia-magdalena',
    align: 'right' as const,
  },
  {
    id: 'cortez',
    titleKey: 'destinations.cortez.title',
    descKey: 'destinations.cortez.description',
    image: '/images/panoramicas/PuntaTosca.webp',
    href: '/destinos/mar-de-cortes',
    align: 'left' as const,
  },
]

// Diagonal offset — consistent angle for all strips
const D = 'clamp(32px, 5vw, 64px)'

export function DestinationsGrid() {
  const { t } = useLanguage()

  return (
    <section className="bg-background overflow-hidden">
      {/* Header */}
      <div className="pt-24 pb-16 md:pb-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <p className="font-sans text-xs md:text-sm text-accent uppercase tracking-[0.2em] mb-3">
            {t('destinations.subtitle')}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight max-w-2xl leading-tight">
            {t('destinations.title')}
          </h2>
        </div>
      </div>

      {/* Diagonal destination strips */}
      {destinations.map((dest, index) => {
        const isFirst = index === 0
        const isLast = index === destinations.length - 1

        // Clip-path geometry:
        //   First:  top-flat,  bottom-diagonal (bottom-right cut)
        //   Middle: top-diagonal, bottom-diagonal (both cuts)
        //   Last:   top-diagonal, bottom-flat
        let clipPath: string
        if (isFirst) {
          clipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${D}), 0 100%)`
        } else if (isLast) {
          clipPath = `polygon(0 ${D}, 100% 0, 100% 100%, 0 100%)`
        } else {
          clipPath = `polygon(0 ${D}, 100% 0, 100% calc(100% - ${D}), 0 100%)`
        }

        return (
          <div
            key={dest.id}
            className="relative w-full h-[380px] md:h-[480px] group cursor-pointer overflow-hidden"
            style={{
              clipPath,
              marginTop: isFirst ? '0' : `calc(-1 * ${D})`,
            }}
          >
            {/* Background Image */}
            <Image
              src={dest.image}
              alt={t(dest.titleKey)}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 ${
                dest.align === 'left'
                  ? 'bg-gradient-to-r from-primary/85 via-primary/55 to-primary/25'
                  : 'bg-gradient-to-l from-primary/85 via-primary/55 to-primary/25'
              }`}
            />

            {/* Content */}
            <div
              className={`relative h-full flex items-center ${
                dest.align === 'left' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-lg px-6 md:px-16 ${
                  dest.align === 'left' ? 'text-left' : 'text-right'
                }`}
                style={{
                  paddingTop: isFirst ? '0' : `calc(${D} / 2)`,
                  paddingBottom: isLast ? '0' : `calc(${D} / 2)`,
                }}
              >
                <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-white mb-5 tracking-tight leading-tight">
                  {t(dest.titleKey)}
                </h3>

                <p className="font-sans text-sm md:text-base text-white/80 leading-relaxed mb-7 max-w-md">
                  {t(dest.descKey)}
                </p>

                <Link
                  href={dest.href}
                  className={`inline-flex items-center gap-2 text-white font-sans font-medium text-sm md:text-base border-b border-white/40 hover:border-white transition-all pb-1 group/link ${
                    dest.align === 'right' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {t('destinations.explore')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
