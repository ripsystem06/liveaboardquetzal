import { Navigation } from '@/components/navigation'
import { Hero } from '@/components/hero'
import { ExperienceSection } from '@/components/experience-section'
import { MarineLifeSection } from '@/components/marine-life-section'
import { DestinationsGrid } from '@/components/destinations-grid'
import { UpcomingTripsSlider } from '@/components/upcoming-trips-slider'
import { TestimonialsSection } from '@/components/testimonials-section'
import { ScrollGallery } from '@/components/scroll-gallery'
import { ContactFormSection } from '@/components/contact-form-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <ExperienceSection />
      <UpcomingTripsSlider />
      <MarineLifeSection />
      <DestinationsGrid />
      <ScrollGallery />
      <TestimonialsSection />
      <ContactFormSection />
      <Footer />
    </main>
  )
}
