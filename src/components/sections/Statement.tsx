'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import FlowLines from '../FlowLines'
import Reveal from '../Reveal'
import { clamp, onFrame, prefersReducedMotion } from '@/lib/motion'
import { route } from '@/lib/route'
import s from './Statement.module.css'
import ScrollRevealTitle from '../ScrollRevealTitle'

type Possible = { eyebrow: string; lead: string; lines: string[] }

type Props = {
  eyebrow: string
  asideEyebrow: string
  title: string
  copy: string
  /** The rotating claim under the heading. Two or more lines pins the section
   *  and scrubs them; one or none leaves it behaving exactly as it did. */
  possible?: Possible
}

/* The panel measures 1360 × 810 on the 1440 comp. Routes are authored in that
   space and sliced to fit, so the corner radii never distort. */
const VB = { w: 1360, h: 810 }

const FLOWS = [
  /* The spine: in from the right edge, three steps down and across, out
     through the bottom-left corner. */
  {
    d: route([[1400, 108], [1236, 108], [1236, 300], [1076, 300], [1076, 412],
              [672, 412], [672, 600], [52, 600], [52, 880]], 52),
    speed: 11, pulse: 0.1, opacity: 0.4, width: 1.3,
  },
  /* A shadow of the spine, one step behind — the comp doubles every trace. On
     the white plate it takes the cyan, so the pair reads two-tone the way the
     reference does rather than as one line drawn twice. */
  {
    d: route([[1400, 150], [1196, 150], [1196, 340], [1036, 340], [1036, 452],
              [632, 452], [632, 640], [92, 640], [92, 880]], 52),
    ink: 'var(--cyan-500)',
    speed: 13, delay: 1.6, pulse: 0.08, opacity: 0.5, width: 1,
  },
  /* The short stepper that sits above the heading's right shoulder. */
  {
    d: route([[1400, 244], [1300, 244], [1300, 60], [1180, 60], [1180, -40]], 40),
    speed: 8, delay: 0.8, pulse: 0.14, opacity: 0.28, width: 1,
  },
]

/* Mobile runs its own, much shorter route.
 *
 * The desktop spine is authored across a 1360-wide box; sliced into a phone it
 * arrives as a cropped tangle rather than as cabling. The comp's mobile frame
 * puts the traces in a band at the *foot* of the plate instead, as one pair
 * that enters left, steps down, steps back up and leaves right — so that is
 * what this draws, in its own box sized to the band.
 *
 * `preserveAspectRatio="none"` here on purpose: the band is a fixed height and
 * a fluid width, and a shape this simple would rather stretch than crop. The
 * corners go slightly elliptical on wide phones, which at 1.4px is invisible. */
const VB_M = { w: 375, h: 112 }   // the band's own proportions, so `none` maps 1:1
const OFFSET_M = 10

/* The floor the pair steps down to, and it is derived rather than typed.
   `.flowM` is anchored `bottom: 0` against a plate that clips, so `y = VB_M.h`
   is the white container's last pixel. The *trailing* route runs `OFFSET_M`
   below the leading one, so it is the one that has to land on the floor —
   hence `VB_M.h - OFFSET_M` here, which puts the twin's step exactly on the
   edge and the leading route ten above it.

   Written as two literals (82 and 92 against a 112 box) this sat 20px clear of
   the plate's bottom at every width below 768, which is the whole of the phone
   range: the band reached the edge but the line inside it never did. Deriving
   it means changing `--band` or the viewBox cannot re-open that gap. */
const FLOOR_M = VB_M.h - OFFSET_M

const RUN_M: [number, number][] = [
  [-40, FLOOR_M - 52],   // in through the left edge
  [140, FLOOR_M - 52],   //   right, then down
  [140, FLOOR_M],
  [235, FLOOR_M],        //   right along the floor, then back up
  [235, FLOOR_M - 56],
  [415, FLOOR_M - 56],   // out through the right edge, higher than it came in
]
const RUN_M_B = RUN_M.map(([x, y]) => [x + OFFSET_M, y + OFFSET_M] as [number, number])

const FLOWS_M = [
  { d: route(RUN_M, 26), speed: 11, pulse: 0.12, opacity: 0.5, width: 1.4 },
  { d: route(RUN_M_B, 26), ink: 'var(--cyan-500)', speed: 13, delay: 1.4, pulse: 0.1, opacity: 0.55, width: 1.1 },
]

/**
 * The distinctive-view panel — a blue field inset from the frame, with the
 * circuit spine drawn across it as the reader arrives.
 *
 * ── The rotating claim ──────────────────────────────────────────────────────
 * With `possible.lines`, the section becomes a **pinned** one: it grows to a
 * screen plus one hold per line, the panel sticks while the reader scrolls
 * through it, the line under "WE KEEP" changes on each hold, and the page
 * carries on afterwards. The whole thing is off unless there are two or more
 * lines, so nothing about the section changes if the block is removed.
 *
 * The index is floored off the pin's own progress rather than tracked with
 * state transitions, so it is correct at any scroll position — including a
 * reload halfway down, or an anchor jump straight into the middle of the pin.
 *
 * **All the lines stay in the DOM**, only one visible. That is deliberate for
 * assistive tech: read in order they say "We keep the power on, costs down,
 * your investment working, your power clean," which is the claim the rotation
 * is making. There is no `aria-live` — announcing each swap as the reader
 * scrolls would be noise.
 */
export default function Statement({ eyebrow, asideEyebrow, title, copy, possible }: Props) {
  const sec = useRef<HTMLElement>(null)
  const drawEnd = useRef<HTMLSpanElement>(null)
  const [idx, setIdx] = useState(0)
  const lines = possible?.lines ?? []
  const rotating = lines.length > 1

  /* Memoised, because the effect in `FlowLines` has `anchors` in its deps and
     this component now re-renders on every line change — a fresh array each
     time would tear the scrub down and rebuild it three times per visit. */
  const anchors = useMemo(() => [sec, drawEnd] as const, [])

  useEffect(() => {
    const el = sec.current
    if (!el || !rotating) return
    return onFrame(() => {
      const r = el.getBoundingClientRect()
      /* The pin's travel: everything past the one screen the panel occupies. */
      const travel = r.height - window.innerHeight
      if (travel <= 0) return
      const p = clamp(-r.top / travel)
      const next = Math.min(lines.length - 1, Math.floor(p * lines.length))
      setIdx((prev) => (prev === next ? prev : next))
    })
  }, [rotating, lines.length])

  return (
    <section
      ref={sec}
      className={s.sec}
      data-rotating={rotating || undefined}
      aria-labelledby="statement-title"
    >
      {/* ── Where the traces finish drawing ──────────────────────────────
          The svgs live inside the pin, and a stuck element's rect never moves —
          so `scrubProgress` on their own box returns a constant and the draw
          freezes part-way for the whole pin. Measured: it stopped at 0.71 and
          stayed there for 1,728px of scroll.

          This marker sits *outside* the pin and keeps moving, so
          `betweenProgress(section, marker)` gives the draw a real bracket: it
          starts as the section's top crosses the fold and is finished 120vh
          later, which is about when the panel has fully arrived. */}
      <span ref={drawEnd} className={s.drawEnd} aria-hidden="true" />

      <div className={s.pin}>
      <div className={`frame ${s.frame}`}>
        {/* The plate, not the section: the section's own ground is the hero's
            blue, so only this box wants the nav's light palette over it. */}
        <div className={s.panel} data-nav-light>
          <FlowLines
            className={s.flow}
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            flows={FLOWS}
            anchors={anchors as unknown as Parameters<typeof FlowLines>[0]['anchors']}
          />

          {/* Both are always rendered and the CSS shows one — the band is a
              different composition, not a re-flow of the same one. Each scrubs
              off its own box, so whichever is on screen draws with the scroll. */}
          <FlowLines
            className={s.flowM}
            viewBox={`0 0 ${VB_M.w} ${VB_M.h}`}
            preserveAspectRatio="none"
            flows={FLOWS_M}
            anchors={anchors as unknown as Parameters<typeof FlowLines>[0]['anchors']}
          />

          <div className={s.grid}>
            <Reveal className={s.head} variant="mask">
              <p className="t-eyebrow">{eyebrow}</p>
              <h2 id="statement-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
            </Reveal>

            {possible ? (
              <div className={s.possible}>
                <p className="t-eyebrow">{possible.eyebrow}</p>
                <p className={s.keep}>
                  <span className={s.lead}>{possible.lead}</span>
                  <span className={s.rotWrap}>
                    {lines.map((line, i) => (
                      <span
                        key={line}
                        className={s.rot}
                        data-state={i === idx ? 'in' : i < idx ? 'past' : 'next'}
                      >
                        {line}
                      </span>
                    ))}
                  </span>
                </p>
              </div>
            ) : null}

            <Reveal className={s.aside} delay={0.12}>
              <p className="t-eyebrow">{asideEyebrow}</p>
              <p className={`t-body ${s.copy}`}>{copy}</p>
            </Reveal>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
