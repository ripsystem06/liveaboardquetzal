'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollDirection(threshold = 50) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const [isPastThreshold, setIsPastThreshold] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY
      const diff = scrollY - lastScrollY.current

      setIsPastThreshold(scrollY > threshold)

      if (Math.abs(diff) < 5) {
        ticking.current = false
        return
      }

      if (scrollY > threshold) {
        setDirection(diff > 0 ? 'down' : 'up')
      } else {
        setDirection(null)
      }

      lastScrollY.current = scrollY
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { direction, isPastThreshold }
}
