'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

const galleryImages = [
  {
    id: 1,
    src: '/gallery-1.jpg',
    alt: 'Giant manta ray swimming underwater',
  },
  {
    id: 2,
    src: '/gallery-2.jpg',
    alt: 'School of hammerhead sharks',
  },
  {
    id: 3,
    src: '/gallery-3.jpg',
    alt: 'Humpback whale underwater',
  },
  {
    id: 4,
    src: '/gallery-4.jpg',
    alt: 'Diver exploring coral reef',
  },
  {
    id: 5,
    src: '/gallery-5.jpg',
    alt: 'Dolphins jumping at sunset',
  },
  {
    id: 6,
    src: '/gallery-6.jpg',
    alt: 'Sea lion swimming underwater',
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
              className={`relative overflow-hidden rounded-lg aspect-square transition-all duration-700 ease-out ${
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
