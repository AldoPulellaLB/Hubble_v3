'use client'

import Button from '../Button'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import { emphasise } from '@/lib/emphasis'
import s from './HowWeWork.module.css'

/* A content key rather than a path in the JSON, so the copy file stays free of
   filenames — the arrangement `SolutionSplit` already uses for its chips. It
   also deals once, here, with the delivered folder being `Process` and not
   `process`: the local filesystem does not care and a Linux build does. */
const ICONS = {
  insight: 'Insight.svg',
  integration: 'Intergration.svg',
  innovation: 'Innovation.svg',
  installation: 'Installation.svg',
  impact: 'Impact.svg',
} as const

const ICON_DIR = '/images/icons/Process/'

type Step = { icon: keyof typeof ICONS; title: string; copy: string }

type Option = {
  num: string
  title: string
  kicker: string
  /** One paragraph — the first card. */
  copy?: string
  /** Two sub-columns — the second card. Mutually exclusive with `copy`. */
  blocks?: { title: string; copy: string }[]
  footnote?: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

type Props = {
  eyebrow: string
  title: string
  /** The section's lead paragraph. Optional, and deliberately so: `load` casts
   *  the JSON unchecked, so a required key the content file does not carry
   *  ships as an empty `<p>` — the bug the footer's `sub` records. */
  copy?: string
  /** The five-step row. Omit it and the section is the options half alone —
   *  which also drops the wider seam above "Your options", since that gap was
   *  measuring the step row to the heading and there is no step row left. */
  process?: { title: string; steps: Step[] }
  options: { title: string; items: Option[] }
}

/**
 * How we put intelligent energy to work — Figma `1797:618` and `1797:684`.
 *
 * Two halves under one heading: the five-step process, then the two commercial
 * routes through it. It replaces the old "five ways" list, which was five links
 * to `/solutions/*`; those are still in the nav's Solutions panel, and the copy
 * that was here is in `context/_concept-backups/services-five-ways/`.
 *
 * ── The process row ─────────────────────────────────────────────────────────
 * A real `<ol>`. The steps are numbered in the comp and the order is the whole
 * point, so the numeral is the list's own and not decoration: it is written into
 * the heading text rather than left to a marker, because a `list-style` marker
 * cannot be centred under a centred icon.
 *
 * The rules between the cards are `::after` pseudo-elements, not borders,
 * because they have to answer to a *neighbour's* state: a hovered card grows a
 * plate, and a rule against its rounded edge reads as a seam. So a card drops
 * its rule when it is hovered or when the card after it is (`:has`). The comp
 * shows exactly this — card 2 is drawn hovered and the 1|2 and 2|3 rules are
 * absent while 3|4 and 4|5 remain.
 *
 * ── The entrance, and the exit ──────────────────────────────────────────────
 * One `Reveal` per group — the process row, the options list — with every part
 * staggering off its `data-in`. That is the Services-numerals arrangement, and
 * it is the only thing that works here: a `Reveal` per card gives each its own
 * observer, and cards side by side cross the fold in the same frame, so the
 * stagger would appear only on a slow scroll. Each part's delay is added to
 * `--rd` rather than replacing it, which is what keeps the cascade after a flick
 * or an anchor jump.
 *
 * Both groups `repeat`, so the section plays in *and* out. The exit is not the
 * entrance reversed: `Reveal` reports which edge the group left by, and the
 * content leaves in the direction of travel — lifting away when the reader
 * scrolls down, sinking when they scroll back up. It is also quicker and more
 * tightly staggered than the entrance, per the house contract (an exit runs
 * ~60-70% of its enter; a reader leaving has already decided).
 */
export default function HowWeWork({ eyebrow, title, copy, process, options }: Props) {
  return (
    <section className={`on-light ${s.sec}`} aria-labelledby="how-we-work-title">
      <div className={`wrap ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <p className={`t-eyebrow ${s.eyebrow}`}>{eyebrow}</p>
          <h2 id="how-we-work-title" className={`t-h2 ${s.title}`}>
            <ScrollRevealTitle>{title}</ScrollRevealTitle>
          </h2>
          {copy ? <p className={`t-lead ${s.lead}`}>{emphasise(copy)}</p> : null}
        </Reveal>

        {/* ── Our process ─────────────────────────────────────────────── */}
        {process && (
          <>
            <Reveal variant="mask" className={s.subHead} repeat>
              <h3 id="our-process" className={`t-h3 ${s.subTitle}`}>{process.title}</h3>
            </Reveal>

            <Reveal variant="none" className={s.processWrap} amount={0.12} repeat>
              <ol className={s.steps} aria-labelledby="our-process">
                {process.steps.map((step, i) => (
                  <li key={step.title} className={s.step} style={{ ['--i' as string]: i }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={s.stepIcon}
                      src={`${ICON_DIR}${ICONS[step.icon]}`}
                      alt=""
                      width={48}
                      height={48}
                      aria-hidden="true"
                    />
                    <h4 className={`t-h5 ${s.stepName}`}>{i + 1}. {step.title}</h4>
                    <p className={`t-body ${s.stepCopy}`}>{step.copy}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </>
        )}

        {/* ── Your options ────────────────────────────────────────────── */}
        <Reveal variant="mask" className={`${s.subHead} ${process ? s.optionsHead : ''}`} repeat>
          <h3 id="your-options" className={`t-h3 ${s.subTitle}`}>{options.title}</h3>
        </Reveal>

        <Reveal variant="none" className={s.cardsWrap} amount={0.1} repeat>
          <ul className={s.cards} aria-labelledby="your-options">
          {options.items.map((opt, i) => (
            <li key={opt.num} className={s.card} style={{ ['--i' as string]: i }}>
              <div className={s.cardIn}>
                <div className={s.cardHead}>
                  <span className={`num ${s.cardNum}`} aria-hidden="true">{opt.num}</span>
                  <h4 className={`t-h3 ${s.cardTitle}`}>{opt.title}</h4>
                </div>

                <div className={s.cardBody}>
                  <p className={s.kicker}>{opt.kicker}</p>

                  {opt.copy ? <p className={`t-body ${s.copy}`}>{opt.copy}</p> : null}

                  {opt.blocks ? (
                    <div className={s.blocks}>
                      {opt.blocks.map(b => (
                        <div key={b.title} className={s.block}>
                          <h5 className={s.blockTitle}>{b.title}</h5>
                          {/* `pre-line` rather than a `<br>`: the comp breaks
                              before the parenthesis, and a newline left as a
                              text node keeps the accessible name one sentence.
                              A `<br>` inserts no whitespace into the accname. */}
                          <p className={`t-body ${s.blockCopy}`}>{emphasise(b.copy)}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {opt.footnote ? <p className={`t-body ${s.footnote}`}>{opt.footnote}</p> : null}
                </div>

                <div className={s.actions}>
                  <Button href={opt.primary.href} variant="primary">{opt.primary.label}</Button>
                  <Button href={opt.secondary.href} variant="ghost" className={s.quiet}>
                    {opt.secondary.label}
                  </Button>
                </div>
              </div>
            </li>
          ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
