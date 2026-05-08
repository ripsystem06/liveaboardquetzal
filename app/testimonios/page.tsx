'use client'

import { useState } from 'react'
import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

const testimonials = [
  {
    id: 1,
    quote: 'The most incredible diving experience of my life. The crew was professional, the boat was luxurious, and seeing giant mantas at Socorro was absolutely breathtaking. Worth every penny!',
    author: 'Sarah Mitchell',
    location: 'California, USA',
    trip: 'socorro',
  },
  {
    id: 2,
    quote: 'An unforgettable adventure! The team at Quetzal made everything seamless. Swimming with dolphins and whales in their natural habitat was a dream come true. Highly recommend!',
    author: 'Michael Chen',
    location: 'Singapore',
    trip: 'cortez',
  },
  {
    id: 3,
    quote: 'Exceptional service from start to finish. The food was outstanding, cabins were comfortable, and the dive guides knew exactly where to find the best marine life. Already planning our next trip!',
    author: 'Emma Rodriguez',
    location: 'Madrid, Spain',
    trip: 'magBay',
  },
  {
    id: 4,
    quote: 'This liveaboard exceeded all expectations. The attention to detail, safety protocols, and passion of the crew made this a world-class experience. The hammerhead encounters were simply magical!',
    author: 'James Thompson',
    location: 'London, UK',
    trip: 'socorro',
  },
  {
    id: 5,
    quote: 'Five stars all around! From the moment we boarded to the final farewell, every aspect was perfectly executed. The underwater encounters were beyond what we imagined. This is bucket list diving!',
    author: 'Lisa Anderson',
    location: 'Sydney, Australia',
    trip: 'cortez',
  },
  {
    id: 6,
    quote: 'An adventure of a lifetime! The Quetzal team went above and beyond to ensure we had the best experience. The marine life, the comfort, the camaraderie - everything was perfect!',
    author: 'Carlos Mendez',
    location: 'Mexico City, Mexico',
    trip: 'magBay',
  },
]

const filters = ['all', 'socorro', 'cortez', 'magBay'] as const

export default function TestimonialsPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? testimonials : testimonials.filter((t) => t.trip === filter)

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('testimonials.pageTitle')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('testimonials.pageSubtitle')}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 flex justify-center gap-3 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-sans text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent/20'
              }`}
            >
              {t(`testimonials.${f}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((testimonial) => (
              <Card key={testimonial.id} className="border-border hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-accent" />
                  </div>
                  <blockquote className="font-sans text-muted-foreground mb-6 leading-relaxed">
                    {testimonial.quote}
                  </blockquote>
                  <div className="border-t border-border pt-4">
                    <div className="font-sans font-semibold text-foreground">{testimonial.author}</div>
                    <div className="font-sans text-sm text-muted-foreground">{testimonial.location}</div>
                    <div className="font-sans text-xs text-accent font-medium mt-1">{t(`testimonials.${testimonial.trip}`)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}