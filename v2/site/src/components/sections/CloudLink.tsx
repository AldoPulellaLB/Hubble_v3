'use client'

import Image from 'next/image'
import Button from '../Button'
import FlowLines from '../FlowLines'
import Reveal from '../Reveal'
import StoreBadge from '../StoreBadge'
import { PixelArrow } from '../Icons'
import { route } from '@/lib/route'
import { emphasise } from '@/lib/emphasis'
import s from './CloudLink.module.css'
import ScrollRevealTitle from '../ScrollRevealTitle'
import ShapeBlur from '../ShapeBlur'

type Props = {
  eyebrow: string
  title: string
  copy: string
  cta: { label: string; href: string }
  apps: { label: string; sub: string; platform: 'ios' | 'android'; href: string }[]
  /** `dx` nudges one tag horizontally, in px, positive to the right — for
   *  the odd label that needs to clear something the anchor cannot know about. */
  tags: { label: string; x: number; y: number; dx?: number }[]
}

/* Authored in the same 1440-wide space as the marquee's tails — see the
   contract in Marquee.tsx. The height is 900 so that width always drives the
   scale (the section is 62.5vw tall, and 900/1440 = 0.625), which is what
   makes x=712 here the same pixel as x=712 there.

   The first two routes therefore start exactly where the two tails stop, at
   x=712 and x=728, y=0 — the section's own top edge. */
/* ── Why every route now leaves through the bottom RIGHT edge ────────────────
   All three used to end by running *down* to y=980, past the viewBox's 900 —
   the usual "author it past the frame and let the overflow cut it" move. Two
   things meant it never got cut, and the reader saw three lines stop dead in
   the white above Projects:

   1. Nothing clipped them. `.svg` sets `overflow: visible` (Products needs it,
      to draw its XL legs outside the box) and `.sec` reads `overflow: show`,
      which is not a CSS value and is discarded. So the traces drew all 980
      units — 274px past the foot of a 950px section at 1798. `.flow` now
      carries `overflow: hidden`, which is what makes "cut by the frame"
      actually true here.
   2. Under `slice` the floor is not where it looks. Width always drives the
      scale (that is the hand-over contract with the marquee) while the
      section's height caps at 950, so the viewBox's visible height is
      `sectionHeight / (width / 1440)`. Measured: **900 units at 1440, 761 at
      1798, 713 at 1920, 534 at 2560.** A tail aimed at the floor therefore aims
      at a different floor on every screen.

   The right edge has none of that: x always maps as `x * (width / 1440)` with
   no offset, so **x = 1440 is the right edge at every viewport** — the same
   property the marquee hand-over relies on. So each route now steps down and
   turns out to 1560, and is cut by one fixed edge rather than a moving one.

   The three exits fan down the right-hand side — 660, 712, 750 — which is below
   the handset at every width and inside the 1798 floor, so the whole gesture
   reads on the comp width and on a wide desktop. Above that the floor climbs
   past them and they are cut mid-descent instead, which is the same thing a
   `slice` crop does to every other part of this drawing. What matters is that
   there is no width at which an end stops in open space. */
/* ── Re-weighted for the white ground ────────────────────────────────────────
   These opacities were judged against black, where the dark field did the
   carrying. Measured against the two grounds:

                              on black      on white
       trace @ 0.3             1.31:1        1.52:1
       trace @ 0.5             1.81:1        2.08:1
       pulse (--cyan-400)     12.73:1        1.65:1

   The traces barely moved. The **pulse** is what broke: `--cyan-400` was the
   brightest mark in the section and is now the faintest, so the only part of it
   still registering was its 4px drop-shadow — a smudge with no line under it.
   That is what read as "unfinished": the eye caught a bright fragment and
   nothing joining it to an edge.

   So the charge is now `--blue-500` (6.93:1) and the traces are raised to
   0.75 / 0.5 / 0.55 (3.15 / 2.08 / 2.25:1), keeping the same hierarchy. On a
   light ground a charge has to be **denser** than the trace it runs along, not
   brighter — the relationship inverts with the field. */
const FLOWS = [
  { d: route([[712, 0], [712, 150], [1186, 150], [1186, 352], [1338, 352], [1338, 660], [1560, 660]], 46),
    speed: 10, pulse: 0.11, opacity: 0.75, width: 1.3 },
  { d: route([[728, 0], [728, 206], [1146, 206], [1146, 408], [1294, 408], [1294, 712], [1560, 712]], 46),
    speed: 12.5, delay: 1.4, pulse: 0.09, opacity: 0.5, width: 1 },
  /* Enters at the right edge, works down and left behind the handset, then
     turns back out below it. Doubling back is the idiom, not an accident — the
     Products run does it twice, and it is what makes a route read as routed
     cabling rather than as a decorative diagonal. Radius 36 rather than 40: its
     two short legs are 75 units and a corner needs twice its radius to clear
     the next one. */
  { d: route([[1440, 600], [1250, 600], [1250, 675], [1124, 675], [1124, 750], [1560, 750]], 36),
    speed: 8, delay: 0.5, pulse: 0.16, opacity: 0.55, width: 1 },
]

/**
 * CloudLink — the software argument.
 *
 * It was the darkest ground on the page until 2026-09-15 and is now white; the
 * circuit, the handset and its glow are unchanged, everything printed on the
 * ground turned over.
 *
 * The tags float over the render on their own slow drift rather than sitting
 * flat on it, which is what sells the mock as a live system rather than a
 * screenshot.
 */
export default function CloudLink({ eyebrow, title, copy, cta, apps, tags }: Props) {
  return (
    /* `data-nav-light`: the bar reads that list once on mount to pick its
       palette, so a section that turns light without it leaves a white logo
       on white glass. */
    <section className={s.sec} data-nav-light aria-labelledby="cloudlink-title">
      <FlowLines
        className={s.flow}
        viewBox="0 0 1440 900"
        flows={FLOWS}
        window={[0, 0.55]}
        preserveAspectRatio="xMidYMin slice"
      />

      <div className={`wrapIn ${s.grid}`}>
        {/* Four named blocks rather than three, because the phone frame runs
            them in a different order: render, badges, words, then the call to
            action across the foot. `.actions` is a plain row here and
            `display: contents` there, which lets its two halves take their own
            places in the column without either of them losing its Reveal — a
            `display: contents` element cannot be transformed, so the animation
            has to live on the children. */}
        <div className={s.copyCol}>
          <Reveal variant="mask" className={s.head}>
            <p className="t-eyebrow">{eyebrow}</p>
            <h2 id="cloudlink-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className={s.body}>
            <p className={`t-lead ${s.copy}`}>{emphasise(copy)}</p>
          </Reveal>
          <div className={s.actions}>
            <Reveal delay={0.18} className={s.ctaWrap}>
              <Button href={cta.href} variant="primary" className={s.cta}>{cta.label}</Button>
            </Reveal>
            <Reveal delay={0.24} className={s.badges}>
              {apps.map((a) => <StoreBadge key={a.platform} tone="light" {...a} />)}
            </Reveal>
          </div>
        </div>

      </div>

      {/* Out of the grid on purpose: the render is its own column of the
          composition and is placed against the section, not against the copy. */}
      <Reveal variant="fade" delay={0.12} className={s.media}>
        <div className={s.stage}>
          {/* The shape sits behind the handset and is only visible where the
              pointer is near it: rounded rect (variation 0), a hairline border,
              and a wide soft circle so the reveal reads as a glow rather than a
              spotlight.

              The two size numbers put the rect on the phone's own outline.
              Solving the shader's `sdRoundRect`, an edge lands at `size / 4.2`
              in units where the canvas half-width is 0.5 — so with the canvas
              20% larger than the render, 0.5 / 1.2 * 4.2 = 1.75. `shapeRatio`
              is then simply the asset's aspect, 1920/933. */}
          <ShapeBlur
            className={s.blur}
            variation={0}
            shapeSize={1.75}
            shapeRatio={2.06}
            roundness={0.65}
            borderSize={0.1}
            circleSize={0.3}
            circleEdge={1.3}
            color="#3164FF"
          />

          {/* One upright render at every width now, so no `<picture>` and no
              art-directed mobile crop: the replacement asset is already the
              composition the narrow layout used to swap in.

              `sizes` is a length, not a share of the frame, because the stage
              caps at 17.5rem. The obvious `34vw` claims 653px at 1920, which
              makes the browser choose the 1920-wide candidate and upscale a
              933px-wide source to 1920x3951 — a ~30MB bitmap whose decode never
              completes, so the render never appears at all.

              The 336px arm is 17.5rem x the --group scale the CSS applies from
              1920 up. It has to be stated: left at 280px the browser would keep
              picking the candidate for the old size and soften the render. */}
          <Image
            className={s.phone}
            src="/images/cloudlink/Cloudlink_Phone2.png"
            alt="The Hubble CloudLink app running on a phone"
            width={933}
            height={1920}
            priority={false}
            sizes="(max-width: 1023px) 70vw, (min-width: 1920px) 336px, 280px"
          />
          {/* Position travels as custom properties, not as inline `left`/`top`:
              an inline declaration can't be overridden by a media query, and
              the narrow layout has to re-anchor the right-hand tags to the
              opposite edge or they hang off it. */}
          {tags.map((t, i) => (
            <span
              key={t.label}
              className={s.tag}
              data-side={t.x < 65 ? 'left' : 'right'}
              style={{
                ['--x' as string]: `${t.x}%`,
                ['--y' as string]: `${t.y}%`,
                ['--dx' as string]: `${t.dx ?? 0}px`,
                ['--i' as string]: String(i),
              }}
            >
              {t.label}
              <PixelArrow className={s.tagChev} />
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
