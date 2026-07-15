'use client'

import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ExpeditionCalendar } from '@/components/expedition-calendar'
import { useLanguage } from '@/contexts/language-context'

export default function ExpeditionsPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <Image
          src="/images/panoramicas/Manta el Boiler 1.webp"
          alt="Manta ray at El Boiler, Socorro Islands"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-white tracking-tight">
              {t('nav.calendar')}
            </h1>
          </div>
        </div>
      </section>

      <ExpeditionCalendar />
      <Footer />
    </main>
  )
}
