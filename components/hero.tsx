'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

const videos = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14172259_3840_2160_60fps-HbKxQy5W1G5gumcCxIClgKkkHdaO3t.mp4',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6510683-hd_1920_1080_30fps-izcGPOeAjaruRXrOrjjH6bG8Ctb4hA.mp4'
]

export function Hero() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }, 9000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentRef = currentVideoIndex === 0 ? videoRef1 : videoRef2
    const nextRef = currentVideoIndex === 0 ? videoRef2 : videoRef1

    if (currentRef.current) {
      currentRef.current.play()
    }

    if (nextRef.current) {
      nextRef.current.currentTime = 0
    }
  }, [currentVideoIndex])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef1}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            currentVideoIndex === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={videos[0]} type="video/mp4" />
        </video>
        <video
          ref={videoRef2}
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            currentVideoIndex === 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={videos[1]} type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-primary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-balance font-serif text-white mb-6 tracking-tight leading-tight max-w-3xl">
            <span className="text-2xl md:text-3xl font-normal block">Quetzal</span>
            <span className="text-xl md:text-2xl font-light block">
              {t('hero.subtitle')}
            </span>
          </h2>
          
          <Button 
            asChild 
            size="default"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-6 py-5 font-semibold font-sans"
          >
            <Link href="/calendario">
              {t('hero.button')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
