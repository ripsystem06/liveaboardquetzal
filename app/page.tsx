import { Navigation } from '@/components/navigation'
import { Hero } from '@/components/hero'
import { ExperienceSection } from '@/components/experience-section'
import { DestinationsGrid } from '@/components/destinations-grid'
import { MarineLifeSection } from '@/components/marine-life-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { ContactFormSection } from '@/components/contact-form-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <ExperienceSection />
      <DestinationsGrid />
      <MarineLifeSection />
      <TestimonialsSection />
      <ContactFormSection />
      <Footer />
    </main>
  )
}
