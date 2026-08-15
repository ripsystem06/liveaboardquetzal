'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

const marineImages = [
  { src: '/images/panoramicas/Manta Clariones.webp', alt: 'Giant manta ray in crystal-clear waters', span: 'md:col-span-2 md:row-span-2', sizes: '(max-width: 1024px) 100vw, 50vw' },
  { src: '/images/panoramicas/Puntas blancas .webp', alt: 'Whitetip reef sharks in Socorro', span: '', sizes: '(max-width: 1024px) 50vw, 25vw' },
  { src: '/images/panoramicas/Delfin Kike.webp', alt: 'Dolphins swimming alongside the Quetzal', span: '', sizes: '(max-width: 1024px) 50vw, 25vw' },
  { src: '/images/panoramicas/Manta el Boiler 1.webp', alt: 'Giant manta ray gliding through crystal-clear waters at El Boiler', span: '', sizes: '(max-width: 1024px) 50vw, 25vw' },
  { src: '/images/panoramicas/Puntas blancas 1.webp', alt: 'Whitetip reef sharks resting on the ocean floor', span: '', sizes: '(max-width: 1024px) 50vw, 25vw' },
  { src: '/images/panoramicas/Puntas blancas 4.webp', alt: 'Whitetip reef sharks in crystal-clear Socorro waters', span: '', sizes: '(max-width: 1024px) 50vw, 25vw' },
  { src: '/images/panoramicas/Puntas blancas Balcón.webp', alt: 'Whitetip reef sharks from the balcony view', span: '', sizes: '(max-width: 1024px) 50vw, 25vw' },
]

export function MarineLifeSection() {
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
            }
          })
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -50px 0px',
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground leading-tight">
              {t('marine.title')}
            </h2>
            
            <p className="font-sans text-lg text-muted-foreground leading-relaxed">
              {t('marine.description')}
            </p>

            <Button 
              asChild 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold group"
            >
              <Link href="/contacto?subject=booking" className="flex items-center gap-2">
                {t('marine.cta')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Right — Marine Life Gallery with fade-in animation */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {marineImages.map((img, index) => (
                <div
                  key={img.src}
                  ref={(el) => {
                    imageRefs.current[index] = el
                  }}
                  className={`${img.span} relative overflow-hidden rounded-lg group transition-all duration-700 ease-out aspect-[4/3] ${
                    visibleImages.has(index)
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-12 scale-95'
                  }`}
                  style={{
                    transitionDelay: `${(index % 4) * 100}ms`,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={img.sizes}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-lg -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
