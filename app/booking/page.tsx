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
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
            Book Your Expedition
          </h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
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
