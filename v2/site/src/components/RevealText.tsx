'use client'

import { useMemo } from 'react'
import { clamp } from '@/lib/motion'
import s from './RevealText.module.css'

/** How dark an unrevealed word sits. Not 0: the line has to read as one
 *  sentence throughout, with the reveal passing along it, rather than words
 *  appearing out of nothing. */
const DIM = 0.16

/** The share of the driver the reveal uses. Held under 1 so the line finishes
 *  lit and stays lit, instead of completing exactly as it leaves. */
const END = 0.52

/** Each word brightens over this many word-slots, so neighbours overlap and
 *  the line lifts as a wave rather than a row of switches. */
const OVERLAP = 2.4

/** Per-word offset in mount mode. */
const STEP_MS = 85

type Props = {
  /** Plain text. Split on whitespace, which is preserved verbatim. */
  children: string
  /** 0–1. Drives the reveal in `scroll` mode; ignored in `mount`. */
  progress?: number
  /** `scroll` scrubs the line against `progress`; `mount` plays it once as a
   *  staggered entrance, for a line that is already on screen on arrival and
   *  so has no scroll behind it yet. */
  mode?: 'scroll' | 'mount'
}

/**
 * Word-by-word reveal, driven by a progress value rather than by the element's
 * own position in the viewport.
 *
 * The usual implementation of this effect reads the element's bounding rect and
 * maps it against the viewport. That cannot work inside a pinned section: while
 * the pin holds, the text is stationary and the rect never changes, so the
 * reveal would freeze at whatever value it had when the pin engaged. Passing
 * the driver in means the caller can hand it scroll progress, sequence
 * progress, or anything else that actually moves.
 *
 * Renders a fragment of spans, not a wrapper — so it drops inside whatever
 * heading element the caller already has and inherits its type styling.
 */
export default function RevealText({ children, progress = 0, mode = 'scroll' }: Props) {
  /* Whitespace is captured rather than dropped, so the original spacing and
     any line breaks survive; only the non-space runs become spans. */
  const parts = useMemo(() => children.split(/(\s+)/), [children])
  const count = useMemo(() => parts.filter((p, i) => i % 2 === 0 && p !== '').length, [parts])

  const per = 1 / Math.max(count, 1)
  const dur = Math.min(1, per * OVERLAP)
  /* The timeline is longer than 1 slot per word, because the last word's fade
     has to finish inside it — normalising by this is what makes progress 1
     land exactly on the last word fully lit. */
  const span = (Math.max(count, 1) - 1) * per + dur
  const t = clamp(progress / END)

  let w = -1
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1 || part === '') return part
        w++
        if (mode === 'mount') {
          return (
            <span key={i} className={`${s.word} ${s.mount}`} style={{ animationDelay: `${w * STEP_MS}ms` }}>
              {part}
            </span>
          )
        }
        const lit = clamp((t * span - w * per) / dur)
        return (
          <span key={i} className={s.word} style={{ opacity: DIM + (1 - DIM) * lit }}>
            {part}
          </span>
        )
      })}
    </>
  )
}
