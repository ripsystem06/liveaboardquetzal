import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AccountPageClient } from '@/components/account/account-page-client'

export const metadata: Metadata = {
  title: 'My Account | Quetzal Liveaboard',
  description: 'Manage your profile and view your reservation history.',
}

export default function AccountPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="relative pt-32 pb-4 bg-muted/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" />
      </section>

      {/* Account Content */}
      <AccountPageClient />

      <Footer />
    </main>
  )
}