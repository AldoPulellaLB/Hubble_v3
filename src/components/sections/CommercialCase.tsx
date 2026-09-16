'use client'

import FlowLines from '../FlowLines'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import { route } from '@/lib/route'
import s from './CommercialCase.module.css'

type Props = { eyebrow: string; title: string; copy: string }

/* The panel measures 1357 x 483 on the comp. Routes are authored in that space
   and sliced to fit, so the corner radii never distort — the same projection
   the landing page's statement plate uses, and for the same reason.

   Both routes come straight off the comp's own vectors. Two normalisations,
   both fixes rather than deviations: a 1px horizontal drift in the middle
   vertical of each pair (the designer's node has it running 1311.5 → 1312.5,
   which is a leaning line, not a vertical), and a redundant collinear waypoint
   dropped out of the cyan route's long horizontal.

   The shape is worth reading: in through the panel's right edge, a short step
   DOWN, back LEFT, then UP again before the long run left and the drop out
   through the floor. That double-back is what stops it reading as a diagonal —
   the same grammar as the products run on the landing page, at a quarter of
   the length. */
const VB = { w: 1357, h: 483 }
const R = 29.33

/* ── Both ends run past the box, and by more than looks necessary ────────────
   The comp's own route enters at x=1357.5 and stops at y=479.1 against a
   1357 x 483 box — a whisker outside on the right and 4 units *inside* on the
   floor. That is fine at exactly one aspect ratio and wrong at every other,
   because `slice` takes its scale from whichever axis needs more:

     panel aspect > 2.81 (the viewBox's)  → width drives; the drawing is scaled
                                            up and cropped vertically
     panel aspect < 2.81                  → height drives; no vertical crop at
                                            all, so the floor is exactly y=483

   The panel is 1440 x 482 at 1440 — aspect 2.99, width driving, and the tail
   overshot the floor by 11px. But the plate gets taller the moment the copy
   wraps, so every width below 1440 flips to height driving, and there the tail
   landed 4–5px short: the blue line visibly stopped just above the white plate's
   bottom edge. (The cyan escaped it only by accident, having been authored to
   495.)

   So both ends are pushed well past the box — y=560 on a 483 floor, x=1440 on a
   1357 edge — and the panel's own `overflow: hidden` does the cutting at every
   scale. A trace should be cut off by its frame, never stop inside it. */
const RUN_A: [number, number][] = [
  [1440, 193.6],    // in through the right edge, from outside it
  [1311.5, 193.6],  //   left, then down
  [1311.5, 354.7],
  [1269.9, 354.7],  //   left along the step floor
  [1269.9, 313.6],  //   UP — the double-back
  [1136.2, 313.6],  //   left again
  [1136.2, 393.2],  //   down to the long run
  [385.8, 393.2],   // the long run left, under the heading
  [385.8, 560],     //   and out through the panel's floor
]

const RUN_B: [number, number][] = [
  [1450, 200],
  [1317.9, 200],
  [1317.9, 361.1],
  [1276.4, 361.1],
  [1276.4, 320],
  [1123.4, 320],
  [1123.4, 409.2],
  [363.4, 409.2],
  [363.4, 570],
]

/* 1px trace carrying a 3px charge — the comp draws the bright segment heavier
   than the line it runs along, which is what makes the pulse read as current
   in the cable rather than as a brighter piece of cable. */
const FLOWS = [
  { d: route(RUN_A, R), speed: 11, pulse: 0.09, opacity: 1, width: 1, pulseWidth: 1.8 },
  {
    d: route(RUN_B, R),
    ink: 'var(--cyan-600)',
    speed: 13, delay: 1.6, pulse: 0.07, opacity: 1, width: 1, pulseWidth: 1.8,
  },
]

/* Mobile runs its own, much shorter route in a band along the panel's foot.
   The desktop pair is authored across a 1357-wide box; sliced into a phone it
   arrives as a cropped tangle rather than as cabling. Authored in a 375x112 box
   with `preserveAspectRatio="none"` so it maps 1:1 — at 1.4px the slightly
   elliptical corners on a wide phone are not readable. */
const VB_M = { w: 375, h: 112 }
const RUN_M: [number, number][] = [
  [415, 26], [235, 26], [235, 82], [140, 82], [140, 30], [-40, 30],
]
const RUN_M_B = RUN_M.map(([x, y]) => [x - 10, y + 10] as [number, number])

const FLOWS_M = [
  { d: route(RUN_M, 26), speed: 11, pulse: 0.12, opacity: 0.75, width: 1.2, pulseWidth: 2 },
  { d: route(RUN_M_B, 26), ink: 'var(--cyan-600)', speed: 13, delay: 1.4, pulse: 0.1, opacity: 0.85, width: 1, pulseWidth: 1.8 },
]

/**
 * The commercial argument — a white plate inset from the frame on the brand
 * blue, with the circuit pair drawn across its lower half as the reader
 * arrives.
 *
 * Same plate as the landing page's statement section and deliberately so: it is
 * the one device that says *this is the claim*, and a reader arriving here from
 * the home page should recognise it. What differs is the volume. The landing
 * page shouts at 72; this speaks at 56 in Sora Bold, because it is answering a
 * question the hero already asked rather than opening the page.
 */
export default function CommercialCase({ eyebrow, title, copy }: Props) {
  return (
    <section id="commercial-case" className={s.sec} aria-labelledby="case-title">
      <div className={`frame ${s.frame}`}>
        {/* The plate, not the section: the section's own ground is the hero's
            blue, so only this box wants the nav's light palette over it. */}
        <div className={s.panel} data-nav-light>
          <FlowLines
            className={s.flow}
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            flows={FLOWS}
            window={[0.02, 0.62]}
          />

          {/* Both are always rendered and the CSS shows one — the band is a
              different composition, not a re-flow of the same one. Each scrubs
              off its own box, so whichever is on screen draws with the scroll. */}
          <FlowLines
            className={s.flowM}
            viewBox={`0 0 ${VB_M.w} ${VB_M.h}`}
            preserveAspectRatio="none"
            flows={FLOWS_M}
            window={[0.05, 0.8]}
          />

          <div className={s.grid}>
            <Reveal className={s.head} variant="mask">
              <p className="t-eyebrow">{eyebrow}</p>
              <h2 id="case-title" className={`t-h2s ${s.title}`}>
                <ScrollRevealTitle>{title}</ScrollRevealTitle>
              </h2>
            </Reveal>

            <Reveal className={s.aside} delay={0.12}>
              {/* A `\n` in the content file starts a new paragraph. Body copy
                  is not a heading: a bare `<br>` would put the second thought
                  hard against the first with no air, which reads as a wrap
                  rather than as a break. */}
              {copy.split('\n').map((para) => (
                <p key={para} className={s.copy}>{para}</p>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
