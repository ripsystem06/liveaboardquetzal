'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { DestinationPage } from '@/components/destination-page'

export default function SocorroPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <DestinationPage prefix="socorro" />
      <Footer />
    </main>
  )
}
