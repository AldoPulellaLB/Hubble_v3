import Button from '../Button'
import Reveal from '../Reveal'
import { Calculator } from '../Icons'
import s from './Cta.module.css'
import ScrollRevealTitle from '../ScrollRevealTitle'

type Props = {
  eyebrow: string
  title: string
  copy: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

/** The closing question. One loud accent on the page, and it is here. */
export default function Cta({ eyebrow, title, copy, primary, secondary }: Props) {
  return (
    <section className={s.sec} aria-labelledby="cta-title">
      <div className={`wrapIn ${s.grid}`}>
        <Reveal variant="mask" className={s.headCol}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h2 id="cta-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
        </Reveal>

        <Reveal delay={0.1} className={s.aside}>
          <p className={`t-lead ${s.copy}`}>{copy}</p>
          <div className={s.actions}>
            <Button href={primary.href} variant="accent" chevron={false} icon={<Calculator />} iconAfter>
              {primary.label}
            </Button>
            <Button href={secondary.href} variant="ghost">{secondary.label}</Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
