'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

/* Lenis exposes itself under this key from `SmoothScroll`. */
type Lenis = {
  scroll: number
  isStopped?: boolean
  scrollTo: (target: number | HTMLElement, opts?: Record<string, unknown>) => void
  on: (event: 'scroll', cb: () => void) => void
  off: (event: 'scroll', cb: () => void) => void
}
const getLenis = () => (window as unknown as { __hubbleLenis?: Lenis }).__hubbleLenis

/** How far short of the line an approach will still be completed. Generous:
 *  a wheel flick comes to rest wherever its momentum leaves it, and anywhere in
 *  the last half-screen was clearly an approach. */
const REACH_IN = 0.5
/** How far past the line an overshoot will still be pulled back. Half a screen,
 *  which for a section that *is* a screen tall is exactly "the top edge is the
 *  nearer of the two edges" — past half way the section's foot is closer and the
 *  reader is better described as leaving than as having overshot.
 *
 *  It can afford to be this generous for two reasons: a full-screen section has
 *  no good partial state (stopped 400px in you get its bottom half plus a slice
 *  of the next section), and `settledOn` below means the pull-back happens once
 *  per visit rather than on every rest. A smaller value was tried first and let
 *  a hard flick land 400px inside untouched, which is the bug this was. */
const REACH_BACK = 0.5
/** Quiet time after the last scroll event before a snap is considered. */
const IDLE_MS = 160
/** The snap's own travel. */
const DURATION = 0.8
/** Close enough to count as already aligned. */
const SETTLED = 2

/**
 * Soft snapping for full-screen sections.
 *
 * Any section carrying `data-full-vh` — the same attribute that gives it its
 * height, see globals.css — gets a gentle assist: come to rest near its top
 * edge and the page eases the rest of the way. Come to rest anywhere else and
 * nothing happens at all.
 *
 * ── Why this is not CSS scroll-snap ─────────────────────────────────────────
 * `scroll-snap-type: y proximity` does work alongside Lenis — tested in the
 * page, it completed a 120px approach and left a deliberate 380px rest alone,
 * so Lenis' per-frame writes and the browser's snapping do not fight. It was
 * still the wrong tool, for three reasons:
 *
 * 1. **It would trap the reader.** CSS re-evaluates on every rest, so a reader
 *    scrolling out of a section they were just placed on gets pulled straight
 *    back to it, over and over. There is no way to say "you have already been
 *    placed here once". `settledOn` below is that, and it is what lets the
 *    pull-back be generous enough to be useful.
 * 2. **One threshold, both directions.** What an entry snap needs is asymmetric
 *    — reach a long way to complete an approach, a shorter way to tidy an
 *    overshoot, and not at all when the reader is heading up and out. CSS has a
 *    single distance and no notion of which way anyone is going.
 * 3. **The proximity threshold is the browser's, not ours** — untunable, and
 *    inconsistent between engines.
 *
 * ── The rules ───────────────────────────────────────────────────────────────
 * - **Complete an approach, tidy an overshoot, never block an exit.** A wheel
 *   flick comes to rest wherever its momentum leaves it, so an entry snap has
 *   to be willing to pull the reader back a little — the first cut refused to,
 *   and the result was that entering a section never snapped at all. Leaving is
 *   still free: scrolling up away from a section, or far enough down through
 *   one, is never interfered with.
 * - **A pull-back happens once.** The section the reader was last placed on
 *   will not place them again until they are properly clear of it, so scrolling
 *   out of a freshly tidied section is not undone on every rest.
 * - **Only on rest.** Nothing is measured during a scroll; the handler does no
 *   layout work until `IDLE_MS` after the last scroll event, by which point
 *   Lenis has finished easing out.
 * - **Verified, not assumed.** A section is only snapped to if it is *actually*
 *   about a screen tall right now. That is what makes the attribute safe to
 *   leave on a section whose height a breakpoint has overridden — the phone's
 *   content-height band, for instance, is simply not a candidate.
 * - **Pointer only.** A soft snap fights momentum scrolling on touch, so coarse
 *   pointers are left alone entirely.
 * - **No Lenis, no snapping.** Under `prefers-reduced-motion` `SmoothScroll`
 *   never creates it, and an animated snap is exactly the kind of motion that
 *   preference is asking us not to make.
 */
export default function ScrollSnap() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const lenis = getLenis()
    if (!lenis) return

    let dir = 0
    let prev = lenis.scroll
    let timer: number | undefined
    let snapping = false
    let release: number | undefined
    /* The section the reader was last put on. While it is set, that section
       will not pull them back again — otherwise scrolling down out of a section
       that has just been tidied gets undone on every rest, which is the classic
       snap trap. It re-arms once they are genuinely clear of it. */
    let settledOn: HTMLElement | null = null

    const settle = () => {
      timer = undefined
      /* The drawer stops Lenis while it is open; nothing should move then. */
      if (snapping || lenis.isStopped) return

      const vh = window.innerHeight
      const reachIn = vh * REACH_IN
      const reachBack = vh * REACH_BACK
      let best: { el: HTMLElement; d: number } | null = null

      for (const node of document.querySelectorAll<HTMLElement>('[data-full-vh]')) {
        const r = node.getBoundingClientRect()
        /* Marked, but not a full screen at this breakpoint — not a candidate. */
        if (r.height < vh * 0.9) continue

        const d = r.top

        /* Re-arm: once the reader is properly clear of the section they were
           last placed on, it may place them again. */
        if (settledOn === node && Math.abs(d) > reachBack) settledOn = null

        if (Math.abs(d) <= SETTLED) return          // already resting on it

        /* Four quadrants of (which side of the line, which way they were
           going), and only three of them want anything to happen:

             below the line, going down  → approaching     → complete it
             above the line, going up    → approaching     → complete it
             above the line, going down  → overshot entry  → tidy it back
             below the line, going up    → leaving upward  → leave them alone

           The overshoot case is the one that matters most in practice and the
           one this originally got wrong: a wheel flick almost never stops
           exactly on the line, so refusing to pull back meant refusing to snap
           on entry at all. */
        const approaching = (dir > 0 && d > 0) || (dir < 0 && d < 0)
        const overshot = dir > 0 && d < 0

        if (approaching) {
          if (Math.abs(d) > reachIn) continue
        } else if (overshot) {
          if (-d > reachBack) continue              // deep in and heading out
          if (settledOn === node) continue          // just tidied — let them read
        } else {
          continue                                  // leaving upward, or not moving
        }

        if (!best || Math.abs(d) < Math.abs(best.d)) best = { el: node, d }
      }

      if (!best) return

      snapping = true
      settledOn = best.el
      lenis.scrollTo(best.el, {
        duration: DURATION,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        onComplete: () => { snapping = false },
      })
      /* `onComplete` does not fire if the reader interrupts the snap — Lenis
         cancels a programmatic scroll on input — so the flag gets a hard
         release as well. Without it one interrupted snap would disable
         snapping for the rest of the session. */
      if (release) window.clearTimeout(release)
      release = window.setTimeout(() => { snapping = false }, DURATION * 1000 + 200)
    }

    const onScroll = () => {
      const y = lenis.scroll
      if (y !== prev) { dir = y > prev ? 1 : -1; prev = y }
      if (snapping) return
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(settle, IDLE_MS)
    }

    lenis.on('scroll', onScroll)
    return () => {
      lenis.off('scroll', onScroll)
      if (timer) window.clearTimeout(timer)
      if (release) window.clearTimeout(release)
    }
  }, [])

  return null
}
