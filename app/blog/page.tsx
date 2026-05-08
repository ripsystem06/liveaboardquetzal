'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

const categories = ['catAll', 'catExpeditions', 'catMarine', 'catGuides', 'catConservation'] as const

export default function BlogPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('blog.title')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('blog.subtitle')}</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 flex justify-center gap-3 flex-wrap">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-4 py-2 rounded-full bg-muted text-muted-foreground font-sans text-sm font-medium"
            >
              {t(`blog.${cat}`)}
            </span>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">{t('blog.comingSoon')}</h2>
          <p className="font-sans text-lg text-muted-foreground max-w-xl mx-auto mb-8">{t('blog.comingSoonDesc')}</p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
            <Link href="/">
              {t('shared.backHome')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}