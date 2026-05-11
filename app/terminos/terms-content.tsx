'use client'

import { useLanguage } from '@/contexts/language-context'

export function TermsContent() {
  const { t } = useLanguage()

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-8">
          {t('terms.title')}
        </h1>
        <p className="font-sans text-lg text-muted-foreground leading-relaxed">
          {t('terms.content')}
        </p>
      </div>
    </section>
  )
}
