'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

const galleryImages = [
  {
    id: 1,
    src: '/images/panoramicas/Manta el Boiler 1.webp',
    alt: 'Giant manta ray gliding through crystal-clear waters at El Boiler',
  },
  {
    id: 2,
    src: '/images/panoramicas/Puntas blancas 1.webp',
    alt: 'Whitetip reef sharks resting on the ocean floor',
  },
  {
    id: 3,
    src: '/images/actividades/Dingui Coco.webp',
    alt: 'Dinghy excursion to a pristine beach',
  },
  {
    id: 4,
    src: '/images/panoramicas/Pargos Roca.webp',
    alt: 'School of snappers at Roca Partida',
  },
  {
    id: 5,
    src: '/images/panoramicas/Clariones.webp',
    alt: 'Dramatic volcanic cliffs of Clarion Island',
  },
  {
    id: 6,
    src: '/images/actividades/Magda .webp',
    alt: 'Exploring remote beaches and coastlines',
  },
]

export function ScrollGallery() {
  const { t } = useLanguage()
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set())
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = imageRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleImages((prev) => new Set(prev).add(index))
            } else {
              setVisibleImages((prev) => {
                const newSet = new Set(prev)
                newSet.delete(index)
                return newSet
              })
            }
          })
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px',
        }
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [])

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
            {t('gallery.title')}
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => {
                imageRefs.current[index] = el
              }}
              className={`relative overflow-hidden rounded-lg transition-all duration-700 ease-out aspect-[4/3] lg:aspect-square ${
                visibleImages.has(index)
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-12 scale-95'
              }`}
              style={{
                transitionDelay: `${(index % 3) * 100}ms`,
              }}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
