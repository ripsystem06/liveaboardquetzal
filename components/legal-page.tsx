import type { LegalDocument } from '@/lib/legal/privacy'
import { useLanguage } from '@/contexts/language-context'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

interface LegalPageProps {
  data: Record<'en' | 'es', LegalDocument>
}

export function LegalPage({ data }: LegalPageProps) {
  const { language } = useLanguage()
  const doc = data[language]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        {/* Quetzal Logo — centered */}
        <div className="flex justify-center mb-12">
          <Link href="/" aria-label="Quetzal Liveaboard — Home" className="inline-block">
            <Image
              src="/logosquetzal/logosinfrase.svg"
              alt="Quetzal Liveaboard"
              width={140}
              height={56}
              className="h-14 w-auto"
              priority
            />
          </Link>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-2">
          {doc.title}
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-10">
          {language === 'en' ? 'Last updated: ' : 'Última actualización: '}
          {doc.lastUpdated}
        </p>

        <div className="space-y-10">
          {doc.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-serif text-2xl font-normal text-foreground mb-4">
                {section.heading}
              </h2>
              {section.content.map((paragraph, j) => (
                <p key={j} className="font-sans text-base text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  {section.list.map((item, k) => (
                    <li key={k} className="font-sans text-base text-muted-foreground leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Back to Home button */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors font-sans text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            {language === 'en' ? 'Back to Home' : 'Volver al Inicio'}
          </Link>
        </div>
      </div>
    </section>
  )
}
