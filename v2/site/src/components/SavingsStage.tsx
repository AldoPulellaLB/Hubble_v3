'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import SavingsCalculator from './sections/SavingsCalculator'
import ContactPanel from './ContactPanel'
import { prefersReducedMotion } from '@/lib/motion'
import s from './SavingsStage.module.css'

/* Every route to an overlay, wherever it appears — nav bar, mobile sheet,
   hero, footer, a card's CTA. Intercepted rather than wired button by button,
   so a new page gets both for free by using the href. */
const TRIGGERS = {
  savings: 'a[href="/calculate-your-savings"]',
  contact: 'a[href="/contact"]',
} as const

type Mode = keyof typeof TRIGGERS

/** Exit choreography's total length. See the module CSS. */
const EXIT_MS = 700

type Lenis = { stop: () => void; start: () => void; resize: () => void }
const lenis = () => (window as unknown as { __hubbleLenis?: Lenis }).__hubbleLenis

/**
 * The site as a card, and the calculator as the surface behind it.
 *
 * Opening does three things in one gesture: the page is clipped into a rounded
 * frame, recedes to 90%, and drops 90vh — leaving its own nav bar peeking off
 * the bottom edge, which is what sells "the site is a sheet lying on top of
 * something else" rather than "a modal appeared".
 *
 * The freeze is the load-bearing part. On open the shell becomes a fixed,
 * viewport-sized window and takes over the scroll offset it was showing, so the
 * card holds the exact view the reader was looking at instead of snapping to
 * the top of the document. `overflow: hidden` boxes still scroll
 * programmatically, which is why this is a `scrollTop` rather than a transform
 * on an inner wrapper.
 *
 * The nav bar travels in a layer of its own for the same reason. It is
 * `position: fixed`, and anything fixed inside the frozen shell is resolved
 * against the *scrolled* content — at a scroll of 8752 the bar landed 6842px
 * above the card instead of on its top edge. Outside the reel it stays pinned
 * to the viewport, and the layer carries the card's own scale and translate so
 * it arrives in the same place by a different route. Its origin is written as
 * `50vh` down from the top of a zero-height layer, which is the same point the
 * card scales about.
 */
export default function SavingsStage({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  /* One owner for the shell's transform. Two overlays both writing `scale`
     and `translate` on the same element would fight, so the stage holds which
     one is up and the CSS branches on it. */
  const [mode, setMode] = useState<Mode | null>(null)
  const [frozen, setFrozen] = useState(false)
  const shell = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const offset = useRef(0)
  const restoring = useRef(false)

  const show = useCallback((next: Mode) => {
    offset.current = window.scrollY
    setFrozen(true)
    setMode(next)
    lenis()?.stop()
  }, [])

  const hide = useCallback(() => setMode(null), [])

  /* Freezing and thawing both have to land before paint, or the page flashes at
     scroll 0 for a frame on the way in and on the way out. */
  useLayoutEffect(() => {
    if (frozen) {
      if (shell.current) shell.current.scrollTop = offset.current
      return
    }
    if (!restoring.current) return
    restoring.current = false
    window.scrollTo(0, offset.current)
    const l = lenis()
    l?.resize()
    l?.start()
  }, [frozen])

  /* Thaw on a timer rather than `transitionend`: the event never arrives under
     reduced motion, and the shell has to stay fixed for the whole exit or the
     page snaps back into flow mid-animation. */
  useEffect(() => {
    if (mode || !frozen) return
    const t = setTimeout(() => {
      offset.current = shell.current?.scrollTop ?? offset.current
      restoring.current = true
      setFrozen(false)
    }, prefersReducedMotion() ? 0 : EXIT_MS)
    return () => clearTimeout(t)
  }, [mode, frozen])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (!(e.target instanceof Element)) return
      for (const key of Object.keys(TRIGGERS) as Mode[]) {
        if (!e.target.closest(TRIGGERS[key])) continue
        e.preventDefault()
        e.stopPropagation()
        show(key)
        return
      }
    }
    // Capture, so it lands ahead of the router's own click handling.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [show])

  useEffect(() => {
    if (!mode) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, hide])

  const open = mode !== null

  return (
    <>
      {/* Both overlays stay mounted so their exit can animate; `data-open` is
          what shows one, and only the one whose mode is up is exposed to the
          reader — the other is `aria-hidden` and, being `visibility: hidden`,
          out of the tab order too. */}
      <div className={s.stage} data-open={mode === 'savings'} aria-hidden={mode !== 'savings'}>
        <SavingsCalculator onClose={hide} closeRef={mode === 'savings' ? closeBtn : undefined} />
      </div>

      <div className={s.dock} data-open={mode === 'contact'} aria-hidden={mode !== 'contact'}>
        <ContactPanel onClose={hide} closeRef={mode === 'contact' ? closeBtn : undefined} />
      </div>

      <div className={s.bar} data-open={open} data-mode={mode ?? undefined} inert={open || undefined}>
        {nav}
      </div>

      {/* Clicking the card puts it back — the same gesture as the close button,
          on the thing the reader is actually looking at. Only bound while it is
          off its ground, so the site behind stays an ordinary page the rest of
          the time. It carries no role: this is a dismissable surface like a
          backdrop, and the button in the corner is the labelled control. */}
      <div
        ref={shell}
        className={`${s.shell} ${frozen ? s.frozen : ''}`}
        data-open={open}
        data-mode={mode ?? undefined}
        onClick={open ? hide : undefined}
      >
        {/* `inert` sits on the reel rather than on the card, because it
            suppresses events on the element carrying it as well as on
            everything under it — on the card itself it swallowed the very click
            that is supposed to bring the site back. Here it still takes the
            whole page out of the tab order and away from the pointer, and
            `display: contents` keeps it out of the box tree so the card's
            layout and scroll are untouched. */}
        <div className={s.reel} inert={open || undefined}>
          {children}
        </div>
      </div>
    </>
  )
}
