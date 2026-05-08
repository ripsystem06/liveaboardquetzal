'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Ship, Bed, UtensilsCrossed, ThermometerSun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-D7hEhqk5Qp6P4NrzyUfXZefge69pOW.png"
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