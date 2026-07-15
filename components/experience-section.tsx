'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Fish, Waves, Compass, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

const experiences = [
  {
    video: '/images/videoactividades/divers-descending.mp4',
    icon: Fish,
    titleKey: 'experience.item1',
    href: '/contacto?subject=booking',
    span: 'md:col-span-8 md:row-span-2',
  },
  {
    image: '/images/panoramicas/Manta Clariones.webp',
    icon: Waves,
    titleKey: 'experience.item2',
    href: '/contacto?subject=booking',
    span: 'md:col-span-4',
  },
  {
    image: '/images/panoramicas/Delfin Kike.webp',
    icon: Compass,
    titleKey: 'experience.item3',
    href: '/contacto?subject=booking',
    span: 'md:col-span-4',
  },
]

export function ExperienceSection() {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLooping, setIsLooping] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let timeoutId: ReturnType<typeof setTimeout>

    video.play().catch(() => {})

    const loop = () => {
      setIsLooping(true)
      timeoutId = setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {})
        setIsLooping(false)
      }, 400)
    }

    video.addEventListener('ended', loop)
    return () => {
      video.removeEventListener('ended', loop)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="font-sans text-xs md:text-sm text-accent uppercase tracking-[0.2em] mb-3">
            {t('experience.subtitle')}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight max-w-3xl leading-tight">
            {t('experience.title')}
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 md:auto-rows-[320px]">
          {experiences.map((exp) => (
            <Link
              key={exp.titleKey}
              href={exp.href}
              className={`${exp.span} relative group overflow-hidden rounded-xl aspect-[4/3] md:aspect-auto`}
            >
              {/* Video or Image */}
              {exp.video ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isLooping ? 'opacity-0' : 'opacity-100'}`}
                >
                  <source src={exp.video} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={exp.image!}
                  alt={t(exp.titleKey)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3">
                  <exp.icon className="w-4 h-4 text-white" />
                </div>

                <h3 className="font-serif text-xl md:text-2xl font-normal text-white mb-3 tracking-tight">
                  {t(exp.titleKey)}
                </h3>

                {/* CTA — visible on hover */}
                <span className="inline-flex items-center gap-2 text-white/90 font-sans font-medium text-sm border-b border-white/30 group-hover:border-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
                  {t('experience.cta')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
