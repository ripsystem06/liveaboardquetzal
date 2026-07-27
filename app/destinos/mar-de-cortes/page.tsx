'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { DestinationPage } from '@/components/destination-page'

export default function SeaOfCortezPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <DestinationPage prefix="cortez" />
      <Footer />
    </main>
  )
}
