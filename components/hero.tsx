'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/language-context'

const videos = [
  { src: '/images/videoactividades/manta-divers.mp4', type: 'video/mp4' },
  { src: '/images/videoactividades/sharks-divers.mp4', type: 'video/mp4' },
  { src: '/images/videoactividades/reef-sharks.mp4', type: 'video/mp4' },
]

export function Hero() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const { t } = useLanguage()

  // Stable ref setter — avoids re-running on every render
  const setVideoRef = useCallback((el: HTMLVideoElement | null, i: number) => {
    videoRefs.current[i] = el
    // Preload and loop: ensures video is ready and never sits static
    if (el) {
      el.preload = 'auto'
      el.loop = true
    }
  }, [])

  // Rotate videos every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [])

  // Play current video, pause others (no time reset — loop handles it)
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return
      if (i === currentVideoIndex) {
        // Only call play if paused — prevents unnecessary play() on already-playing video
        if (ref.paused) ref.play().catch(() => {})
      } else {
        ref.pause()
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
            ref={(el) => setVideoRef(el, i)}
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
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-4 tracking-tight leading-none whitespace-nowrap">
            MORE THAN A JOURNEY
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl">
            {t('hero.tagline')}
          </p>
        </div>
      </div>
    </section>
  )
}
