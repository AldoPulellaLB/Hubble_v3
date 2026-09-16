'use client'

import { Fragment, useEffect, useMemo, useRef } from 'react'
import { prefersReducedMotion, useGsap } from '@/lib/motion'
import s from './ScrollRevealTitle.module.css'

/* Timing taken from the reference pen: every character owns 0.3 of the scrub
   and starts 0.02 after its neighbour, so the reveal travels along the line as
   a wipe rather than the whole line changing at once. */
const DURATION = 0.3
const STAGGER = 0.02

/* The window the wipe occupies — the element's top crossing 80% of the
   viewport to it crossing 20%, scrubbed against scroll the whole way. */
const START = 'top 80%'
const END = 'top 20%'

/** How much of the title is present before the wipe reaches it. The pen mixes
 *  a fixed grey against one known ground; these titles sit on four different
 *  ones, so this fades the glyph instead. Over a solid ground the two are the
 *  same operation — text at 22% over black *is* that colour mixed 22% with
 *  black — but this needs no knowledge of what is behind it, and it composites
 *  rather than repainting the glyph. */
const DIM = 0.22

type Props = {
  /** Plain text. Split on whitespace, which is preserved verbatim — except a
   *  newline, which becomes a hard break.
   *
   *  A comp that breaks a title unevenly cannot be matched any other way. The
   *  shared heading rule sets `text-wrap: balance`, which only ever distributes
   *  lines evenly, and a `max-width` tuned to force the break is a number that
   *  holds at one measure and one font size. `\n` in the content file says it
   *  outright.
   *
   *  Note it has to be a newline. U+2028 LINE SEPARATOR — which `content/*.json`
   *  used for this and which is documented as a forced break — is *not* honoured
   *  by Chrome: verified in the page, it stays on one line under `pre-line`,
   *  `pre-wrap` and with `balance` off. */
  children: string
}

/**
 * The per-character reveal used on every section title below the hero.
 *
 * Characters are split in the markup rather than by SplitType — the text is
 * already a React child, so there is nothing to parse at runtime — and each one
 * is driven by a single GSAP tween scrubbed against a ScrollTrigger. Words are
 * held together with `white-space: nowrap`: without it the browser treats every
 * character as its own inline box and will happily break a line mid-word.
 *
 * Nothing is configured per section. Because the glyphs fade rather than being
 * recoloured, the starting tone resolves against whatever ground each title
 * actually sits on, so the same component reads correctly on the light plates
 * and the black sections without either one declaring anything.
 */
export default function ScrollRevealTitle({ children }: Props) {
  const first = useRef<HTMLSpanElement>(null)
  /* Called here rather than inside the effect: it is hook-named, and all it
     does is register ScrollTrigger once per session. */
  const { gsap } = useGsap()

  /* Word spans hold the characters together; the spaces between them stay as
     plain text so the line wraps exactly as the unsplit string did. */
  const words = useMemo(() => children.split(/(\s+)/), [children])

  useEffect(() => {
    /* The ref sits on the first character, whose parent is its word wrapper —
       climb past those to reach the heading itself, which is both the element
       that owns every character and the one the trigger should measure. */
    let host = first.current?.parentElement ?? null
    while (host && host.classList.contains(s.word)) host = host.parentElement
    if (!host || prefersReducedMotion()) return

    const chars = host.querySelectorAll(`.${s.char}`)
    if (!chars.length) return

    const tween = gsap.fromTo(
      chars,
      { opacity: DIM },
      {
        opacity: 1,
        duration: DURATION,
        stagger: STAGGER,
        scrollTrigger: { trigger: host, start: START, end: END, scrub: true },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(chars, { clearProps: 'opacity' })
    }
  }, [children, gsap])

  let n = -1
  return (
    <>
      {words.map((part, w) => {
        /* Odd indices are the separator runs the split captured. A run holding
           a newline is a break; everything else is passed through verbatim so
           the line wraps exactly as the unsplit string did.

           The space before the `<br>` is not decorative. Accessible-name
           computation concatenates text nodes and does *not* insert whitespace
           for a `<br>`, so a bare one has a screen reader announce
           "built aroundyour business" — verified in the a11y tree. A trailing
           space at the end of a line collapses visually, so it costs nothing to
           render and it puts the word gap back into the name. */
        if (w % 2 === 1) return part.includes('\n') ? <Fragment key={w}> <br /></Fragment> : part
        if (part === '') return part
        return (
          <span key={w} className={s.word}>
            {[...part].map((ch, i) => {
              n++
              return (
                <span key={i} ref={n === 0 ? first : undefined} className={s.char}>
                  {ch}
                </span>
              )
            })}
          </span>
        )
      })}
    </>
  )
}
