'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Lenis from '@studio-freight/lenis'

interface PerspectiveTransitionProps {
  first: ReactNode
  second: ReactNode
}

export function PerspectiveTransition({ first, second }: PerspectiveTransitionProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Lenis smooth scroll
  useEffect(() => {
    if (isMobile) return

    const lenis = new Lenis()

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [isMobile])

  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  const firstScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const firstRotate = useTransform(scrollYProgress, [0, 0.5], [0, -5])

  const secondScale = useTransform(scrollYProgress, [0.4, 0.9], [0.8, 1])
  const secondRotate = useTransform(scrollYProgress, [0.4, 0.9], [5, 0])

  // Mobile: render sections normally without transforms
  if (isMobile) {
    return (
      <>
        <div className="h-screen">{first}</div>
        {second}
      </>
    )
  }

  return (
    <div ref={container} className="relative" style={{ height: '250vh' }}>
      {/* First section — sticky, shrinks and tilts away */}
      <motion.div
        style={{ scale: firstScale, rotate: firstRotate }}
        className="sticky top-0 h-screen origin-top z-10"
      >
        {first}
      </motion.div>

      {/* Spacer to push second section below the sticky first */}
      <div className="h-screen" />

      {/* Second section — scales up from behind */}
      <motion.div
        style={{ scale: secondScale, rotate: secondRotate }}
        className="origin-bottom"
      >
        {second}
      </motion.div>
    </div>
  )
}
