'use client'

import { MessageCircle, Phone, Clock, MapPin } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ContactFormSection } from '@/components/contact-form-section'
import { useLanguage } from '@/contexts/language-context'

export default function ContactoPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('contact.pageTitle')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('contact.pageSubtitle')}</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-card rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-1">{t('contact.emailField')}</h3>
              <a href="mailto:contact@quetzalliveaboard.com" className="font-sans text-accent hover:text-accent/80 transition-colors text-sm">
                contact@quetzalliveaboard.com
              </a>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-1">{t('contact.phone')}</h3>
              <p className="font-sans text-muted-foreground text-sm">{t('contact.phoneVal')}</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-1">{t('contact.hours')}</h3>
              <p className="font-sans text-muted-foreground text-sm">{t('contact.hoursVal')}</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-1">{t('contact.location')}</h3>
              <p className="font-sans text-muted-foreground text-sm">{t('contact.locationVal')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactFormSection />

      <Footer />
    </main>
  )
}