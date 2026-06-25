'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

const videos = [
  { src: '/images/videoactividades/manta-divers.mov', type: 'video/quicktime' },
  { src: '/images/videoactividades/sharks-divers.mp4', type: 'video/mp4' },
  { src: '/images/videoactividades/reef-sharks.mp4', type: 'video/mp4' },
]

export function Hero() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const { t } = useLanguage()

  // Rotate videos every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [])

  // Play current video, reset others
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return
      if (i === currentVideoIndex) {
        ref.play().catch(() => {})
      } else {
        ref.pause()
        ref.currentTime = 0
      }
    })
  }, [currentVideoIndex])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {videos.map((video, i) => (
          <video
            key={video.src}
            ref={(el) => { videoRefs.current[i] = el }}
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === currentVideoIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={video.src} type={video.type} />
          </video>
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-primary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end pb-16 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-left">
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-8 tracking-tight leading-none whitespace-nowrap">
            MORE THAN A JOURNEY
          </h2>
          
          <Button 
            asChild 
            size="default"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-6 py-5 font-semibold font-sans"
          >
            <Link href="/contacto?subject=booking">
              {t('hero.button')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
