'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('quetzal_visited')

    // Already visited: hide immediately, no animation
    if (hasVisited) {
      setVisible(false)
      return
    }

    // First visit: mark visited, show loading animation
    sessionStorage.setItem('quetzal_visited', 'true')

    // Lock scroll during loading
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const fadeTimer = setTimeout(() => setFadeOut(true), 1800)
    const removeTimer = setTimeout(() => {
      setVisible(false)
      // Restore scroll and force to top
      document.body.style.overflow = originalOverflow
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, 2500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
      document.body.style.overflow = originalOverflow
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={fadeOut ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
        style={{ transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="animate-pulse">
          <Image
            src="/isologo-completo.svg"
            alt="Quetzal Liveaboard"
            width={220}
            height={80}
            priority
            className="w-auto h-16 md:h-20"
          />
        </div>
      </div>
    </div>
  )
}
