'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

const testimonials = [
  {
    id: 1,
    quote: 'The most incredible diving experience of my life. The crew was professional, the boat was luxurious, and seeing giant mantas at Socorro was absolutely breathtaking. Worth every penny!',
    author: 'Sarah Mitchell',
    location: 'California, USA',
    trip: 'Socorro Islands 2025',
  },
  {
    id: 2,
    quote: 'An unforgettable adventure! The team at Quetzal made everything seamless. Swimming with dolphins and whales in their natural habitat was a dream come true. Highly recommend!',
    author: 'Michael Chen',
    location: 'Singapore',
    trip: 'Sea of Cortez 2024',
  },
  {
    id: 3,
    quote: 'Exceptional service from start to finish. The food was outstanding, cabins were comfortable, and the dive guides knew exactly where to find the best marine life. Already planning our next trip!',
    author: 'Emma Rodriguez',
    location: 'Madrid, Spain',
    trip: 'Mag Bay & Socorro 2025',
  },
  {
    id: 4,
    quote: 'This liveaboard exceeded all expectations. The attention to detail, safety protocols, and passion of the crew made this a world-class experience. The hammerhead encounters were simply magical!',
    author: 'James Thompson',
    location: 'London, UK',
    trip: 'Socorro Islands 2024',
  },
  {
    id: 5,
    quote: 'Five stars all around! From the moment we boarded to the final farewell, every aspect was perfectly executed. The underwater encounters were beyond what we imagined. This is bucket list diving!',
    author: 'Lisa Anderson',
    location: 'Sydney, Australia',
    trip: 'Sea of Cortez 2025',
  },
  {
    id: 6,
    quote: 'An adventure of a lifetime! The Quetzal team went above and beyond to ensure we had the best experience. The marine life, the comfort, the camaraderie — everything was perfect!',
    author: 'Carlos Mendez',
    location: 'Mexico City, Mexico',
    trip: 'Mag Bay 2024',
  },
]

export function TestimonialsSection() {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const next = useCallback(() => {
    goTo((currentIndex + 1) % testimonials.length)
  }, [currentIndex, goTo])

  const prev = useCallback(() => {
    goTo((currentIndex - 1 + testimonials.length) % testimonials.length)
  }, [currentIndex, goTo])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const current = testimonials[currentIndex]
  const initial = current.author.charAt(0)

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="font-sans text-xs md:text-sm text-accent uppercase tracking-[0.2em] mb-3">
            {t('testimonials.subtitle')}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight">
            {t('testimonials.title')}
          </h2>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Large decorative quote */}
          <div className="mb-8 md:mb-10">
            <svg width="48" height="40" viewBox="0 0 48 40" fill="none" className="mx-auto text-accent/30" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 40V22.4C0 16.64 1.12 11.84 3.36 8C5.6 4.16 8.96 1.6 13.44 0.32L16.8 6.24C13.6 7.52 11.04 9.6 9.12 12.48C7.2 15.36 6.24 18.88 6.24 23.04H16.8V40H0Z" fill="currentColor"/>
              <path d="M28.8 40V22.4C28.8 16.64 29.92 11.84 32.16 8C34.4 4.16 37.76 1.6 42.24 0.32L45.6 6.24C42.4 7.52 39.84 9.6 37.92 12.48C36 15.36 35.04 18.88 35.04 23.04H45.6V40H28.8Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Quote */}
          <blockquote
            key={current.id}
            className="font-serif text-xl md:text-2xl lg:text-3xl font-normal text-foreground leading-relaxed mb-10 transition-all duration-500"
          >
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>

          {/* Author */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-1">
              <span className="font-sans text-xl font-semibold text-accent">{initial}</span>
            </div>
            <p className="font-sans font-semibold text-foreground text-lg">{current.author}</p>
            <p className="font-sans text-sm text-muted-foreground">{current.location}</p>
            <p className="font-sans text-xs text-accent font-medium mt-1">{current.trip}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={prev}
            className="w-12 h-12 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent flex items-center justify-center transition-all duration-300 disabled:opacity-30"
            disabled={isTransitioning}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2 mx-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                disabled={isTransitioning}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-2.5 bg-accent'
                    : 'w-2.5 h-2.5 bg-border hover:bg-accent/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-12 h-12 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent flex items-center justify-center transition-all duration-300 disabled:opacity-30"
            disabled={isTransitioning}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
