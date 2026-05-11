'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

export function DestinationsGrid() {
  const { t } = useLanguage()
  
  const destinations = [
    {
      id: 'socorro',
      title: t('destinations.socorro.title'),
      description: t('destinations.socorro.description'),
      image: '/socorro-destination.jpg',
      href: '/destinos/islas-socorro'
    },
    {
      id: 'mag-bay-socorro',
      title: t('destinations.magbay.title'),
      description: t('destinations.magbay.description'),
      image: '/mag-bay-destination.jpg',
      href: '/destinos/bahia-magdalena'
    },
    {
      id: 'sea-of-cortez',
      title: t('destinations.cortez.title'),
      description: t('destinations.cortez.description'),
      image: '/sea-cortez-destination.jpg',
      href: '/destinos/mar-de-cortes'
    }
  ]
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
            {t('destinations.title')}
          </h2>
          <p className="font-sans text-lg text-muted-foreground">
            {t('destinations.subtitle')}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="relative h-96 overflow-hidden group"
            >
              {/* Background Image */}
              <Image
                src={destination.image || "/placeholder.svg"}
                alt={destination.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-primary/60 transition-opacity duration-500 group-hover:bg-primary/70" />
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 text-white">
                <h3 className="font-serif text-3xl md:text-4xl font-normal mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                  {destination.title}
                </h3>
                
                <p className="font-sans text-sm mb-6 leading-relaxed opacity-90 max-w-md">
                  {destination.description}
                </p>
                
                <Button
                  asChild
                  variant="secondary"
                  className="w-fit bg-white text-primary hover:bg-white/90 font-sans font-medium transition-all duration-300 group-hover:shadow-lg"
                >
                  <Link href={destination.href}>
                    {t('destinations.explore')}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
