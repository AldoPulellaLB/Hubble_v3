'use client'

import Image from 'next/image'
import Button from '../Button'
import Reveal from '../Reveal'
import RuleLink from '../RuleLink'
import ScrollRevealTitle from '../ScrollRevealTitle'
import s from './CaseFeature.module.css'

type Props = {
  eyebrow: string
  title: string
  copy: string
  image: { src: string; alt: string }
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

/**
 * The proof: one project, full-bleed, closing the argument the page has been
 * making.
 *
 * The photograph carries a single vertical wash that ends on solid black, which
 * is doing two jobs — holding the copy legible over an aerial with no quiet
 * corner in it, and handing the section over to the black CTA beneath with no
 * visible edge between them. The comp builds that wash out of a flat 20% plate
 * plus a 40%→100% gradient; composited, those are one ramp from 52% to solid,
 * which is what is drawn here.
 *
 * The photograph rests slightly overscaled and eases to true as the section
 * arrives — the same move the landing page's project cards make when their map
 * plate slides away, so a reader who has seen those recognises this.
 */
export default function CaseFeature({
  eyebrow, title, copy, image, primary, secondary,
}: Props) {
  return (
    <section className={s.sec} aria-labelledby="case-feature-title">
      <Reveal variant="fade" amount={0.05} className={s.media}>
        <Image
          className={s.img}
          src={image.src}
          alt={image.alt}
          width={1920}
          height={1440}
          sizes="100vw"
        />
        <span className={s.scrim} aria-hidden="true" />
      </Reveal>

      <div className={`wrap ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h2 id="case-feature-title" className={`t-h2 ${s.title}`}>
            <ScrollRevealTitle>{title}</ScrollRevealTitle>
          </h2>
          <p className={s.copy}>{copy}</p>
        </Reveal>

        <Reveal delay={0.12} className={s.actions}>
          <Button href={primary.href} variant="primary">{primary.label}</Button>
          <RuleLink label={secondary.label} href={secondary.href} className={s.more} />
        </Reveal>
      </div>
    </section>
  )
}
