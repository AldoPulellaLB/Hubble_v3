'use client'

import { useEffect, useMemo, useRef } from 'react'
import { onScrub, prefersReducedMotion } from '@/lib/motion'
import s from './RadialFan.module.css'

/**
 * The invariant that keeps the fan from being cut off: a strand starts drawing
 * at its own threshold and takes DRAW_SPAN of the sweep to finish, so the last
 * strand to start must still land on 1.
 *
 *     STAGGER_MAX + DRAW_SPAN === 1
 *
 * DRAW_SPAN lives in the stylesheet and these two must be changed together —
 * the earlier values summed to 1.09, which left the outermost strands frozen
 * at ~74% no matter how far the reader scrolled.
 */
const STAGGER_MAX = 0.62

/** Lehmer PRNG — deterministic, so the server and client draw the same fan. */
function seeded(seed: number) {
  let t = seed % 2147483647
  if (t <= 0) t += 2147483646
  return () => { t = (t * 16807) % 2147483647; return (t - 1) / 2147483646 }
}

type Props = {
  /** Number of radiating lines. */
  count?: number
  /** Sweep, in degrees. 0° points right; the fan is drawn anticlockwise. */
  from?: number
  to?: number
  radius?: number
  /** How far each line bows off true, as a fraction of its length. */
  bow?: number
  seed?: number
  className?: string
  /** Faint concentric arcs behind the lines. */
  arcs?: number
  /** Small rings at the tip of some lines. */
  tips?: boolean
}

/**
 * The fan — the drawing that sits under the services list and inside the stat
 * cards, rebuilt as vector so it can be drawn rather than placed.
 *
 * Lines radiate from a single origin, each bowed by a quadratic control point
 * offset perpendicular to its own direction, so the fan reads as flow leaving
 * a source rather than a starburst. Every line carries its own threshold, and
 * a single scroll-driven `--draw` on the host sweeps them out from the origin
 * in sequence.
 */
export default function RadialFan({
  count = 132, from = 182, to = 358, radius = 520, bow = 0.16,
  seed = 7, className = '', arcs = 7, tips = true,
}: Props) {
  const host = useRef<SVGSVGElement>(null)

  const { lines, rings, dots } = useMemo(() => {
    const rnd = seeded(seed)
    /* The raw stagger runs 0…0.75 by construction; this maps it onto the
       budget that still leaves room for a full draw. */
    const stagger = (raw: number) => (raw / 0.75) * STAGGER_MAX
    const ox = 700, oy = 700          // origin, in viewBox units
    const lines: { d: string; t0: number; w: number; o: number }[] = []
    const dots: { cx: number; cy: number; r: number; t0: number }[] = []

    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0
      const deg = from + (to - from) * t
      const rad = (deg * Math.PI) / 180
      const len = radius * (0.82 + rnd() * 0.28)

      const ex = ox + Math.cos(rad) * len
      const ey = oy + Math.sin(rad) * len

      // Control point pushed off the chord's midpoint, perpendicular to it.
      const mx = (ox + ex) / 2
      const my = (oy + ey) / 2
      const k = (rnd() - 0.5) * 2 * bow * len
      const cx = mx + Math.cos(rad + Math.PI / 2) * k
      const cy = my + Math.sin(rad + Math.PI / 2) * k

      // Every ninth line is drawn heavier — the comp's emphasis strands.
      const strong = i % 9 === 4
      lines.push({
        d: `M ${ox} ${oy} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
        t0: stagger(t * 0.55 + rnd() * 0.2),
        w: strong ? 1.5 : 0.7,
        o: strong ? 0.85 : 0.3 + rnd() * 0.28,
      })

      if (tips && i % 3 === 0) {
        dots.push({ cx: ex, cy: ey, r: rnd() < 0.4 ? 2.6 : 1.4, t0: stagger(t * 0.55 + 0.22) })
      }
    }

    const rings = Array.from({ length: arcs }, (_, i) => {
      const rr = radius * (0.32 + (i / Math.max(1, arcs - 1)) * 0.7)
      const a0 = (from * Math.PI) / 180
      const a1 = (to * Math.PI) / 180
      const x0 = ox + Math.cos(a0) * rr, y0 = oy + Math.sin(a0) * rr
      const x1 = ox + Math.cos(a1) * rr, y1 = oy + Math.sin(a1) * rr
      const large = Math.abs(to - from) > 180 ? 1 : 0
      return {
        d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rr.toFixed(1)} ${rr.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`,
        t0: 0.1 + i * 0.05,
      }
    })

    return { lines, rings, dots }
  }, [count, from, to, radius, bow, seed, arcs, tips])

  useEffect(() => {
    const el = host.current
    if (!el) return
    if (prefersReducedMotion()) { el.style.setProperty('--draw', '1'); return }

    return onScrub(el, (q) => el.style.setProperty('--draw', String(q)), 0.08, 0.7, 150)
  }, [])

  return (
    <svg
      ref={host}
      className={`${s.fan} ${className}`}
      viewBox="0 0 1400 720"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className={s.rings}>
        {rings.map((a, i) => (
          <path key={i} className={s.arc} d={a.d} pathLength={1} style={{ ['--t0' as string]: String(a.t0) }} />
        ))}
      </g>
      <g className={s.strands}>
        {lines.map((l, i) => (
          <path
            key={i}
            className={s.line}
            d={l.d}
            pathLength={1}
            style={{ ['--t0' as string]: String(l.t0), ['--w' as string]: String(l.w), ['--o' as string]: String(l.o) }}
          />
        ))}
      </g>
      <g className={s.tips}>
        {dots.map((p, i) => (
          <circle
            key={i}
            className={s.dot}
            cx={p.cx.toFixed(1)} cy={p.cy.toFixed(1)} r={p.r}
            style={{ ['--t0' as string]: String(p.t0) }}
          />
        ))}
      </g>
    </svg>
  )
}
