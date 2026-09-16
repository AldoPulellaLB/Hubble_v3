'use client'

import Link from 'next/link'
import { ArrowRing } from '../Button'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import s from './ModelCards.module.css'

type Card = { num: string; title: string; body: string; href?: string }
type Props = { eyebrow: string; title: string; cards: Card[] }

/**
 * What makes it work — four cards butted together on a pale ground, separated
 * by hairlines rather than by gaps.
 *
 * The numeral appears twice on every card, once at each end of a rule-less top
 * row. That is the comp's own device and it is doing something: with no gap and
 * no border between cards, the paired numerals are what tell you where one card
 * stops and the next begins. Remove one and the row of four collapses into a
 * single four-column table.
 *
 * Hover lifts the card onto a pale blue plate with a 25px radius, recolours the
 * type to brand blue, fills the ring white and turns the *left* numeral white —
 * so it all but disappears into the plate while its twin at the other end stays
 * dark. Deliberate on the comp, and worth not "fixing": it makes the hovered
 * card read as one open surface rather than as a card with two labels.
 *
 * The ring is drawn on every card because the comp draws it on every card. A
 * card becomes a real link only when the content file gives it an `href` —
 * these four modelling steps have no pages yet, so none is set, and the ring
 * stays part of the card's graphic language rather than a promise the site
 * cannot keep.
 */
export default function ModelCards({ eyebrow, title, cards }: Props) {
  return (
    <section className={s.sec} data-nav-light aria-labelledby="model-title">
      <div className={`frame ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h2 id="model-title" className={`t-h2 ${s.title}`}>
            <ScrollRevealTitle>{title}</ScrollRevealTitle>
          </h2>
        </Reveal>

        <ul className={s.grid}>
          {cards.map((c, i) => {
            const body = (
              <>
                <p className={s.nums} aria-hidden="true">
                  <span className={`t-h5 num ${s.numeral}`}>{c.num}</span>
                </p>
                <h3 className={`t-h5 ${s.cardTitle}`}>
                  <span className={s.srNum}>{c.num}. </span>{c.title}
                </h3>
                <p className={s.body}>{c.body}</p>
                <span className={s.foot}>
                  <ArrowRing className={s.ring} />
                </span>
              </>
            )

            return (
              <Reveal as="li" key={c.num} delay={i * 0.07} className={s.cell}>
                {c.href
                  ? <Link href={c.href} className={s.card}>{body}</Link>
                  : <div className={s.card}>{body}</div>}
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
