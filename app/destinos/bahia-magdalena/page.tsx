'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { DestinationPage } from '@/components/destination-page'

export default function BahiaMagdalenaPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <DestinationPage prefix="magbay" />
      <Footer />
    </main>
  )
}
