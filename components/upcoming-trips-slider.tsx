'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { useUser } from '@/contexts/user-context'

export function UpcomingTripsSlider() {
  const { t } = useLanguage()
  const router = useRouter()
  const { isAuthenticated } = useUser()
  
  const trips = [
    {
      id: 1,
      title: t('trips.trip1.title'),
      dates: t('trips.trip1.dates'),
      price: t('trips.trip1.price'),
      image: '/images/panoramicas/burritos galapagos 1.webp',
    },
    {
      id: 2,
      title: t('trips.trip2.title'),
      dates: t('trips.trip2.dates'),
      price: t('trips.trip2.price'),
      image: '/images/panoramicas/Cabo Pearce .webp',
    },
    {
      id: 3,
      title: t('trips.trip3.title'),
      dates: t('trips.trip3.dates'),
      price: t('trips.trip3.price'),
      image: '/images/panoramicas/Quetzal El Cañon.webp',
    },
  ]
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trips.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trips.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trips.length) % trips.length)
  }

  return (
    <section className="relative h-[600px] md:h-[700px] w-full overflow-hidden">
      {/* Slides */}
      {trips.map((trip, index) => (
        <div
          key={trip.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <Image
            src={trip.image || "/placeholder.svg"}
            alt={trip.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl text-white">
                <p className="font-sans text-sm md:text-base uppercase tracking-wide mb-2">
                  {t('trips.title')}
                </p>
                <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal mb-6">
                  {trip.title}
                </h2>
                <p className="font-sans text-base md:text-lg italic mb-4 opacity-90">
                  {t('trips.subtitle')}
                </p>
                <p className="font-sans text-lg md:text-xl mb-2 font-semibold">
                  {trip.dates}
                </p>
                <p className="font-sans text-xl md:text-2xl mb-8 font-bold">
                  {trip.price}
                </p>
                {isAuthenticated ? (
                  <Button 
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-sans font-semibold"
                  >
                    <Link href="/booking">
                      {t('booking.cruise.select')}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    onClick={() => router.push('/booking?step=1')}
                    className="bg-white text-primary hover:bg-white/90 font-sans font-semibold"
                  >
                    {t('booking.cruise.signIn')}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

    </section>
  )
}
