'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function MarineLifeSection() {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground leading-tight">
              {t('marine.title')}
            </h2>
            
            <div className="space-y-4">
              <p className="font-sans text-lg text-foreground">
                {t('marine.description')}
              </p>
            </div>

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

          {/* Right Video */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg shadow-2xl aspect-video">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14172259_3840_2160_60fps-HbKxQy5W1G5gumcCxIClgKkkHdaO3t.mp4" type="video/mp4" />
              </video>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-lg -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
