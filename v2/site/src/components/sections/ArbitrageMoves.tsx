'use client'

import { useEffect, useRef } from 'react'
import FlowLines from '../FlowLines'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import { route } from '@/lib/route'
import s from './ArbitrageMoves.module.css'

type Move = { title: string; copy: string }
type Props = { eyebrow: string; title: string; moves: Move[] }

/* ── The serpentine ──────────────────────────────────────────────────────────
   The page's signature drawing: one route that snakes down the section, and the
   three moves sit in the bays it leaves. Both polylines and the 50px corner
   radius are lifted straight off the comp's own vectors — 13 waypoints each,
   not an approximation of the shape.

   Read the alternation: down, right, down, LEFT, down, right, down, LEFT, down,
   right, down, and out through the right edge. Six verticals against six
   horizontal runs, doubling back three times on the way down. A staircase that
   only ever stepped one way would read as a decorative diagonal; doubling back
   is what makes it read as routed cabling.

   The pair is NOT a uniform translate, which is why both are written out in
   full. Vertically the cyan sits a flat +20 below the blue, but horizontally
   the offset alternates (-20, -50, +40, -40, +30, +40) so the two lines stay
   nested through every turn instead of crossing on the inside of them. Offset
   one line by a constant and half the corners come out concentric and the other
   half come out crossed.

   ── The projection ──────────────────────────────────────────────────────────
   `preserveAspectRatio="none"` against a `0 0 1440 1742` box — 1742 being the
   section's real pixel height at 1440 — so one unit is one pixel and every
   coordinate below is a true position in the comp.

   The usual price of `none` is elliptical corners wherever the two axes scale
   differently, and at r=50 that would be visible rather than academic. It is
   avoided here rather than accepted: every vertical measure in the stylesheet
   is `clamp(floor, <n>vw, <1440 value>)`, so the section's height tracks its
   width below 1440 and freezes above it — and the svg is capped to `--maxw` and
   centred, exactly as the content is. Both scales therefore stay equal and the
   corners stay circular at every width. If any vertical value in that
   stylesheet is ever changed to a fixed px or a rem, that stops being true.

   ── The two ends ────────────────────────────────────────────────────────────
   Both tails run to x=2200 against a 1440 box, and that number is arithmetic
   rather than taste. The svg is capped at 1440 and centred, so on a wider
   screen its right edge sits `(viewport - 1440) / 2` short of the glass — 80px
   at 1600, 240 at 1920, 560 at 2560. Because the box stays 1440 wide, one box
   unit is one real pixel, so the tail has to overshoot by that same figure to
   reach the edge. The comp's own 1445.9 only ever reached the glass at exactly
   1440 and was visibly cut off at every width above it. 2200 clears 2960.
   `overflow: visible` on the svg is what lets those coordinates draw at all,
   and the section's `overflow: hidden` does the cutting.

   Both heads start at the same y (257.6) even though the comp staggers them by
   20. The comp's pair opens in clear space just under the heading — it cannot
   run off the top edge without crossing the type — so the two round caps are
   on show, and staggered they read as a ragged end rather than a deliberate
   start. Level, with the x offset kept, the pair opens cleanly and the nesting
   through every corner below is unaffected. */
const VB = { w: 1440, h: 1742 }
const R = 50

const HEAD_Y = 257.6
const TAIL_X = 2200

const RUN_A: [number, number][] = [
  [258.8, HEAD_Y], [258.8, 379.1],
  [896.2, 379.1], [896.2, 608.4],
  [484.9, 608.4], [484.9, 862.5],
  [1118, 862.5], [1118, 1074.5],
  [306.9, 1074.5], [306.9, 1310.4],
  [868.9, 1310.4], [868.9, 1564.8],
  [TAIL_X, 1564.8],
]

const RUN_B: [number, number][] = [
  [238.8, HEAD_Y], [238.8, 399.1],
  [846.2, 399.1], [846.2, 628.4],
  [524.9, 628.4], [524.9, 882.5],
  [1078, 882.5], [1078, 1094.5],
  [336.9, 1094.5], [336.9, 1330.4],
  [908.9, 1330.4], [908.9, 1584.8],
  [TAIL_X, 1584.8],
]

/* The comp draws the bright segments at 3px against a 1px route. It inks them
   in each route's own hue; this takes the weight and lets the shared
   `--flow-pulse` supply the brightness, which is the language the landing page
   already speaks — a charge visibly travelling, not a thicker piece of cable.

   `drawDelay` holds the cyan a tenth of the route behind the blue, so the pair
   arrives as one current chasing another rather than as two lines switched on
   together. Because the offset is *along the route* rather than in time, both
   still track the scroll 1:1 and both still land at the end of the window. */
const FLOWS = [
  { d: route(RUN_A, R), speed: 16, pulse: 0.07, opacity: 1, width: 1, pulseWidth: 3 },
  {
    d: route(RUN_B, R),
    ink: 'var(--cyan-600)',
    speed: 19, delay: 2.6, drawDelay: 0.1, pulse: 0.055, opacity: 1, width: 1, pulseWidth: 3,
  },
]

/* Mobile is a different drawing, not this one cropped. The moves stack into one
   column, so the route becomes a rail down their left with a jog at each — the
   same idea at a tenth of the width. Authored in a tall box and stretched with
   `none`: the verticals stay vertical, and the jogs' corners go elliptical by
   however much the box is scaled, which at 1.2px is not readable. */
const VB_M = { w: 375, h: 1000 }
/* The two legs sit at 26 and 54 against a column that starts at 72 (16 of
   `--frame` plus the list's 56 of inset), so the pair occupies 14..54 and stays
   clear of the type. At 40/96 — the first cut — the outer leg ran straight
   through the move titles. */
const RUN_M: [number, number][] = [
  [26, -40], [26, 150], [54, 150], [54, 470], [26, 470], [26, 790], [54, 790], [54, 1040],
]
const RUN_M_B = RUN_M.map(([x, y]) => [x - 12, y + 12] as [number, number])

const FLOWS_M = [
  { d: route(RUN_M, 30), speed: 14, pulse: 0.08, opacity: 1, width: 1.2, pulseWidth: 2.6 },
  { d: route(RUN_M_B, 30), ink: 'var(--cyan-600)', speed: 17, delay: 2, drawDelay: 0.1, pulse: 0.06, opacity: 1, width: 1, pulseWidth: 2.2 },
]

/**
 * How arbitrage works — three moves, and the circuit that connects them.
 *
 * The moves alternate sides so the serpentine has somewhere to go, which is the
 * section's argument made structural: charging, discharging and re-scheduling
 * are three points on one continuous run, not three features in a list.
 *
 * ── What happens as you scroll ──────────────────────────────────────────────
 * Three things, in order, each tied to a move rather than to a fraction of a
 * box:
 *
 * 1. Each move fades up as it arrives, its heading a beat ahead of its copy.
 * 2. The route draws as the reader comes down the moves, and the *pace* is the
 *    point — see the note on `--draw` below. It starts with the first move
 *    rather than with the heading: the drawing is what connects the moves, so
 *    it should begin with them.
 * 3. Only once the third move is on screen does the charge start running along
 *    it. The route has to exist before anything can travel down it, and holding
 *    the glow back until the argument is complete is what makes it read as the
 *    system switching on rather than as decoration that was always moving.
 *
 * ── Pacing the draw ─────────────────────────────────────────────────────────
 * The bracket ends at a marker on the section's floor, not at the third move,
 * and that is the whole reason the line reads as being drawn rather than as
 * appearing.
 *
 * The arithmetic: the route is ~5,690 units long and its vertical extent is
 * ~1,307 of them, so it travels 4.4 units of line for every unit of *downward*
 * progress. Bracketing it between the first and third moves gave the draw only
 * 948px of scroll to cover all 5,690 — 6.0 units per pixel — and the leading
 * edge simply outran the reader: by the time any stretch of route was on screen
 * it had already been drawn, several hundred px below the fold. Ending on the
 * floor instead gives it ~1,420px, and the `window` start holds it at zero until
 * the first move is genuinely readable rather than peeking in at the very
 * bottom of the glass. That lands at ~4.5 units per pixel over ~1,250px, next
 * to the products run's 3.6 over 843 — the same hand.
 *
 * The two requirements pull against each other, and this is where the line was
 * drawn: the charge cannot be released at the instant the third move arrives
 * *and* have a finished route to run along, because the route continues 340
 * units below that move. It is released once the route is essentially drawn,
 * which at 1440/900 is with the third move sitting mid-screen. To go back to
 * releasing it earlier, move the second anchor back to `last`.
 *
 * All three are anchored to landmarks the reader can see, so nothing needs
 * re-tuning when the copy reflows.
 */
export default function ArbitrageMoves({ eyebrow, title, moves }: Props) {
  const sec = useRef<HTMLElement>(null)
  const head = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLDivElement>(null)
  const last = useRef<HTMLDivElement>(null)
  /* A zero-height landmark on the section's floor. It is the draw's far end —
     see the pacing note above — and it has to be a real element rather than the
     section itself, because `betweenProgress` measures an element's *top*. */
  const end = useRef<HTMLSpanElement>(null)

  /* The charge is released when the last move has been seen, and it **latches**
     — the observer disconnects on the first hit rather than staying connected
     to re-hold it.
     
     Releasing and re-holding was the first cut and it was wrong: the third move
     leaves the top of the screen ~370px before the section does, so the glow
     visibly switched off while a stretch of lit route was still on screen.
     Latching cannot misfire on the way back up either, because the draw
     threshold inside `FlowLines` is the other half of the condition and it
     unwinds with the scroll.

     `Reveal`'s own observer cannot do this job: its `data-in` lands on the
     move, not on the section whose layer the route reads. */
  useEffect(() => {
    const el = sec.current
    const target = last.current
    if (!el || !target) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.dataset.live = ''; io.disconnect() } },
      { threshold: 0.2 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sec} className={s.sec} aria-labelledby="moves-title">
      <div className={s.flowWrap}>
        <FlowLines
          className={s.flow}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          flows={FLOWS}
          anchors={[first, end]}
          /* Held at zero for the first eighth of the bracket. Without it the
             ramp starts the moment the first move's top touches the bottom of
             the glass — 900px before anyone is looking at it — and a third of
             the route is down before the reader has read a word. */
          window={[0.12, 1]}
          pulseGate
          preserveAspectRatio="none"
        />
      </div>

      {/* No anchors on the phone, deliberately — it falls back to scrubbing the
          svg's own box, which is the whole section.
          
          The landmark bracket cannot work at this size. It spans move one to the
          floor, ~570px on a 375 phone, against an 812px viewport — so `vh -
          from.top` is already larger than the span before the section is even
          in view and the rail arrives fully drawn. `scrubProgress` spans
          `viewport + section` instead (~1,660px), and the window takes the
          middle ~960px of it, which is the stretch the reader is actually
          reading the section over. */}
      <FlowLines
        className={s.flowM}
        viewBox={`0 0 ${VB_M.w} ${VB_M.h}`}
        flows={FLOWS_M}
        window={[0.12, 0.7]}
        pulseGate
        preserveAspectRatio="none"
      />

      <div className={s.inner}>
        <Reveal variant="mask" className={s.head}>
          <div ref={head}>
            <p className="t-eyebrow">{eyebrow}</p>
            <h2 id="moves-title" className={`t-h2s ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
          </div>
        </Reveal>

        <ol className={s.moves}>
          {moves.map((m, i) => (
            /* `fade` rather than `up`: the wrapper carries the opacity and the
               heading and copy carry their own rise off `data-in`, a beat
               apart. `up` would move the whole block as one 28px unit, which
               at 474px between rows is too small a move to register against
               the line being drawn beside it.

               No stagger delay — the rows are far enough apart that each is
               its own arrival, and a delay would only ever read as lag. */
            <Reveal
              as="li"
              key={m.title}
              variant="fade"
              className={`${s.move} ${i % 2 === 0 ? s.right : s.left}`}
            >
              <div ref={i === 0 ? first : i === moves.length - 1 ? last : undefined}>
                <h3 className={`t-h3s ${s.moveTitle}`}>{m.title}</h3>
                <p className={s.moveCopy}>{m.copy}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <span ref={end} className={s.end} aria-hidden="true" />
      </div>
    </section>
  )
}
