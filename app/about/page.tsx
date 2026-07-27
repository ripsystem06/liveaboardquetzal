'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Fish, Compass, Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

const values = [
  { icon: Fish, key: 'v1' },
  { icon: Compass, key: 'v2' },
  { icon: Heart, key: 'v3' },
  { icon: Star, key: 'v5' },
] as const

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('about.title')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl font-normal text-foreground">{t('about.story')}</h2>
              <p className="font-sans text-muted-foreground leading-relaxed">{t('about.storyText1')}</p>
              <p className="font-sans text-muted-foreground leading-relaxed">{t('about.storyText2')}</p>
              <p className="font-sans text-muted-foreground leading-relaxed">{t('about.storyText3')}</p>
              <p className="font-sans text-muted-foreground leading-relaxed">{t('about.storyText4')}</p>
              <p className="font-sans text-muted-foreground leading-relaxed">{t('about.storyText5')}</p>
              <p className="font-sans text-muted-foreground leading-relaxed">{t('about.storyText6')}</p>
            </div>
            <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
              <Image
                src="/images/Interior/interior-07.webp"
                alt="Quetzal Crew"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-center mb-12">{t('about.values')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.key} className="flex gap-4 p-6 bg-card rounded-lg border border-border">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foreground mb-2">{t(`about.${v.key}`)}</h3>
                  <p className="font-sans text-muted-foreground leading-relaxed">{t(`about.${v.key}d`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-normal text-foreground mb-4">{t('about.cta')}</h2>
          <p className="font-sans text-lg text-muted-foreground mb-6">{t('about.socialProof')}</p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
            <Link href="/contacto">
              {t('about.ctaButton')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}