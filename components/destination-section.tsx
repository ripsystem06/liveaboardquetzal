'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function DestinationSection() {
  const { t } = useLanguage()
  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/Exterior/quetzal-costado.webp"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-primary/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-sm md:text-base text-white mb-2 tracking-wide uppercase">
              {t('destination.days')}
            </p>
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-8 tracking-tight">
              {t('destination.title')}
            </h2>
            
            <p className="font-sans text-lg md:text-xl text-white mb-8">
              {t('destination.year')} <span className="font-semibold">{t('destination.price')}</span>
            </p>
            
            <Button 
              asChild 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 py-6 font-semibold font-sans"
            >
              <Link href="/contacto">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t('destination.cta')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
