import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BookingPageClient } from '@/components/booking/booking-page-client'

export const metadata: Metadata = {
  title: 'Book Your Expedition | Quetzal Liveaboard',
  description: 'Reserve your liveaboard expedition to the Sea of Cortez, Socorro Islands, and Baja California. Choose from 3 curated itineraries.',
}

export default function BookingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="relative pt-32 pb-16 bg-muted/30 overflow-hidden">
        {/* Subtle decorative line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">
            Expeditions
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4 text-balance">
            Book Your Expedition
          </h1>
          <p className="font-sans text-base text-muted-foreground max-w-xl mx-auto text-pretty">
            Reserve your spot on one of our curated liveaboard expeditions.
            Complete the booking flow below.
          </p>
        </div>
      </section>

      {/* Booking Flow */}
      <BookingPageClient />

      <Footer />
    </main>
  )
}
