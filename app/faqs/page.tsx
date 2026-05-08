'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const bookingFAQs = ['q1', 'q2', 'q3'] as const
const prepFAQs = ['q4', 'q5', 'q6'] as const
const onboardFAQs = ['q7', 'q8', 'q9'] as const

export default function FAQsPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('faq.title')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('faq.subtitle')}</p>
        </div>
      </section>

      {/* Booking FAQs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl font-normal text-foreground mb-8">{t('faq.booking.title')}</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {bookingFAQs.map((q, i) => (
              <AccordionItem key={q} value={`booking-${i}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="font-sans font-medium text-foreground text-left">
                  {t(`faq.${q}`)}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-muted-foreground leading-relaxed">
                  {t(`faq.a${i + 1}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Preparation FAQs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl font-normal text-foreground mb-8">{t('faq.preparation.title')}</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {prepFAQs.map((q, i) => (
              <AccordionItem key={q} value={`prep-${i}`} className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="font-sans font-medium text-foreground text-left">
                  {t(`faq.${q}`)}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-muted-foreground leading-relaxed">
                  {t(`faq.a${i + 4}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Onboard FAQs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl font-normal text-foreground mb-8">{t('faq.onboard.title')}</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {onboardFAQs.map((q, i) => (
              <AccordionItem key={q} value={`onboard-${i}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="font-sans font-medium text-foreground text-left">
                  {t(`faq.${q}`)}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-muted-foreground leading-relaxed">
                  {t(`faq.a${i + 7}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </main>
  )
}