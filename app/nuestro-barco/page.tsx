'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Ship, Bed, UtensilsCrossed, ThermometerSun, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

const galleryImages = [
  // Habitaciones
  { src: '/images/Habitaciones/cabin-01.webp', alt: 'Stateroom with panoramic ocean view', category: 'staterooms' },
  { src: '/images/Habitaciones/cabin-02.webp', alt: 'Luxury cabin interior', category: 'staterooms' },
  { src: '/images/Habitaciones/cabin-03.webp', alt: 'Double bed cabin with natural light', category: 'staterooms' },
  { src: '/images/Habitaciones/cabin-04.webp', alt: 'Cozy cabin with premium bedding', category: 'staterooms' },
  // Interior
  { src: '/images/Interior/interior-01.webp', alt: 'Elegant dining salon', category: 'interior' },
  { src: '/images/Interior/interior-02.webp', alt: 'Spacious lounge area', category: 'interior' },
  { src: '/images/Interior/interior-03.webp', alt: 'Common area with panoramic windows', category: 'interior' },
  { src: '/images/Interior/interior-04.webp', alt: 'Cozy social lounge onboard', category: 'interior' },
]

const specs = [
  { key: 'length', icon: Ship },
  { key: 'guests', icon: Bed },
  { key: 'cabins', icon: Bed },
  { key: 'speed', icon: ArrowRight },
  { key: 'beam', icon: ArrowRight },
  { key: 'compressor', icon: ArrowRight },
]

const comforts = [
  { icon: UtensilsCrossed, key: 'dining' },
  { icon: ThermometerSun, key: 'sunDeck' },
  { icon: Bed, key: 'cabin' },
  { icon: Ship, key: 'dive' },
]

export default function OurBoatPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src="/images/Exterior/quetzal-navegando-1.webp"
          alt="Quetzal Liveaboard"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-serif text-4xl md:text-6xl font-normal text-white mb-4">
              {t('boat.hero')}
            </h1>
            <p className="font-sans text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              {t('boat.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Deck Plans */}
      <section className="py-20 bg-background">
        <div className="text-center mb-12 px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
            Deck Plans
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the layout of our 120-foot vessel, designed for comfort and functionality at sea.
          </p>
        </div>
        <div className="px-[5vw]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              { src: '/images/specsship/vistaperfil.png', label: 'Vista de Perfil' },
              { src: '/images/specsship/cubiertaprincipal.png', label: 'Cubierta Principal' },
              { src: '/images/specsship/cubiertasuperior.png', label: 'Cubierta Superior' },
              { src: '/images/specsship/distribuciondefondo.png', label: 'Distribución de Fondo' },
            ].map((plan) => (
              <div key={plan.src} className="relative">
                <Image
                  src={plan.src}
                  alt={plan.label}
                  width={800}
                  height={350}
                  className="w-full h-auto border border-gray-300 rounded-lg"
                />
                <p className="text-center font-sans text-sm font-semibold text-foreground mt-3 uppercase tracking-wide">{plan.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-center mb-12">
            {t('boat.specs.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specs.map((spec) => (
              <div key={spec.key} className="text-center p-6 bg-card rounded-lg border border-border">
                <p className="font-sans text-sm text-muted-foreground mb-1">{t(`boat.specs.${spec.key}`)}</p>
                <p className="font-sans text-lg font-semibold text-foreground">{t(`boat.specs.${spec.key}Val`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comfort */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
              {t('boat.comfort.title')}
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('boat.comfort.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {comforts.map((item) => (
              <div key={item.key} className="flex gap-4 p-6 bg-card rounded-lg border border-border">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foreground mb-2">{t(`boat.comfort.${item.key}`)}</h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">{t(`boat.comfort.${item.key}Desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
              {t('boat.gallery.title')}
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('boat.gallery.subtitle')}
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.src}
                className="relative group overflow-hidden rounded-lg aspect-[4/3] lg:aspect-square bg-muted"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {image.category === 'staterooms' ? t('boat.gallery.staterooms') : t('boat.gallery.interior')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">{t('dest.bookNow')}</h2>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold mt-4">
            <Link href="/contacto">
              {t('destination.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}