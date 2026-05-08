'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

const partners = ['p1', 'p2', 'p3', 'p4'] as const

export default function CollaborationsPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('collab.title')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('collab.subtitle')}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="font-sans text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">{t('collab.intro')}</p>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {partners.map((p) => (
              <div key={p} className="p-8 bg-card rounded-lg border border-border shadow-sm">
                <h3 className="font-serif text-xl font-normal text-foreground mb-3">{t(`collab.${p}.name`)}</h3>
                <p className="font-sans text-muted-foreground leading-relaxed">{t(`collab.${p}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-normal mb-4">{t('collab.cta')}</h2>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
            <Link href="/contacto">
              {t('collab.ctaButton')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}