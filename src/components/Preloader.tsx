'use client'

import { useEffect, useRef, useState } from 'react'
import PixelCard from './PixelCard'
import s from './Preloader.module.css'

/** Fired by `SequenceHero` the moment frame 0 has decoded — the point at which
 *  the hero can paint something real rather than an empty canvas. A page with
 *  no sequence never fires it, which is why `window.load` is also a resolver. */
export const HERO_READY = 'hubble:hero-ready'

export const PRELOADER_LABEL = 'Connected intelligent energy'

/* The line must be visibly drawn before it opens, or a warm reload flashes a
   blue frame and reads as a glitch rather than an intro. */
const MIN_MS = 1400
/* How long the creep takes to reach its 99% ceiling. */
const DRAW_MS = 3400
/* 99% → 100%: the label and the trail fade off the line. */
const CLOSE_MS = 420
/* And it must never be the reason the site cannot be reached. Past this the
   preloader runs its close and open regardless of what has loaded. The CSS
   failsafe in the stylesheet sits further out again, for the case where none
   of this code runs at all. */
const MAX_MS = 6500

/* The draw stops here and waits. The last percent belongs to the real ready
   signal, so the line *completing* is always the truth and never a guess. */
const CEILING = 0.99

type Phase = 'drawing' | 'closing' | 'opening' | 'gone'

/**
 * The site's entry: a brand-blue field split by a white line that draws across
 * the page while the first view loads, then parts at that line to present the
 * site behind it.
 *
 * The line carries a trail of `PixelCard`'s pixels — the same effect as the
 * Stats and meter cards. The standing line sits **centred** above it and fades
 * in and out on its own clock: riding the leading edge was tried first and is
 * simply not readable, because the text is moving the whole time it is on
 * screen. At 99% the label and trail fade off; at 100% the halves part.
 *
 * Three things it has to get right, each of which is a way this pattern
 * normally breaks:
 *
 *  1. **It renders on the server.** Mounting it after hydration would show the
 *     site first and then cover it up, which is worse than no preloader. The
 *     markup is in the first paint and JS only ever removes it.
 *  2. **It cannot outlive its welcome.** Two independent ceilings — `MAX_MS`
 *     here, and a CSS animation in the stylesheet for when this component
 *     never runs. A preloader that hangs takes the whole site with it.
 *  3. **It holds the scroll.** Lenis is animating behind the panel otherwise,
 *     so a wheel flick during the preload lands the reader mid-page as the
 *     halves open.
 */
export default function Preloader() {
  const [phase, setPhase] = useState<Phase>('drawing')
  /* Draw progress, 0–1. Stepped rather than tied to a real byte count: the
     only honest total here is "frame 0 plus the fonts", which resolves in one
     jump and would leave the line at 0 and then 1. */
  const [p, setP] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    const mountedAt = performance.now()
    let raf = 0
    const timers: number[] = []
    const after = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    /* Creep toward the ceiling on an ease-out — most of the width early, then
       a slow approach, which is what reads as loading rather than as a timed
       animation that happens to take 3.4s. */
    const creep = () => {
      const t = Math.min(1, (performance.now() - mountedAt) / DRAW_MS)
      setP(CEILING * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(creep)
    }
    raf = requestAnimationFrame(creep)

    const open = () => {
      if (done.current) return
      done.current = true
      cancelAnimationFrame(raf)

      /* 99% → 100%. The line finishes its last percent while the label and
         the pixel trail fade, so the line is alone on the field when it
         opens. */
      setP(1)
      setPhase('closing')

      after(CLOSE_MS, () => {
        setPhase('opening')
        /* Unmount once the longest transition in the stylesheet has run
           (200ms delay + 980ms travel). Leaving the node in place would keep
           a fixed, full-screen layer over the site for ever. */
        after(1240, () => setPhase('gone'))
      })
    }

    /* Hold everything until the minimum has elapsed, so the line always gets
       to draw even when the page was already warm in the cache. */
    const openWhenAllowed = () => {
      const waited = performance.now() - mountedAt
      if (waited >= MIN_MS) open()
      else after(MIN_MS - waited, open)
    }

    /* Resolvers. Whichever arrives first wins — a page with a sequence hero
       answers on HERO_READY, any other route on `load`. */
    const onHeroReady = () => openWhenAllowed()
    window.addEventListener(HERO_READY, onHeroReady)

    const whenLoaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>(res => window.addEventListener('load', () => res(), { once: true }))

    /* Fonts matter here specifically: Sora and Montserrat swapping in behind
       the panel is the difference between the site arriving finished and
       arriving and then reflowing. The label itself is Montserrat, so it
       would otherwise re-letter mid-draw. */
    Promise.all([whenLoaded, document.fonts?.ready ?? Promise.resolve()])
      .then(() => {
        /* Give a sequence hero a moment to answer first — on the landing page
           `load` fires well before frame 0 has decoded, and opening on `load`
           alone would reveal an empty canvas. */
        after(400, () => { if (!done.current) openWhenAllowed() })
      })
      .catch(openWhenAllowed)

    after(MAX_MS, open)

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener(HERO_READY, onHeroReady)
    }
  }, [])

  /* Hold the scroll while the panel is up. Lenis owns the offset, so pausing
     it is what actually stops movement; the overflow lock covers reduced
     motion, where Lenis is never constructed.

     The poll is not defensive padding — it is required. This component is
     mounted above `SmoothScroll` so its markup is first in the body, so its
     effect also runs first, and `window.__hubbleLenis` does not exist yet at
     that point. A single read here silently no-ops and the page scrolls
     behind the panel. Verified: `isStopped` stayed false without it. */
  useEffect(() => {
    const getLenis = () =>
      (window as unknown as { __hubbleLenis?: { stop(): void; start(): void; isStopped?: boolean } })
        .__hubbleLenis

    if (phase === 'gone') {
      getLenis()?.start()
      document.documentElement.style.overflow = ''
      return
    }

    document.documentElement.style.overflow = 'hidden'

    let poll = 0
    const grab = () => {
      const lenis = getLenis()
      if (lenis) { lenis.stop(); clearInterval(poll) }
    }
    grab()
    poll = window.setInterval(grab, 50)

    return () => {
      clearInterval(poll)
      document.documentElement.style.overflow = ''
    }
  }, [phase])

  if (phase === 'gone') return null

  return (
    <div
      className={`${s.root} ${s[phase]}`}
      style={{ ['--p' as string]: p }}
      role="status"
      aria-live="polite"
      aria-label="Loading Hubble Energy"
    >
      <div className={`${s.half} ${s.top}`} />
      <div className={`${s.half} ${s.bottom}`} />

      <div className={s.rail}>
        {/* Clipped, not resized: PixelCard rebuilds its whole field from a
            ResizeObserver, so the canvas inside is a fixed width and only
            this wrapper moves. */}
        <div className={s.band} aria-hidden="true">
          <div className={s.bandInner}>
            <PixelCard variant="barBlue" active={phase === 'drawing'} className={s.pix} />
          </div>
        </div>
        <span className={s.line} />
        <span className={s.label}>{PRELOADER_LABEL}</span>
      </div>
    </div>
  )
}
