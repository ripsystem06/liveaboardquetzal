import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ExpeditionCalendar } from '@/components/expedition-calendar'

export default function TestimoniosPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <ExpeditionCalendar />
      <Footer />
    </main>
  )
}
