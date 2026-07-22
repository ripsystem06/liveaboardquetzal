'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { DestinationPage } from '@/components/destination-page'

export default function SocorroPage() {
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <Navigation />
      <DestinationPage prefix="socorro" />
      <Footer />
    </main>
  )
}
