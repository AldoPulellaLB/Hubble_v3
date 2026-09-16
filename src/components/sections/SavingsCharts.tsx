'use client'

import { useId, useRef, useState } from 'react'
import s from './SavingsCharts.module.css'

/* ══ Shared ═══════════════════════════════════════════════════════════════════
   Three primitives, each answering a question one of the calculator's steps
   asks and none of them answered before: when is power expensive, what does my
   day look like, and where does the saving come from.

   All three are hand-drawn SVG or CSS grid rather than a charting library. The
   calculator never scrolls and every step sizes itself to a fixed budget, so a
   chart has to be told its height by the layout and reflow inside it — which is
   what `viewBox` plus `preserveAspectRatio="none"` gives for free, and what a
   library's own sizing logic would fight. */

/** Reads a value out of a series without a pointer, for keyboard users. */
function useCursor(len: number) {
  const [at, setAt] = useState<number | null>(null)
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setAt(p => {
        const next = (p ?? -1) + (e.key === 'ArrowRight' ? 1 : -1)
        return Math.max(0, Math.min(len - 1, next))
      })
    } else if (e.key === 'Escape') setAt(null)
  }
  return { at, setAt, onKey }
}

const hh = (h: number) => String(h).padStart(2, '0') + ':00'

/* ══ 1. The rate heatmap ══════════════════════════════════════════════════════
   Two rows of 24 — winter and summer — shaded by what a kilowatt-hour costs in
   that hour. 48 cells, which is past the point where a heatmap beats a bar
   chart, and it puts the whole tariff on one plate: the two small rate tables
   it replaces made the reader hold six numbers in their head to see the shape
   this draws directly.

   Colour alone would fail: the legend carries the scale in rands, every cell
   states its own value on hover and focus, and the band name is in each cell's
   label — so the pattern is readable without seeing colour at all. */
type Bands = { peak: number; std: number; off: number }

export function RateHeatmap({
  winter, summer, periodOf, caption,
}: {
  winter: Bands
  summer: Bands
  periodOf: (h: number) => keyof Bands
  caption: string
}) {
  const rows = [
    { name: 'Winter', rates: winter },
    { name: 'Summer', rates: summer },
  ]
  const all = rows.flatMap(r => [r.rates.peak, r.rates.std, r.rates.off])
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  /* Five steps rather than a continuous ramp: a reader comparing two cells can
     tell one step from the next, where a smooth gradient reads as one wash. */
  const step = (v: number) => Math.round(((v - lo) / (hi - lo || 1)) * 4)
  const [tip, setTip] = useState<{ row: number; h: number } | null>(null)

  return (
    <figure className={s.heat}>
      <figcaption className={s.cap}>{caption}</figcaption>

      <div className={s.heatGrid}>
        {rows.map((r, ri) => (
          <div key={r.name} className={s.heatRow}>
            <span className={s.heatRowLab}>{r.name}</span>
            <div className={s.heatCells}>
              {Array.from({ length: 24 }, (_, h) => {
                const band = periodOf(h)
                const v = r.rates[band]
                const on = tip?.row === ri && tip?.h === h
                return (
                  <button
                    key={h}
                    type="button"
                    className={s.heatCell}
                    data-step={step(v)}
                    data-on={on ? '' : undefined}
                    onMouseEnter={() => setTip({ row: ri, h })}
                    onMouseLeave={() => setTip(null)}
                    onFocus={() => setTip({ row: ri, h })}
                    onBlur={() => setTip(null)}
                    aria-label={`${r.name}, ${hh(h)}, ${band} rate, R ${v.toFixed(2)} per kilowatt-hour`}
                  />
                )
              })}
            </div>
          </div>
        ))}

        <div className={s.heatAxis} aria-hidden="true">
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{String(h).padStart(2, '0')}</span>)}
        </div>
      </div>

      {/* The read-out sits in the flow rather than floating over a cell: the
          grid is only ~14px tall a row, and a tooltip covering its neighbours
          would hide the comparison the reader is making. */}
      <p className={s.heatRead} role="status">
        {tip
          ? <><b>R {rows[tip.row].rates[periodOf(tip.h)].toFixed(2)}</b> / kWh · {rows[tip.row].name.toLowerCase()} {hh(tip.h)} · {periodOf(tip.h)}</>
          : <span className={s.heatHint}>Hover an hour for its rate</span>}
      </p>

      <div className={s.heatKey}>
        <span>R {lo.toFixed(2)}</span>
        <span className={s.heatKeyRamp} aria-hidden="true">
          {[0, 1, 2, 3, 4].map(i => <i key={i} data-step={i} />)}
        </span>
        <span>R {hi.toFixed(2)}</span>
      </div>
    </figure>
  )
}

/* ══ 2. The day curve ═════════════════════════════════════════════════════════
   The 24 bars this replaces were 4px wide with a 2px gap, which at the sizes
   the panel allows read as a texture rather than a shape. An area gives the
   same data a silhouette, and the peak window becomes a band behind it rather
   than five bars in a different colour — the load and the expensive hours stop
   competing for the same channel. */
export function DayArea({
  values, caption, unit, isPeakHour, tone = 'load', total,
}: {
  values: number[]
  caption: string
  unit: string
  isPeakHour?: (h: number) => boolean
  tone?: 'load' | 'solar'
  total?: string
}) {
  const id = useId().replace(/:/g, '')
  const wrap = useRef<HTMLDivElement>(null)
  const { at, setAt, onKey } = useCursor(values.length)
  const max = Math.max(...values, 0.0001)
  const n = values.length

  /* Drawn in a 100x100 space and stretched by the box, so the layout owns the
     height and nothing here has to measure the DOM. */
  const x = (i: number) => (i / (n - 1)) * 100
  const y = (v: number) => 100 - (v / max) * 96
  const line = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(' ')
  const area = `${line} L 100 100 L 0 100 Z`

  const peakFrom = isPeakHour ? values.findIndex((_, h) => isPeakHour(h)) : -1
  const peakTo = isPeakHour ? values.length - 1 - [...values].reverse().findIndex((_, h) => isPeakHour(n - 1 - h)) : -1

  const read = (clientX: number) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const q = (clientX - r.left) / r.width
    setAt(Math.max(0, Math.min(n - 1, Math.round(q * (n - 1)))))
  }

  return (
    <figure className={s.area} data-tone={tone}>
      <figcaption className={s.cap}>
        {caption}
        {total ? <b className={s.areaTotal}>{total}</b> : null}
      </figcaption>

      <div
        ref={wrap}
        className={s.areaPlot}
        tabIndex={0}
        role="img"
        aria-label={`${caption}. Peaks at ${Math.round(max)} ${unit} around ${hh(values.indexOf(max))}.`}
        onMouseMove={e => read(e.clientX)}
        onMouseLeave={() => setAt(null)}
        onKeyDown={onKey}
        onBlur={() => setAt(null)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className={s.stopTop} />
              <stop offset="100%" className={s.stopFoot} />
            </linearGradient>
          </defs>

          {/* Three gridlines, low contrast, so they never compete with the
              data — the exact numbers live in the read-out, not on an axis. */}
          {[25, 50, 75].map(g => (
            <line key={g} className={s.grid} x1="0" y1={g} x2="100" y2={g} />
          ))}

          {peakFrom >= 0 && (
            <rect
              className={s.peakBand}
              x={x(peakFrom)} y="0"
              width={x(peakTo) - x(peakFrom)} height="100"
            />
          )}

          <path className={s.areaFill} d={area} fill={`url(#g${id})`} />
          <path className={s.areaLine} d={line} vectorEffect="non-scaling-stroke" />

          {at !== null && (
            <line className={s.cursor} x1={x(at)} y1="0" x2={x(at)} y2="100" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        {at !== null && (
          <span className={s.dot} style={{ left: `${x(at)}%`, top: `${y(values[at])}%` }} aria-hidden="true" />
        )}

        {at !== null && (
          <span
            className={s.tip}
            style={{ left: `${x(at)}%` }}
            data-flip={x(at) > 62 ? '' : undefined}
            role="status"
          >
            <b>{hh(at)}</b>
            {Math.round(values[at] * 10) / 10} {unit}
          </span>
        )}
      </div>

      <div className={s.areaAxis} aria-hidden="true">
        {[0, 6, 12, 18, 23].map(h => <span key={h}>{String(h).padStart(2, '0')}</span>)}
      </div>
      {peakFrom >= 0 && (
        <p className={s.areaKey}>
          <i className={s.areaKeySwatch} aria-hidden="true" />
          Evening peak, {hh(peakFrom)}–{hh(peakTo)}
        </p>
      )}
    </figure>
  )
}

/* ══ 3. The donut ═════════════════════════════════════════════════════════════
   Held to the three or four parts one figure actually splits into. A donut is
   weak on its own — a reader cannot take a number off it — so the legend is
   half the component: every slice states its own value and share as text, and
   the total sits in the middle where the eye already is. */
export function ShareDonut({
  caption, centre, centreLab, parts,
}: {
  caption: string
  centre: string
  centreLab: string
  parts: { k: string; v: number; label: string }[]
}) {
  const sum = parts.reduce((a, p) => a + p.v, 0) || 1
  const R = 42
  const C = 2 * Math.PI * R
  let run = 0

  return (
    <figure className={s.donut}>
      <figcaption className={s.cap}>{caption}</figcaption>

      <div className={s.donutBody}>
        <div className={s.donutRing}>
          <svg viewBox="0 0 100 100" role="img" aria-label={
            `${caption}. ` + parts.map(p => `${p.label}, ${Math.round((p.v / sum) * 100)}%`).join('. ')
          }>
            <circle className={s.donutTrack} cx="50" cy="50" r={R} />
            {parts.map((p, i) => {
              const len = (p.v / sum) * C
              const el = (
                <circle
                  key={p.k}
                  className={s.donutArc}
                  data-slice={i}
                  cx="50" cy="50" r={R}
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-run}
                />
              )
              run += len
              return el
            })}
          </svg>
          <span className={s.donutMid}>
            <b>{centre}</b>
            <span>{centreLab}</span>
          </span>
        </div>

        <dl className={s.donutKey}>
          {parts.map((p, i) => (
            <div key={p.k}>
              <dt><i data-slice={i} aria-hidden="true" />{p.label}</dt>
              <dd>{Math.round((p.v / sum) * 100)}%</dd>
            </div>
          ))}
        </dl>
      </div>
    </figure>
  )
}
