'use client'

import { useEffect, useRef, useState } from 'react'
import PixelCard from '../PixelCard'
import Reveal from '../Reveal'
import ScrollRevealTitle from '../ScrollRevealTitle'
import s from './DayOnTheMeter.module.css'

type Band = { label?: string; tone: 'grid' | 'hubble' | 'avoided' | 'rest'; width: number }

/* The two loud bands carry the brand's pixel field, each in a palette pitched
   above its own ground — see the variants in PixelCard.jsx. The inert ones stay
   flat, exactly as the comp has them. */
const PIXELS: Partial<Record<Band['tone'], 'barBlue' | 'barGreen'>> = {
  hubble: 'barBlue',
  avoided: 'barGreen',
}

type Props = {
  eyebrow: string
  title: string
  copy: string
  barLabel: string
  caption: string
  axis: [string, string]
  rows: Band[][]
}

/**
 * The money picture: two stacked bars on one track, the second one broken into
 * what the site still spends and what it stops spending.
 *
 * The bands are driven by percentages from the content file rather than being
 * hard-coded here, because they are a *claim about numbers* — someone editing
 * the copy has to be able to move them without opening a component. They are
 * proportions of the track, and the comp's own are 50.06 / 49.94 on the top row
 * and 20.24 / 50.94 / 28.80 on the bottom: what leaves the business on the grid,
 * against what leaves it with a Hubble system plus the slice that now doesn't.
 *
 * Each band is absolutely placed by `left`/`width` rather than sitting in a
 * flow row. That is what lets a row be wiped in as one bar — the bands cannot
 * shove each other around mid-animation — and it keeps the two rows' edges
 * aligned regardless of what the percentages are changed to.
 *
 * The pixel field on the two loud bands is `PixelCard`, driven rather than
 * hovered: its own observer switches it on as the chart arrives, so the pixels
 * scatter in behind the bar's wipe. It replaced a screened bitmap — the comp
 * builds the texture as a dark plate of light dots at `mix-blend-mode: screen`,
 * which worked but was a fixed image, could not take the brand's own pixel
 * animation, and forced the green band's ground off-brand to survive the blend.
 */
export default function DayOnTheMeter({
  eyebrow, title, copy, barLabel, caption, axis, rows,
}: Props) {
  const chart = useRef<HTMLDivElement>(null)
  const [lit, setLit] = useState(false)

  /* Latches. `Reveal` cannot supply this: it reports through a class and a
     `data-` attribute, and a canvas effect needs React state. The bars only
     wipe in once, so the pixels only need to scatter once. */
  useEffect(() => {
    const el = chart.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setLit(true); io.disconnect() } },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className={s.sec} data-nav-light aria-labelledby="meter-title">
      <div className={`frame ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <div className={s.headText}>
            <p className="t-eyebrow">{eyebrow}</p>
            <h2 id="meter-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
          </div>
          <p className={s.lede}>{copy}</p>
        </Reveal>

        <div className={s.body}>
          <div className={s.side}>
            <Reveal delay={0.08}>
              <p className={`t-h5 ${s.barLabel}`}>{barLabel}</p>
            </Reveal>
            <Reveal delay={0.16} className={s.captionWrap}>
              <p className={s.caption}>{caption}</p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className={s.chart}>
            <div ref={chart} className={s.probe} aria-hidden="true" />
            {rows.map((bands, r) => (
              /* The wipe is on the row, not the bands: the whole bar — grounds
                 and labels together — is uncovered left to right as one object.
                 Safe to clip here because the IntersectionObserver sits on the
                 `Reveal` wrapper above; a clip on an observed element empties
                 its intersection rect and it would never reveal at all. */
              <div key={r} className={s.row} style={{ ['--i' as string]: String(r) }}>
                {bands.map((b, i) => {
                  const left = bands.slice(0, i).reduce((a, x) => a + x.width, 0)
                  return (
                    <div
                      key={i}
                      className={`${s.band} ${s[b.tone]}`}
                      style={{ left: `${left}%`, width: `${b.width}%` }}
                    >
                      {PIXELS[b.tone]
                        ? <PixelCard variant={PIXELS[b.tone]} active={lit} className={s.pix} />
                        : null}
                      {b.label ? <span className={s.bandLabel}>{b.label}</span> : null}
                    </div>
                  )
                })}
              </div>
            ))}

            <div className={s.axis} aria-hidden="true">
              <span className={s.tick}>{axis[0]}</span>
              <span className={s.axisLine} />
              <span className={s.tick}>{axis[1]}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
