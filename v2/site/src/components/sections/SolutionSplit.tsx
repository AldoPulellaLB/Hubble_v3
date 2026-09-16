'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Button from '../Button'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import s from './SolutionSplit.module.css'

type Chip = { icon: keyof typeof ICONS; label: string }

type Props = {
  eyebrow: string
  title: string
  chips?: Chip[]
  columns: [string, string]
  image: { src: string; alt: string }
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

/* The designer's own exports, referenced rather than redrawn — so each keeps
   whatever is in the asset, including its `#0832B4` fill, exactly as
   `Icons.tsx` treats the two it holds. They are not `currentColor` and are not
   meant to be: nothing here changes their colour.

   A content key rather than a path in the JSON, so the copy file stays free of
   filenames — and so the one delivered with a space in its name is dealt with
   once, here, instead of at every use. The space is encoded rather than the
   file renamed: a re-export from Figma will land on the same name again. */
const ICONS = {
  installation: 'Icon_Installation.svg',
  commissioning: 'Icon_Commissioning.svg',
  'field-service': 'Icon_Field%20service.svg',
  maintenance: 'Icon_Maintenance.svg',
  slas: 'Icon_SLAs.svg',
} as const

const ICON_DIR = '/images/icons/solutions/'

/**
 * The service band: one photograph holding the left 47% of the frame, the offer
 * on a pale panel beside it.
 *
 * Full-bleed on both sides — the photograph runs off the left edge and the
 * panel off the right, with a 10px seam between them. That is the only place on
 * the page where content is not on a gutter, and it is deliberate: the band is
 * a hinge between two blue sections, so it reads as a full-width interruption
 * rather than another framed block.
 *
 * The copy pair and the buttons are pushed to the foot of the panel rather than
 * following the heading. On the comp there is 179px of air between the heading
 * and the columns, which is what stops a three-line heading, two columns of
 * copy and two buttons reading as one dense stack.
 */
/* ── The two entrances, and why they are two ─────────────────────────────────
   The heading arrives as the reader scrolls *into* the section; the copy and the
   buttons arrive once the section has fully landed. Two triggers, sequenced —
   which is a third attempt at this and worth recording why the first two were
   wrong.

   One `Reveal` per part, both on the house default, was the first cut. That
   fires on each element crossing the fold, which in a screen-tall panel means
   the parts are a screen apart: the heading revealed with the section's top
   still at ~750 — animating at the very bottom edge of the glass, finished
   700px before the reader arrived — and the foot at ~150.

   Collapsing both onto one trigger on the panel fixed the timing but made the
   whole panel arrive as a single event, and the section is tall enough to carry
   two.

   So: two triggers, each placed rather than inherited.

     head  root narrowed to the top 60% of the screen → fires with the section's
           top at ~540, which is the reader coming into the section
     foot  the house default → fires with the section's top at ~160, which for a
           screen-tall section is the moment its *bottom* edge clears the fold

   The head's margin needs `amount={0}` beside it: a narrowed root caps the
   achievable intersection ratio, so an area threshold can be unreachable in
   principle.

   And it is scoped to 768 up, where the section is a full screen. Below that
   the panel is short — 179px between the head and the foot on a 375 — and any
   fixed share of the viewport applied to the head lands *after* the foot's
   default trigger, **reversing the sequence**. Measured on a 375: head at a head
   top of 487, foot at 726, which is the foot first. On the defaults the two are
   189px apart in the right order, so the phone keeps them. */
const FULL = '(min-width: 768px)'
export default function SolutionSplit({
  eyebrow, title, chips, columns, image, primary, secondary,
}: Props) {
  const [full, setFull] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(FULL)
    const sync = () => setFull(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    /* Two attributes, each doing one job:
       
       `data-nav-light` and not `.on-light` — the bar wants its light-ground
       palette over this section, but `.on-light` would also hand the eyebrow
       the cyan ink, and the comp inks it brand blue here.
       
       `data-full-vh` is the height *and* the soft snap; see globals.css. */
    <section className={s.sec} data-nav-light data-full-vh aria-labelledby="split-title">
      <div className={s.media}>
        {/* Portrait source (1216x1521, 0.8) because the column is now a full
            screen tall and roughly that shape — a landscape crop would have had
            `cover` scale it by height and render ~1350 CSS px wide, at which
            point an honest `sizes` asks for the 3840 candidate and next/image
            upscales a 1600px file into a ~39MB bitmap whose decode never
            finishes. `600px` is deliberately modest for the same reason: it
            keeps a 2x screen on the 1200 candidate, which this source can
            actually fill. */}
        <Image
          className={s.img}
          src={image.src}
          alt={image.alt}
          width={1216}
          height={1521}
          sizes="(max-width: 767px) 100vw, 600px"
        />
      </div>

      <div className={s.panel}>
        {/* The house head wipe, held back to the top 60% of the screen. */}
        <Reveal
          variant="mask"
          className={s.head}
          amount={full ? 0 : undefined}
          rootMargin={full ? '0px 0px -40% 0px' : undefined}
        >
          <p className="t-eyebrow">{eyebrow}</p>
          {/* `t-h2s`, the same 56 the two sections either side of this one take.
              The comp set this in Montserrat Bold at 32, which suited the long
              list of services it held — but the copy is now a short heading, and
              at 32 in the body face it read as a caption between two 56s.
              `ScrollRevealTitle` is what every other title on the page uses, and
              it is also what makes a `\n` in the content file a real break. */}
          <h2 id="split-title" className={`t-h2s ${s.title}`}>
            <ScrollRevealTitle>{title}</ScrollRevealTitle>
          </h2>
        </Reveal>

        {/* The five capability chips, and they are a list — five labelled
            things, not prose. Deliberately *outside* the head's `Reveal` and a
            sibling of it: each chip stages off `.head[data-in]` (see the CSS),
            which is the same trick the Services numerals use. One observer
            drives the heading and then the chips, so there is no third
            threshold to fall into the wrong order at some breakpoint — the way
            the head and foot did before they were measured. */}
        {chips && chips.length > 0 && (
          <ul className={s.chips}>
            {chips.map((c) => (
              <li key={c.label} className={s.chip}>
                {/* The border, as a drawable outline rather than a CSS `border`.
                    `pathLength={1}` normalises the perimeter to 1 so a single
                    dash offset draws it whatever the chip's size — the same
                    idiom `FlowLines` uses for the page's traces, and it is
                    honoured on a `<rect>`: verified by rasterising one at three
                    offsets and counting painted pixels (450 / 226 / 0).

                    The rect's geometry is CSS, not attributes, so `rx` can be
                    `--r-card` and the box can be inset by half the stroke —
                    which is what keeps the 1px hairline off the SVG's own edge
                    instead of clipped in half by it. */}
                <svg className={s.chipRule} aria-hidden="true" focusable="false">
                  <rect width="100%" height="100%" pathLength={1} />
                </svg>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={s.chipIcon}
                  src={`${ICON_DIR}${ICONS[c.icon]}`}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden="true"
                />
                <span className={s.chipLabel}>{c.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* `fade` on the block, and the three parts inside it rise off its
            `data-in` a beat apart — so the rest of the content arrives as one
            event with an order to it rather than as a single slab. */}
        <Reveal variant="fade" className={s.foot}>
          <div className={s.cols}>
            {columns.map((c) => <p key={c} className={s.copy}>{c}</p>)}
          </div>

          <div className={s.actions}>
            <Button href={primary.href} variant="primary">{primary.label}</Button>
            <Button href={secondary.href} variant="ghost" className={s.quiet}>
              {secondary.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
