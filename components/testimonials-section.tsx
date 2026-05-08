'use client'

import { useState } from 'react'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

const testimonials = [
  {
    id: 1,
    quote: 'The most incredible diving experience of my life. The crew was professional, the boat was luxurious, and seeing giant mantas at Socorro was absolutely breathtaking. Worth every penny!',
    author: 'Sarah Mitchell',
    location: 'California, USA',
    trip: 'Socorro Islands 2025'
  },
  {
    id: 2,
    quote: 'An unforgettable adventure! The team at Quetzal made everything seamless. Swimming with dolphins and whales in their natural habitat was a dream come true. Highly recommend!',
    author: 'Michael Chen',
    location: 'Singapore',
    trip: 'Sea of Cortez 2024'
  },
  {
    id: 3,
    quote: 'Exceptional service from start to finish. The food was outstanding, cabins were comfortable, and the dive guides knew exactly where to find the best marine life. Already planning our next trip!',
    author: 'Emma Rodriguez',
    location: 'Madrid, Spain',
    trip: 'Mag Bay & Socorro 2025'
  },
  {
    id: 4,
    quote: 'This liveaboard exceeded all expectations. The attention to detail, safety protocols, and passion of the crew made this a world-class experience. The hammerhead encounters were simply magical!',
    author: 'James Thompson',
    location: 'London, UK',
    trip: 'Socorro Islands 2024'
  },
  {
    id: 5,
    quote: 'Five stars all around! From the moment we boarded to the final farewell, every aspect was perfectly executed. The underwater encounters were beyond what we imagined. This is bucket list diving!',
    author: 'Lisa Anderson',
    location: 'Sydney, Australia',
    trip: 'Sea of Cortez 2025'
  },
  {
    id: 6,
    quote: 'An adventure of a lifetime! The Quetzal team went above and beyond to ensure we had the best experience. The marine life, the comfort, the camaraderie - everything was perfect!',
    author: 'Carlos Mendez',
    location: 'Mexico City, Mexico',
    trip: 'Mag Bay 2024'
  }
]

export function TestimonialsSection() {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const testimonialsPerView = 3

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + testimonialsPerView >= testimonials.length ? 0 : prev + testimonialsPerView
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - testimonialsPerView : prev - testimonialsPerView
    )
  }

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + testimonialsPerView)

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background hover:bg-accent hover:text-accent-foreground shadow-lg hidden lg:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background hover:bg-accent hover:text-accent-foreground shadow-lg hidden lg:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-border hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-accent" />
                  </div>

                  {/* Quote Text */}
                  <blockquote className="font-sans text-muted-foreground mb-6 leading-relaxed">
                    {testimonial.quote}
                  </blockquote>

                  {/* Author Info */}
                  <div className="border-t border-border pt-4">
                    <div className="font-sans font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="font-sans text-sm text-muted-foreground">
                      {testimonial.location}
                    </div>
                    <div className="font-sans text-xs text-accent font-medium mt-1">
                      {testimonial.trip}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-8 lg:hidden">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * testimonialsPerView)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index * testimonialsPerView
                    ? 'bg-accent w-8'
                    : 'bg-border hover:bg-accent/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
