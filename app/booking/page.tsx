import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BookingPageClient } from '@/components/booking/booking-page-client'
import { ReservationInfoCards } from '@/components/booking/reservation-info-cards'

export const metadata: Metadata = {
  title: 'Book Your Expedition — Quetzal Liveaboard',
  description: 'Reserve your diving expedition to Socorro Islands, Sea of Cortez, and Magdalena Bay. Curated tiers aboard the finest liveaboard in Baja California, Mexico.',
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const oauthStep = typeof params.step === 'string' ? parseInt(params.step, 10) : undefined
  // PayPal client id is a server-only env var passed to the client SDK as a prop
  // (never NEXT_PUBLIC_*), keeping the client id out of the static bundle.
  const paypalClientId = process.env.PAYPAL_CLIENT_ID
  const paypalEnvironment = process.env.PAYPAL_ENV === 'live' ? 'production' : 'sandbox'

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

      {/* Booking Flow (Login first, then cruise selection) */}
      <BookingPageClient oauthStep={oauthStep} paypalClientId={paypalClientId} paypalEnvironment={paypalEnvironment} />

      {/* Reservation Info — always visible, below the booking flow */}
      <section className="py-12 bg-[#f3f1ec]">
        <div className="container mx-auto px-4 lg:px-8">
          <ReservationInfoCards />
        </div>
      </section>

      <Footer />
    </main>
  )
}
