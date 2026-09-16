'use client'

import Link from 'next/link'
import { ArrowRing } from '../Button'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import s from './BusinessStakes.module.css'

export type Stake = { num: string; label: string; title: string; href?: string }

type Props = {
  eyebrow: string
  title: string
  copy: string
  items: Stake[]
}

/**
 * What the system is bought to do, before any hardware: four numbered claims on
 * the brand blue, each one a stake rather than a feature.
 *
 * Built on the landing page's `Services` idioms rather than beside them — the
 * numeral is text carrying `t-h2 num` (the comp outlines its glyphs, which is
 * just what Figma does to type, so there is nothing to import), the ring is
 * `ArrowRing`, and each row reveals on its own small delay. What differs is the
 * row's shape: `Services` runs numeral → title + body → ring, and this runs
 * numeral → label → claim → ring, with no body copy at all.
 *
 * A row is a link only when the content file gives it an `href`. The comp draws
 * the ring on all four and names no destinations, so the affordance is built and
 * the target is content's to supply — the same arrangement `ModelCards` uses.
 */
export default function BusinessStakes({ eyebrow, title, copy, items }: Props) {
  return (
    <section id="four-things" className={s.sec} aria-labelledby="stakes-title">
      <div className={`wrap ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <div className={s.headText}>
            <p className="t-eyebrow">{eyebrow}</p>
            <h2 id="stakes-title" className={`t-h2s ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
          </div>
          <p className={s.lede}>{copy}</p>
        </Reveal>

        <ol className={s.rows}>
          {items.map((item, i) => {
            const body = (
              <>
                <span className={`t-h2 num ${s.num}`} aria-hidden="true">{item.num}</span>
                <span className={s.label}>{item.label}</span>
                <span className={`t-h3s ${s.claim}`}>
                  {/* The ordinal belongs to the claim for a screen reader, which
                      reads the list in order and never sees the numeral. */}
                  <span className={s.srNum}>{item.num}. </span>{item.title}
                </span>
                <ArrowRing tone="onBlue" className={s.ring} />
              </>
            )

            return (
              <Reveal as="li" key={item.num} delay={i * 0.06} className={s.rowWrap}>
                {item.href
                  ? <Link href={item.href} className={s.row}>{body}</Link>
                  : <div className={s.row}>{body}</div>}
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
