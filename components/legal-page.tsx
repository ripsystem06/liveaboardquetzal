import type { LegalDocument } from '@/lib/legal/privacy'
import { useLanguage } from '@/contexts/language-context'

interface LegalPageProps {
  data: Record<'en' | 'es', LegalDocument>
}

export function LegalPage({ data }: LegalPageProps) {
  const { language } = useLanguage()
  const doc = data[language]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
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
      </div>
    </section>
  )
}
