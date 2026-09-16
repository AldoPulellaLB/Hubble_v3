'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { betweenProgress, onFrame, prefersReducedMotion, scrubProgress } from '@/lib/motion'
import s from './FlowLines.module.css'

export type Flow = {
  /** Path data — usually built with `route()`. */
  d: string
  /** Stroke colour. Defaults to the layer's `--flow-ink`. */
  ink?: string
  /** Base stroke opacity, before the pulse. */
  opacity?: number
  /** Seconds for one pulse to travel the whole route. */
  speed?: number
  /** Seconds of offset, so pulses on sibling routes don't march in step. */
  delay?: number
  /** Fraction of the route the pulse occupies. */
  pulse?: number
  width?: number
  /** Stroke width for the travelling pulse. Defaults to `width`, which is how
      every home-page route uses it. The solutions comps draw the pulse heavier
      than the trace it runs along — a 1px route carrying a 3px charge — so it
      can be set independently. */
  pulseWidth?: number
  /** Fraction of the window this route waits before it starts drawing, 0–1.
      Its own travel is compressed to match, so it still finishes with the
      others. Use it to stagger the lines of a pair. */
  drawDelay?: number
  /** Draws the route back-to-front. */
  reverse?: boolean
}

/** A ref, or a selector resolved at effect time. */
type Anchor = RefObject<Element | null> | string

type Props = {
  viewBox: string
  flows: Flow[]
  /** 'scrub' draws the routes against scroll position; 'enter' draws them
      once, on the way in. */
  mode?: 'scrub' | 'enter'
  /** How much of the travel the draw occupies, 0–1, read in `measure`'s units. */
  window?: [number, number]
  /** Two landmarks bracketing the draw: it starts as the first scrolls into
      view and finishes as the second does. Each is a ref or a CSS selector —
      a selector because the far end is often in a different component. Falls
      back to the svg's own box crossing the fold when either is missing. */
  anchors?: [Anchor, Anchor]
  /** Follow-through, 0–1: the share of the remaining distance the draw closes
      each frame. Lower lags further behind the scroll. 0 tracks it exactly. */
  lag?: number
  /** Holds every pulse back until the use site says otherwise, by multiplying
      its opacity by `--pulse-gate` (which the use site sets on this layer, or
      on any ancestor). Opt-in: without it nothing changes, and the transition
      that softens the gate's arrival is scoped to gated layers only — on an
      ungated route it would put a lag on a value the scroll is scrubbing. */
  pulseGate?: boolean
  className?: string
  preserveAspectRatio?: string
}

/**
 * The animated circuit traces.
 *
 * Two strokes per route on the same path data. The base trace is drawn by
 * scroll — `pathLength="1"` normalises every route so one dash offset drives
 * them all regardless of real length. Once a route is drawn, a short bright
 * dash runs along it on a CSS loop: the current, made visible.
 *
 * Both layers animate `stroke-dashoffset` only, which the compositor handles
 * without touching layout.
 */
export default function FlowLines({
  viewBox, flows, mode = 'scrub', window: win = [0.05, 0.75], lag = 0,
  anchors, pulseGate = false, className = '', preserveAspectRatio = 'xMidYMid slice',
}: Props) {
  const host = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    if (prefersReducedMotion()) { el.style.setProperty('--draw', '1'); return }

    if (mode === 'enter') {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { el.classList.add(s.drawn); io.disconnect() }
      }, { threshold: 0.12 })
      io.observe(el)
      return () => io.disconnect()
    }

    /* The scroll sets a target and, with `lag`, the draw closes a share of the
       gap each frame rather than pinning itself to the scroll — so the line is
       still running a beat after the reader stops, and reels back in the same
       way when they scroll up. Seeded at the true value so a route that is
       already passed doesn't draw itself in on load. Quantised so a sub-pixel
       scroll doesn't write a property every frame, and snapped once it is
       within half a step so it settles rather than chasing a rounding error. */
    const [a, b] = win
    const find = (x?: Anchor) =>
      typeof x === 'string' ? document.querySelector(x) : x?.current ?? null
    const from = find(anchors?.[0])
    const to = find(anchors?.[1])
    const at = from && to
      ? () => betweenProgress(from, to, a, b)
      : () => scrubProgress(el, a, b)

    let cur = at()
    let last = -1
    return onFrame(() => {
      const target = at()
      cur = !lag || Math.abs(target - cur) < 0.0025 ? target : cur + (target - cur) * lag
      const q = Math.round(cur * 200) / 200
      if (q === last) return
      last = q
      el.style.setProperty('--draw', String(q))
    })
  }, [mode, win, lag, anchors])

  return (
    <svg
      ref={host}
      className={`${s.svg} ${pulseGate ? s.gated : ''} ${className}`}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {flows.map((f, i) => {
        const style = {
          ['--w' as string]: String(f.width ?? 1.25),
          ['--pw' as string]: String(f.pulseWidth ?? f.width ?? 1.25),
          ['--o' as string]: String(f.opacity ?? 0.34),
          ['--sp' as string]: `${f.speed ?? 7}s`,
          ['--dl' as string]: `${f.delay ?? 0}s`,
          ['--pl' as string]: String(f.pulse ?? 0.13),
          ['--dd' as string]: String(f.drawDelay ?? 0),
          stroke: f.ink,
        }
        return (
          <g key={i} style={style} className={f.reverse ? s.rev : undefined}>
            <path className={s.trace} d={f.d} pathLength={1} />
            <path className={s.pulse} d={f.d} pathLength={1} />
          </g>
        )
      })}
    </svg>
  )
}
