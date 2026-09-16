'use client'

import Link from 'next/link'
import { ArrowRing } from '../Button'
import Reveal from '../Reveal'
import type { Service } from '@/lib/types'
import s from './Services.module.css'
import ScrollRevealTitle from '../ScrollRevealTitle'

type Props = { eyebrow: string; title: string; items: Service[] }

/**
 * The five-ways list.
 *
 * Each row is a single link surface — the numeral, the title, the body and the
 * ring all belong to one target, so the whole row responds rather than only
 * the arrow. Hover slides the row a few pixels off the left rule, which is the
 * cheapest way to make a list of rules feel like a list of doors.

 */
export default function Services({ eyebrow, title, items }: Props) {
  return (
    <section className={`on-light ${s.sec}`} aria-labelledby="services-title">
      <div className={`wrap ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h2 id="services-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
        </Reveal>

        <ul className={s.list}>
          {items.map((item, i) => (
            <Reveal as="li" key={item.num} delay={i * 0.06} className={s.rowWrap}>
              <Link href={item.href} className={s.row}>
                <span className={`t-h2 num ${s.num}`}>{item.num}</span>
                <span className={s.names}>
                  <span className={`t-h4 ${s.name}`}>{item.title}</span>
                  <span className={s.promise}>{item.promise}</span>
                </span>
                <span className={`t-body ${s.body}`}>{item.body}</span>
                <ArrowRing className={s.arrow} />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
