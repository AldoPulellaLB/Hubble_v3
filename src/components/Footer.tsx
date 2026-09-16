import Link from 'next/link'
import Button from './Button'
import { Calculator, Instagram, LinkedIn, PixelArrow, WhatsApp, YouTube } from './Icons'
import Reveal from './Reveal'
import type { LinkRef } from '@/lib/types'
import s from './Footer.module.css'

const SOCIAL = { instagram: Instagram, youtube: YouTube, whatsapp: WhatsApp, linkedin: LinkedIn }

type Props = {
  title: string
  /** The label over the social row. */
  connect: string
  /** Optional. It was removed from `site.json`, and a required key that is
   *  absent still renders a `<p>` — empty, but carrying its own 20px top
   *  margin, so the block below it sat 20px lower than it looked like it
   *  should. Guarded rather than deleted: the key may come back. */
  sub?: string
  primary: LinkRef[]
  columns: { title: string; links: LinkRef[] }[]
  presence: { title: string; lines: string[] }
  socials: { label: string; href: string; icon: keyof typeof SOCIAL }[]
  legal: LinkRef[]
  copyright: string
}

/** The blue plate. Same inset and radius as the statement panel — the page
 *  opens and closes on the same shape. */
export default function Footer({ title, connect, sub, primary, columns, presence, socials, legal, copyright }: Props) {
  return (
    <footer className={s.sec}>
      {/* `s.frame` never existed in this module, so the class list rendered as
          "frame undefined". The global `.frame` is doing all the work. */}
      <div className="frame">
        <div className={s.panel}>
          <div className={s.top}>
            <Reveal variant="mask" className={s.brand}>
              <h2 className={`t-h2 ${s.title}`}>{title}</h2>
              {/* The line sits under the heading and above the buttons: it says
                  what the panel is offering, so it belongs to the title rather
                  than trailing the two calls to action. Pure source order — each
                  block carries its own `margin-top`, so nothing in the CSS had
                  to move with it. */}
              {sub ? <p className={`t-body ${s.sub}`}>{sub}</p> : null}
              <div className={s.actions}>
                <Button href="/calculate-your-savings" variant="accent" chevron={false} icon={<Calculator />} iconAfter>
                  Calculate your savings
                </Button>
                <Button href="/contact" variant="onBlue">Get In touch</Button>
              </div>
              {/* Title and icons as one group, because they move together: the
                  group is pushed to the foot of the column so its last line sits
                  on the Contact row's stroke opposite. */}
              <div className={s.connect}>
                <p className={s.connectTitle}>{connect}</p>
                <ul className={s.socials}>
                  {socials.map((sc) => {
                    const Icon = SOCIAL[sc.icon]
                    return (
                      <li key={sc.label}>
                        <a href={sc.href} target="_blank" rel="noopener noreferrer" aria-label={sc.label} className={s.social}>
                          <Icon />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Reveal>

            <ul className={s.primary}>
              {primary.map((l, i) => (
                <Reveal as="li" key={l.label} delay={i * 0.05}>
                  <Link href={l.href} className={s.big}>
                    <span className={`t-h3 ${s.bigLabel}`}>{l.label}</span>
                    <PixelArrow cell={3} className={s.bigChev} />
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className={s.cols}>
            {columns.map((col) => (
              <div key={col.title}>
                <p className={s.colTitle}>{col.title}</p>
                <ul className={s.colList}>
                  {col.links.map((l) => (
                    <li key={l.label}><Link href={l.href} className={s.colLink}>{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className={s.colTitle}>{presence.title}</p>
              <ul className={s.colList}>
                {/* A line wrapped in asterisks is a region heading — the
                    territory itself, as against the cities and the hours listed
                    under it. An empty line is the gap between blocks. */}
                {presence.lines.map((line, i) => {
                  const region = line.length > 2 && line.startsWith('*') && line.endsWith('*')
                  return (
                    <li
                      key={i}
                      className={`${line ? s.presenceLine : s.presenceGap} ${region ? s.presenceRegion : ''}`}
                    >
                      {region ? line.slice(1, -1) : line || ' '}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className={s.base}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.logo} src="/logo/logo-light.svg" alt="Hubble Energy" width={155} height={84} />
            <ul className={s.legal}>
              {legal.map((l) => (
                <li key={l.label}><Link href={l.href} className={s.legalLink}>{l.label}</Link></li>
              ))}
            </ul>
            <p className={s.copy}>{copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
