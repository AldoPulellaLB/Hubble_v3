'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Register GSAP plugins once. Safe to call from any client component. */
export function useGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    gsap.ticker.lagSmoothing(0)

    /* A trigger measures its start and end when it is created, which here is
       before the document has settled: the hero alone is 350lvh of frame
       sequence, the section renders arrive late, and the webfonts reflow every
       heading when they land. Anything below the fold ends up measured against
       a page that was far shorter than the final one, so it reads as already
       past its end and sits at progress 1 — the animation simply never plays.
       Re-measuring once the page has settled fixes all of them at once.

       ScrollTrigger does refresh itself on `load` and `DOMContentLoaded`, but
       both of those have usually fired before Next has hydrated, so by the time
       a trigger exists there is nothing left to re-measure it. These fire after
       hydration instead. */
    const refresh = () => ScrollTrigger.refresh()
    const settle = () => requestAnimationFrame(() => requestAnimationFrame(refresh))
    settle()
    setTimeout(refresh, 400)
    if (document.readyState !== 'complete') window.addEventListener('load', settle, { once: true })
    document.fonts?.ready.then(settle)

    registered = true
  }
  return { gsap, ScrollTrigger }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isFinePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(min-width: 992px) and (hover: hover) and (pointer: fine)').matches

export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Progress of an element through the viewport, cantor8-style.
 * `stretch` (>1) makes the full 0→1 travel take more scroll;
 * `slowPad` adds a virtual tail in the denominator — a strong slow-down lever.
 */
export function elementProgress(el: Element, stretch = 1, slowPad = 0, lead = 0) {
  const r = el.getBoundingClientRect()
  const h = r.height || (el as HTMLElement).clientHeight || 1
  const start = window.innerHeight
  const end = -(h * stretch + slowPad)
  return clamp((start - (r.top - lead)) / (start - end))
}

/**
 * Scroll progress for a scrubbed animation, **with guaranteed end states**.
 *
 * 0 while the element is still below the fold, 1 once it has fully passed
 * above it, and the mapped ramp in between. The end states are the whole
 * point: a handler that simply bails out when the element is off screen
 * leaves whatever partial value it last wrote, so an element flicked past in
 * one fast scroll freezes half-drawn and reads as a cut-off line. Every
 * scrubbed animation must be able to finish even if the reader never watched
 * it finish.
 *
 * `start`/`end` narrow the window the ramp occupies, so a drawing can complete
 * while it is still comfortably on screen rather than at the very last pixel.
 */
export function scrubProgress(el: Element, start = 0, end = 1) {
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  if (r.bottom <= 0) return 1
  if (r.top >= vh) return 0
  const raw = clamp((vh - r.top) / (vh + r.height))
  return clamp((raw - start) / (end - start))
}

/**
 * Progress between two elements arriving on screen: 0 as `from`'s top edge
 * reaches the bottom of the viewport, 1 as `to`'s does.
 *
 * Both move with the scroll, so the ramp is exactly the distance between the
 * two in the document. That ties an animation to things the reader can see
 * arrive rather than to a fraction of a box — and unlike `scrubProgress`, whose
 * span is `viewport + element` and so stretches with the window, this one spans
 * the same stretch of page on every screen.
 *
 * End states are guaranteed the same way `scrubProgress` guarantees them:
 * clamped past both ends, so an element flicked past in one fast scroll still
 * ends up finished rather than frozen part-drawn.
 */
export function betweenProgress(from: Element, to: Element, start = 0, end = 1) {
  const a = from.getBoundingClientRect().top
  const span = to.getBoundingClientRect().top - a
  if (span <= 0) return 1
  const raw = clamp((window.innerHeight - a) / span)
  return clamp((raw - start) / (end - start))
}

/**
 * How far an element has travelled *above* the fold: 0 while its top edge is
 * still at or below the top of the viewport, 1 once it has passed completely
 * out of sight upward.
 *
 * This is the ramp for anything pinned to the top of the document — a
 * masthead, which the reader can only ever scroll away from. `scrubProgress`
 * is the wrong shape there: its span is `viewport + element`, so a section
 * sitting at scroll 0 already reads about 0.5 and the whole lower half of its
 * ramp is unreachable. A scrubbed hero on that ramp therefore delivers half
 * the travel it has been given room for, and pays the full cost of the other
 * half in whatever the room cost (for `ImageHero`, a tighter crop). This one
 * spends all of it.
 *
 * End states are guaranteed the same way the other two guarantee them, so a
 * hero flicked past in one fast scroll still finishes its travel.
 */
export function exitProgress(el: Element) {
  const r = el.getBoundingClientRect()
  if (r.height <= 0) return 0
  return clamp(-r.top / r.height)
}

/**
 * Drives one scrubbed value off the shared ticker. Quantised so a sub-pixel
 * scroll doesn't write a custom property every frame, and only writes on a
 * real change.
 */
function onQuantised(read: () => number, fn: (p: number) => void, steps: number) {
  let last = -1
  return onFrame(() => {
    const q = Math.round(read() * steps) / steps
    if (q === last) return
    last = q
    fn(q)
  })
}

/** `scrubProgress` on the shared ticker. */
export function onScrub(
  el: Element,
  fn: (p: number) => void,
  start = 0,
  end = 1,
  steps = 200,
) {
  return onQuantised(() => scrubProgress(el, start, end), fn, steps)
}

/** `exitProgress` on the shared ticker. */
export function onExit(el: Element, fn: (p: number) => void, steps = 200) {
  return onQuantised(() => exitProgress(el), fn, steps)
}

/** A shared rAF loop — one ticker for every scroll-driven component. */
type Frame = () => void
const frames = new Set<Frame>()
let running = false

function tick() {
  frames.forEach((f) => f())
  if (frames.size) requestAnimationFrame(tick)
  else running = false
}

export function onFrame(fn: Frame) {
  frames.add(fn)
  if (!running) { running = true; requestAnimationFrame(tick) }
  return () => { frames.delete(fn) }
}
