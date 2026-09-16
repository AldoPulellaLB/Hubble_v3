'use client'

import { useEffect, useRef } from 'react'
import { onFrame, prefersReducedMotion } from '@/lib/motion'
import s from './Marquee.module.css'

type Props = {
  text: string
  /** Base drift, in px per second, before scroll is added. */
  speed?: number
  /** How hard scrolling pushes the band along. */
  drag?: number
  repeat?: number
}

/**
 * The band between the services list and CloudLink.
 *
 * It drifts on its own so the page is never fully still, and scroll adds to
 * the drift — scrolling down speeds it up, scrolling up drives it back. That
 * coupling is the whole point: the band is a readout of the reader's own
 * movement, not a decoration running on a timer beside it.
 *
 * The strip is duplicated once and translated by exactly half its width, so
 * the wrap point is seamless at any offset.
 */
export default function Marquee({ text, speed = 34, drag = 0.55, repeat = 6 }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = track.current
    const wrapEl = host.current
    if (!el || !wrapEl) return
    if (prefersReducedMotion()) return

    let offset = 0
    let lastY = window.scrollY
    let lastT = performance.now()

    return onFrame(() => {
      const r = wrapEl.getBoundingClientRect()
      const now = performance.now()
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now

      const y = window.scrollY
      const dy = y - lastY
      lastY = y

      // Off screen: keep the clock but skip the write.
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return

      offset -= speed * dt + dy * drag
      const half = el.scrollWidth / 2
      if (half > 0) offset = ((offset % half) + half) % half - half

      el.style.transform = `translate3d(${offset}px, 0, 0)`
    })
  }, [speed, drag])

  const strip = Array.from({ length: repeat }, (_, i) => (
    <span key={i} className={s.item}>
      {text}
      <span className={s.dash} aria-hidden="true">–</span>
    </span>
  ))

  return (
    /* `data-nav-light` is what tells the nav bar to take its light palette
       over this band — the same flag `Strings` carries. The bar reads the
       list once on mount, so a light ground without it leaves a white logo
       on white. */
    <div ref={host} className={s.band} data-nav-light aria-hidden="true">
      {/* Two strands cross the band and hand over to CloudLink's circuit on the
          other side, so the band reads as something the current passes through
          rather than a hard stop between two sections.

          THE CONTRACT: a 1440-wide viewBox with `xMid` and a height short
          enough that width always drives the scale. Both conditions together
          make x map as `x * (width / 1440)` with no offset — so x=712 here and
          x=712 in CloudLink land on the same pixel at every viewport. Break
          either one (a taller viewBox, or `xMax`) and the two ends drift apart
          without anything looking wrong in the code. */}
      <svg className={s.tails} viewBox="0 0 1440 220" preserveAspectRatio="xMidYMin slice" fill="none">
        <path d="M712 0 V220" stroke="var(--blue-500)" strokeWidth="1.1" strokeOpacity=".55" />
        <path d="M728 0 V220" stroke="var(--blue-500)" strokeWidth="1.1" strokeOpacity=".35" />
      </svg>

      <div ref={track} className={s.track}>
        <div className={s.strip}>{strip}</div>
        <div className={s.strip}>{strip}</div>
      </div>
    </div>
  )
}
