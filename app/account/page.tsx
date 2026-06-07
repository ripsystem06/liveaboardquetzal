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
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
            My Account
          </h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your profile information and view your reservation history.
          </p>
        </div>
      </section>

      {/* Account Content */}
      <AccountPageClient />

      <Footer />
    </main>
  )
}