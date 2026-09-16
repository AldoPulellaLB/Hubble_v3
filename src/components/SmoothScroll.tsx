'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useGsap, prefersReducedMotion } from '@/lib/motion'

/* Lenis ships its own `window.lenis` declaration, so we expose the instance
   under our own key for console debugging. */
type HubbleWindow = { __hubbleLenis?: Lenis }
const w = () => window as unknown as HubbleWindow

/**
 * Lenis + GSAP ticker wiring — the pairing used by cantor8.io.
 * autoRaf:false + driving Lenis from the GSAP ticker keeps scroll,
 * ScrollTrigger and every scrubbed animation on one clock.
 */
export default function SmoothScroll() {
  const { gsap, ScrollTrigger } = useGsap()

  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ autoRaf: false, anchors: true, allowNestedScroll: true })
    w().__hubbleLenis = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)

    const resync = () => { lenis.resize(); ScrollTrigger.refresh() }
    window.addEventListener('load', resync)
    // Pin positions shift once webfonts swap in — this is the fix.
    document.fonts?.ready.then(resync)

    return () => {
      gsap.ticker.remove(raf)
      window.removeEventListener('load', resync)
      lenis.destroy()
      delete w().__hubbleLenis
    }
  }, [gsap, ScrollTrigger])

  return null
}
