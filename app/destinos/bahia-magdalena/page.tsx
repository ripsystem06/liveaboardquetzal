'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

const highlightsMagBay = ['h1', 'h2', 'h3', 'h4'] as const

export default function BahiaMagdalenaPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <Image src="/mag-bay-destination.jpg" alt="Bahía Magdalena" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="font-sans text-sm md:text-base text-white/80 uppercase tracking-wide mb-2">{t('dest.hero')}</p>
            <h1 className="font-serif text-4xl md:text-6xl font-normal text-white mb-2">{t('magbay.title')}</h1>
            <p className="font-sans text-xl text-white/90 italic">{t('magbay.subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="font-sans text-lg text-muted-foreground leading-relaxed">{t('magbay.description1')}</p>
            <p className="font-sans text-lg text-muted-foreground leading-relaxed">{t('magbay.description2')}</p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-center mb-12">
            {t('magbay.highlights')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {highlightsMagBay.map((h) => (
              <div key={h} className="p-6 bg-card rounded-lg border border-border">
                <h3 className="font-serif text-xl font-normal text-foreground mb-3">{t(`magbay.${h}`)}</h3>
                <p className="font-sans text-muted-foreground leading-relaxed">{t(`magbay.${h}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">{t('dest.bookNow')}</h2>
          <p className="font-sans text-white/80 mb-6">{t('magbay.subtitle')}</p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
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