'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

const marineImages = [
  { src: '/images/panoramicas/Manta Clariones.webp', alt: 'Giant manta ray in crystal-clear waters', span: 'col-span-2 row-span-2' },
  { src: '/images/panoramicas/Delfin Kike.webp', alt: 'Dolphins swimming alongside the Quetzal', span: '' },
  { src: '/images/panoramicas/Puntas blancas .webp', alt: 'Whitetip reef sharks in Socorro', span: '' },
]

export function MarineLifeSection() {
  const { t } = useLanguage()
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

          {/* Right — Marine Life Gallery */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 md:auto-rows-[200px]">
              {marineImages.map((img) => (
                <div
                  key={img.src}
                  className={`${img.span} relative overflow-hidden rounded-lg group aspect-[4/3] md:aspect-auto`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
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
