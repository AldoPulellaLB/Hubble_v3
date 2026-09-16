'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import s from './Reveal.module.css'

type Props = {
  children: ReactNode
  as?: ElementType
  /** Seconds of delay before this element starts. */
  delay?: number
  /** 'up' rises into place, 'fade' holds still, 'mask' wipes a block of type,
   *  'none' animates nothing — the observer only, for a section that drives
   *  all of its own parts off `data-in`. */
  variant?: 'up' | 'fade' | 'mask' | 'none'
  className?: string
  /** Fraction of the element that must be visible before it fires. */
  amount?: number
  /** Overrides the observer's root margin. The default holds an element back
   *  until it is 8% clear of the fold, which is right when the element is what
   *  arrives. A full-screen section is different: the *section* arrives, and its
   *  content should present itself once it has — so the trigger has to be a
   *  position ("the section's top has reached the top of the screen"), not an
   *  area.
   *
   *  It cannot be done with `amount`. A high threshold is unreachable the moment
   *  the element is taller than the viewport — 80% of a 1100px section on a
   *  900px screen can never intersect — and the observer would then never fire
   *  at all, leaving the content invisible for good. A root margin is immune to
   *  the element's height. */
  rootMargin?: string
  /** Re-hides when it leaves the viewport, so the reveal plays both ways.
   *
   *  It also sets `data-out` to the edge the element left by — `"up"` when it
   *  has gone off the top, `"down"` when it is below the fold — so the exit can
   *  leave in the direction of travel instead of reversing the entrance. A
   *  reader scrolling down should see the content lift away, not sink back;
   *  without the attribute both directions share one rest state and one of them
   *  is always wrong. */
  repeat?: boolean
}

/* Holds an element back until it is 8% clear of the fold. Named because the
   fallback below has to know whether the caller has replaced it. */
const DEFAULT_MARGIN = '0px 0px -8% 0px'

/**
 * The single entrance primitive. One IntersectionObserver per element, a class
 * flip, and the animation itself in CSS — nothing on the scroll thread.
 *
 * The state is mirrored onto a `data-in` attribute as well as the class. The
 * class is hashed into this module, so a section's own stylesheet cannot select
 * it; `data-in` is what lets a descendant — the Services numeral, say — carry
 * an entrance of its own off the same observer instead of nesting a second one.
 */
export default function Reveal({
  children, as: Tag = 'div', delay = 0, variant = 'up',
  className = '', amount = 0.15, repeat = false,
  rootMargin = DEFAULT_MARGIN,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) { el.classList.add(s.in); el.dataset.in = ''; return }

    const io = new IntersectionObserver(
      ([entry]) => {
        /* `isIntersecting` alone is not enough. Any paint effect that empties
           the element's intersection rect — a clip, a zero-height collapse —
           pins the ratio at 0, and the element that is waiting to be revealed
           never reveals. Falling back to the raw rect makes the observer
           describe where the element *is* rather than what it currently
           paints.
           
           But the rescue measures against the *viewport*, not the root, so it
           silently overrides any custom `rootMargin` — anything on screen at all
           counts as arrived. A caller who has narrowed the root is expressing a
           deliberate position and does not want rescuing, so the fallback only
           applies on the default. (Found the hard way: a section whose trigger
           was narrowed to the top eighth of the screen revealed at 620px down
           regardless.) */
        const r = entry.boundingClientRect
        const rescue = rootMargin === DEFAULT_MARGIN
          && r.top < window.innerHeight && r.bottom > 0
        const onScreen = entry.isIntersecting || rescue
        if (onScreen) {
          el.classList.add(s.in)
          el.dataset.in = ''
          delete el.dataset.out
        } else if (repeat) {
          el.classList.remove(s.in)
          delete el.dataset.in
          /* Which edge it left by. `boundingClientRect` is viewport-relative
             whatever the root margin is, so a bottom at or above 0 means the
             element has gone off the top and everything else is still below. */
          el.dataset.out = r.bottom <= 0 ? 'up' : 'down'
        }
      },
      { threshold: amount, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [amount, repeat, rootMargin])

  return (
    <Tag
      ref={ref}
      className={`${s.r} ${s[variant]} ${className}`}
      style={{ ['--rd' as string]: `${delay}s` }}
    >
      {children}
    </Tag>
  )
}
