'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import Button from '../Button'
import FlowLines from '../FlowLines'
import Reveal from '../Reveal'
import { route } from '@/lib/route'
import s from './Products.module.css'
import ScrollRevealTitle from '../ScrollRevealTitle'

type Item = {
  name: string
  /** The blue line under the name — who the tier is for. */
  kicker: string
  copy: string
  /** The unlit render. */
  image: string
  /** The lit one, faded over the top as the row arrives. Optional: without it
   *  the row is a single still, exactly as it was. */
  imageOn?: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}
type Partners = {
  title: string
  kicker: string
  copy: string
  image: string
  cta: { label: string; href: string }
}
type Props = { eyebrow: string; title: string; items: Item[]; partners: Partners }

/* The circuit run — one route, drawn as an offset pair, threading both renders.

   ── The projection ──────────────────────────────────────────────────────────
   Authored 1:1 against the comp: at 1440 the run's box measures 1262px, so a
   `0 0 1440 1262` box with `preserveAspectRatio="none"` makes one unit one
   pixel and every coordinate below is a real position in the layout.

   The box's origin is the section's top edge — padding included — and its floor
   is the top edge of the Partnered Innovations plate, NOT the foot of the
   section. That is what `FLOOR` is: `.flow` is pinned `top: 0` and lifted off
   the bottom by `--pi-h + --pi-pad-b` — the plate's own height and the section's
   foot padding, which is the distance from the foot of the section to the top of
   the plate at any width, so the two cannot drift apart. Because the origin did
   not move and the unit is still a pixel, every y below reads exactly as it did
   when the box ran the full height of the section.

   `none` rather than `slice` because the box's *pixel* height barely moves
   between 1280 and 1800 — the renders are capped at 31rem and the copy wraps
   the same — while `slice` divides y by the width scale, so the same layout
   read as 1292 units at 1305 wide and 969 at 1799. The route was pinned to the
   renders at one width and slid off them at every other. Stretching y to the
   box instead holds it. The price is elliptical corners wherever the two scales
   differ — 12% out at 1305, 25% at 1799, which on a 1.35px trace is not
   readable. `vector-effect: non-scaling-stroke` keeps the weight even.

   ── The route ───────────────────────────────────────────────────────────────
   Down the LEFT margin past the top render → right under its foot → up through
   it → right across it and out into the gap → the long fall down the middle →
   right through the bottom render → up out of its roof → right along its
   shoulder → down through it and out into the banner.

   This is the mirror of the run as first built (which came down the right
   margin), because the comp — Figma `1797:533` — puts the High Voltage render
   on the left and the Low Voltage one on the right. The layout mirrors exactly:
   the two columns are equal `1fr` tracks and `.flip` swaps which one holds the
   copy, so every x below is just `1440 - x` of the original and lands on the
   same part of the same render.

   The alternation is the whole point. It is not a staircase: five verticals
   against four horizontals, doubling back twice on the way across, which is
   what makes it read as routed cabling rather than as a decorative diagonal.

   Every leg clears 2 x the 46 corner radius, or `route()` would round one
   corner into the next. */
const FLOOR = 1262

/* The tail is authored past the floor on purpose, and what cuts it is the
   banner's own plate: `.inner` carries the same z-index as `.flow` and comes
   after it in the document, so an opaque blue plate painted over the trace is
   what ends it. Authoring it to stop *on* the floor instead would leave it
   finishing in mid-air at any width where the two disagree by a pixel — the
   same contract as CloudLink (980 in a 900 box) and Statement (880 in an 810
   box), and the lesson of the commercial-case plate: a trace must be cut off by
   something, never stop inside it. The overshoot also means the pulse runs on
   under the panel rather than dying at its edge. */
const TAIL = FLOOR + 130

const RUN = [
  [95, -60],     // in through the top, down the margin left of the render
  [95, 745],     //   turning just below the render's foot
  [280, 745],    // right, under it
  [280, 560],    //   UP, through the render's left shoulder
  [698, 560],    // right, across the render and out into the gap between the two
  [698, 1070],   //   DOWN the middle, clear of the copy column at 544
  [1012, 1070],  // right, through the lower half of the bottom render
  [1012, 730],   //   UP, out through its roof
  [1235, 730],   // right, along its shoulder in the gap between the rows
  [1235, TAIL],  // down behind it and out under the Partnered Innovations plate
] as [number, number][]

/* ── Reaching the renders from 1920 up ───────────────────────────────────────
   From 1920 the copy sits on a flat 120px gutter while this run stays in its
   1440 box, centred — so the renders move outboard of the box and the route's
   two end verticals no longer touch them.

   The box is deliberately NOT released to full width to fix that. Under
   `preserveAspectRatio="none"` widening it scales x by 1.33 at 1920 and 1.78 at
   2560 while y stays at 1.0, and every corner radius goes elliptical with it.
   The legs are lengthened instead: the box keeps its ~1:1 scale, so the corners
   stay circular, and `overflow: visible` on the svg means coordinates outside
   the viewBox still draw — the same licence the route already takes with
   y = -60 and the tail below the floor.

   Only the two end verticals move. Where they have to land, in box units —
   mirrored with the rest of the route, so the warehouse is now the left-hand
   pair and the house the right-hand one:

                       1920            2560          usable overlap
       warehouse  -120 .. 376      -440 ..  56       -120 ..   56
       house      1064 ..1560      1384 ..1880       1384 .. 1560

   so -30 and 1470 sit inside both, and with the -44 pair offset the second
   line (-74 and 1426) does too. */
const REACH_LEFT = -30
const REACH_RIGHT = 1470

const RUN_XL = RUN.map(([x, y]) =>
  [x === 95 ? REACH_LEFT : x === 1235 ? REACH_RIGHT : x, y] as [number, number])

/* Negative, because the route is mirrored: the pair has to fall outboard of the
   run on the same side it always did. */
const OFFSET = -44
/* The pair is a uniform offset on both axes — that is what staggers the corners
   the way the reference has them, rather than nesting them concentrically. The
   last point is the exception: carried down, the offset would leave one tail
   hanging 44 units short of the other with nothing after it to explain why. The
   two finish level. */
const RUN_B = RUN.map(([x, y], i) =>
  [x + OFFSET, i === RUN.length - 1 ? y : y - OFFSET] as [number, number])

const RUN_XL_B = RUN_XL.map(([x, y], i) =>
  [x + OFFSET, i === RUN_XL.length - 1 ? y : y - OFFSET] as [number, number])

const FLOWS_XL = [
  { d: route(RUN_XL, 46), speed: 15, pulse: 0.08, opacity: 0.6, width: 1.35 },
  { d: route(RUN_XL_B, 46), speed: 18, delay: 2.4, drawDelay: 0.1, pulse: 0.06, opacity: 0.32, width: 1 },
]

const FLOWS = [
  { d: route(RUN, 46), speed: 15, pulse: 0.08, opacity: 0.6, width: 1.35 },
  /* `drawDelay` holds the second line a tenth of the route behind the first, so
     the pair arrives as one current chasing another rather than as two lines
     switched on together. It still lands with the first at the end of the
     window — the delay is taken out of its own travel, not added to the run. */
  { d: route(RUN_B, 46), speed: 18, delay: 2.4, drawDelay: 0.1, pulse: 0.06, opacity: 0.32, width: 1 },
]

/**
 * The lit state of a render, faded over the unlit one.
 *
 * Not a `Reveal`: that fires once and disconnects, which is right for copy
 * arriving but wrong here — scrolling back up has to put the lights out again.
 * This observer stays connected and reports both directions, so the layer
 * follows the reader rather than latching on the first pass.
 *
 * The delay is on the way in only. Held on the way out too, the lights would
 * linger half a second after the row had gone, which reads as a lag rather
 * than as a fade.
 */
function Lit({ src }: { src: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = host.current
    if (!el) return
    if (prefersReducedMotion()) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={host} className={s.lit} data-on={on} aria-hidden>
      <Image src={src} alt="" width={1448} height={1086} sizes="(max-width: 1023px) 88vw, 31rem" />
    </div>
  )
}

/**
 * The partner panel that closes the section — the third audience, after the two
 * client tiers, and the one the circuit run finishes in.
 *
 * Everything moves off the one `data-in` the wrapper's observer sets, which is
 * the Services-numerals arrangement: a single trigger, parts timed against it.
 * One `Reveal` per part would fire each on its own crossing, and in a panel this
 * wide that means the copy is finished before the plate it sits on has arrived.
 *
 * The plate is revealed by a `clip-path` wipe rather than a scale, because a
 * scale squashes the type on the way and it stretches back into shape as the
 * panel opens. The wipe runs right-to-left — the direction the current arrives
 * from, since the run's tail comes down at x=1235 — so the panel reads as
 * something the circuit switched on rather than as a card that faded up.
 *
 * The photograph is a cut-out with no ground of its own, so it stands above the
 * plate's top edge by design; only its foot, where the desk is, is clipped.
 */
function PartnerPanel({ title, kicker, copy, image, cta }: Partners) {
  return (
    <Reveal variant="none" className={s.partners} amount={0.16}>
      <div className={s.plate}>
        <div className={s.figure}>
          <Image
            src={image}
            alt="A Hubble Energy engineer at work"
            width={1356}
            height={988}
            sizes="(max-width: 767px) 72vw, (max-width: 1023px) 56vw, (max-width: 1439px) 41vw, 560px"
          />
        </div>

        <div className={s.pCopy}>
          <h3 id="partnered-innovations" className={`t-h3 ${s.pTitle}`}>{title}</h3>
          <p className={`t-eyebrow ${s.pKicker}`}>{kicker}</p>
          <p className={`t-body ${s.pBody}`}>{copy}</p>
          <div className={s.pAction}>
            <Button href={cta.href} variant="light">{cta.label}</Button>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/**
 * The two-tier product proof.
 *
 * The renders alternate sides and the circuit run visibly connects them, which
 * is the section's whole argument: low voltage and high voltage are the same
 * system at two scales, not two product lines. The run then carries on into the
 * partner panel, which is the third audience for the same system.
 */
export default function Products({ eyebrow, title, items, partners }: Props) {
  const firstRow = useRef<HTMLHeadingElement>(null)

  return (
    <section className={`on-light ${s.sec}`} aria-labelledby="products-title">
      <FlowLines
        className={s.flow}
        viewBox={`0 0 1440 ${FLOOR}`}
        flows={FLOWS}
        /* Scrubbed, not triggered: `--draw` is read off the section's position
           every frame, so the run draws itself as the reader comes down the
           page and unwinds again, stroke for stroke, when they go back up. No
           `lag` — the trace sits exactly where the scroll puts it, the way
           CloudLink's does. The pair is still staggered, but by `drawDelay`,
           which offsets the second line *along the route* rather than in time,
           so both track the scroll 1:1.

           Both ends of the draw are landmarks rather than numbers: it starts as
           'High Voltage Clients' scrolls into view and is finished by the time
           the partner panel's heading does. Nothing has to be re-tuned when the
           copy reflows or the section grows — the two things the reader watches
           for are the two things the animation is tied to.

           Both landmarks are now inside this section, which is the point of
           moving the far end here. It used to bracket to whatever section came
           next (`#stats-grid`, then `#services-title`), so reordering the page
           silently changed the pace of this draw and, twice, its length. The
           panel it finishes in cannot move away from it.

           That also fixes the pace on its own. The ramp is the distance between
           the two in the document — the same stretch of page on every screen,
           since both landmarks move together. */
        anchors={[firstRow, '#partnered-innovations']}
        /* The full bracket, edge to edge. The default window would keep a
           margin at each end, which here would mean starting after the heading
           had already arrived and finishing before the panel did. */
        window={[0, 1]}
        preserveAspectRatio="none"
      />

      {/* The same run with its two end verticals lengthened, for 1920 up. Both
          are always rendered and the CSS shows one — the arrangement Statement
          uses for its phone band. Each scrubs off the same landmarks, so
          whichever is on screen draws with the scroll. */}
      <FlowLines
        className={s.flowXl}
        viewBox={`0 0 1440 ${FLOOR}`}
        flows={FLOWS_XL}
        mode="scrub"
        anchors={[firstRow, '#partnered-innovations']}
        window={[0, 1]}
        preserveAspectRatio="none"
      />

      <div className={`wrapIn ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h2 id="products-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
        </Reveal>

        {/* The first row is the flipped one: the comp leads with the High
            Voltage render on the left and its copy on the right, and the two
            alternate from there. The circuit run above is authored to that
            order — move the flip and the route no longer touches the renders. */}
        {items.map((item, i) => (
          <div key={item.name} className={`${s.row} ${i % 2 ? '' : s.flip}`}>
            <Reveal className={s.copyCol} delay={0.05}>
              <h3 ref={i === 0 ? firstRow : undefined} className={`t-h3 ${s.name}`}>{item.name}</h3>
              <p className={`t-eyebrow ${s.kicker}`}>{item.kicker}</p>
              <p className={`t-body ${s.copy}`}>{item.copy}</p>
              <div className={s.actions}>
                <Button href={item.primary.href} variant="primary">{item.primary.label}</Button>
                <Button href={item.secondary.href} variant="ghost" className={s.quiet}>{item.secondary.label}</Button>
              </div>
            </Reveal>

            {/* Two states of the same render, stacked. The unlit one arrives
                with the row; the lit one fades over it a beat later, so the
                house or the plant reads as coming on rather than as simply
                appearing. The lit layer is decorative — it is the same subject,
                so it carries no alt of its own. */}
            <Reveal variant="fade" delay={0.12} className={s.shot}>
              <Image
                src={item.image}
                alt={`${item.name} — Hubble system`}
                width={1448}
                height={1086}
                sizes="(max-width: 1023px) 88vw, 31rem"
              />
              {item.imageOn ? <Lit src={item.imageOn} /> : null}
            </Reveal>
          </div>
        ))}

        <PartnerPanel {...partners} />
      </div>
    </section>
  )
}
