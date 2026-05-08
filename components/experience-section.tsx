'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

export function ExperienceSection() {
  const { t } = useLanguage()
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">
            {t('experience.title')}
          </h2>
          <p className="font-sans text-lg text-muted-foreground">
            {t('experience.subtitle')}
          </p>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Captain at helm */}
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-lg group h-80 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ViCy7qDO26tuJM5IULISWYpSY7CuKe.png"
                alt="Professional crew at the helm"
                width={600}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="font-sans text-sm text-muted-foreground text-center">
              {t('experience.item1')}
            </p>
          </div>

          {/* Quetzal vessel */}
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-lg group h-80 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-D7hEhqk5Qp6P4NrzyUfXZefge69pOW.png"
                alt="Quetzal liveaboard vessel"
                width={600}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="font-sans text-sm text-muted-foreground text-center">
              {t('experience.item2')}
            </p>
          </div>

          {/* Underwater diving */}
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-lg group h-80 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-FlR3Xo3TTMZYYUcTcYBE3H0MZnWKr6.jpeg"
                alt="Diver swimming with dolphin underwater"
                width={600}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="font-sans text-sm text-muted-foreground text-center">
              {t('experience.item3')}
            </p>
          </div>

          {/* Crew at dock */}
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-lg group h-80 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w8vpYrdmfPKyui4jqy1OxR8YUohO5f.png"
                alt="Crew preparing the vessel"
                width={600}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="font-sans text-sm text-muted-foreground text-center">
              {t('experience.item4')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
