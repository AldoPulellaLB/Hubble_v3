'use client'

import { useEffect, useRef } from 'react'
import { clamp, onFrame, prefersReducedMotion } from '@/lib/motion'
import s from './PixelDissolve.module.css'

/* A 5px cell, six rows deep — a 30px band at every width. The cell is a fixed
   length rather than a fraction of the frame: at this size a proportional cell
   would drop the whole band to 21px on a 1024 screen and blow it out to 40px
   on a 2560, and the dissolve would read as a different effect on each.
   Columns are counted off the viewport instead, and the last one is allowed to
   run past the right edge, where `overflow: hidden` takes it. */
const CELL = 5
const ROWS = 24

/* Where inside the band's pass across the viewport the dissolve actually runs.
   0 is the moment its top edge reaches the bottom of the screen, 1 the moment
   its bottom edge clears the top. Held off both ends so the band arrives
   already whole and leaves already settled, rather than spending its first and
   last pixels hard against the screen edge where they are least likely to be
   watched. Widening the gap compresses the dissolve into less scroll, so it
   reads faster; START must stay below END. */
const START = 0.15
const END = 0.85

/** Lehmer PRNG — one stable pattern per seed, identical on server and client. */
function seeded(seed: number) {
  let t = seed % 2147483647
  if (t <= 0) t += 2147483646
  return () => { t = (t * 16807) % 2147483647; return (t - 1) / 2147483646 }
}

type Props = {
  /** The surface above the band. */
  from?: string
  /** The surface below it. */
  to?: string
  /** The colour a few cells hold on the way across. */
  accent?: string
  /** Which edge the dissolve sweeps from. */
  direction?: 'down' | 'up'
  /** Pull the band back over the section above and start its cells clear, so
      the dissolve consumes that section's last rows instead of following it. */
  overlap?: boolean
  seed?: number
  className?: string
}

/**
 * The scroll-scrubbed transition between two zones.
 *
 * Every cell owns two thresholds — one where it leaves `from`, one where it
 * settles on `to` — swept along `direction` and roughened by the PRNG so the
 * edge is ragged rather than a wipe. Roughly one cell in eleven holds the
 * accent in between, which is what stops the band reading as a gradient: the
 * charge visibly passes through rather than staying behind.
 *
 * It is scrubbed, not triggered. Scrolling back up re-forms the band cell by
 * cell in reverse, so the transition is a thing you can move through in both
 * directions rather than a one-shot that has already happened.
 *
 * Pass `from`/`to` as the zones' own custom properties, never literals, so the
 * band can't drift out of step with the sections it joins.
 */
export default function PixelDissolve({
  from = 'var(--black)',
  to = 'var(--white)',
  accent = 'var(--cyan-600)',
  direction = 'down',
  overlap = false,
  seed = 1,
  className = '',
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapEl = wrap.current
    const gridEl = grid.current
    if (!wrapEl || !gridEl) return

    type Cell = { el: HTMLDivElement; lit: number; set: number; accent: boolean; state: number }
    let cells: Cell[] = []
    let cols = 0

    const build = () => {
      const next = Math.ceil(window.innerWidth / CELL)
      /* Rebuilt only when the row is actually short, or far longer than it
         needs to be. A 5px cell changes the count on every fifth pixel of a
         window drag, and each rebuild throws away ~1700 nodes and reshuffles
         the pattern; surplus columns simply run off under `overflow: hidden`. */
      if (next <= cols && next > cols - 64) return
      cols = next
      gridEl.style.gridTemplateColumns = `repeat(${cols}, ${CELL}px)`
      gridEl.replaceChildren()

      const rnd = seeded(100 + seed)
      cells = []

      for (let r = 0; r < ROWS; r++) {
        const rowT = ROWS > 1 ? r / (ROWS - 1) : 0
        const sweep = direction === 'up' ? 1 - rowT : rowT

        for (let c = 0; c < cols; c++) {
          const el = document.createElement('div')
          el.className = s.px

          /* 0.62 of the threshold comes from the row, 0.38 from noise: enough
             order that the band clearly travels, enough noise that no two
             columns clear together. */
          const lit = clamp(sweep * 0.62 + rnd() * 0.38)
          const isAccent = rnd() < 0.09
          const set = isAccent ? Math.min(1, lit + 0.06 + rnd() * 0.08) : lit

          cells.push({ el, lit, set, accent: isAccent, state: -1 })
          gridEl.appendChild(el)
        }
      }
    }

    const render = (p: number) => {
      for (const cell of cells) {
        const next = p >= cell.set ? 2 : p >= cell.lit ? 1 : 0
        if (next === cell.state) continue
        cell.state = next
        cell.el.dataset.s = String(next)
      }
    }

    build()

    if (prefersReducedMotion()) { render(1); return }

    const onResize = () => { build(); render(-1) }
    window.addEventListener('resize', onResize, { passive: true })

    const stop = onFrame(() => {
      const r = wrapEl.getBoundingClientRect()
      const vh = window.innerHeight
      if (r.bottom < -20) { render(1); return }
      if (r.top > vh + 20) { render(0); return }

      /* 0 as the band's top edge reaches the bottom of the viewport, 1 as its
         bottom edge clears the top — the full travel during which the band is
         on screen — then remapped so the dissolve occupies only START..END of
         it and holds its end states either side. */
      const raw = (vh - r.top) / (vh + r.height)
      render(clamp((raw - START) / (END - START)))
    })

    return () => { stop(); window.removeEventListener('resize', onResize) }
  }, [direction, seed])

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className={`${s.wrap} ${overlap ? s.overlap : ''} ${className}`}
      style={{
        ['--px-from' as string]: overlap ? 'transparent' : from,
        ['--px-to' as string]: to,
        ['--px-accent' as string]: accent,
      }}
    >
      <div ref={grid} className={s.grid} />
    </div>
  )
}
