'use client'

import { ArrowButton } from '../Button'
import PixelCard from '../PixelCard'
import Reveal from '../Reveal'
import type { Stat } from '@/lib/types'
import s from './Stats.module.css'

/**
 * The four proof cards.
 *
 * Each is a solid blue plate at rest. On hover the ground darkens and React
 * Bits' PixelCard scatters brand-coloured pixels across it from the centre
 * outward — the same pixel language as the dissolve bands, arriving as an
 * effect rather than a transition.
 *
 * The canvas sits behind the content and takes no pointer events, so the ring
 * stays clickable and the card keeps working with the effect disabled.
 *
 * Hover also fades a glyph up in the bottom-right corner — one per stat, keyed
 * off `stat.icon`. It sits under the canvas, so the pixels scatter across it.
 */
export default function Stats({ items }: { items: Stat[] }) {
  return (
    <section className={s.sec} data-nav-light aria-label="Hubble by the numbers">
      {/* Named because Products' circuit run finishes drawing exactly as the
          top row of cards arrives — it anchors its scrub to this element. */}
      <ul id="stats-grid" className={`wrap ${s.grid}`}>
        {items.map((stat, i) => (
          <Reveal
            as="li"
            key={stat.label}
            delay={(i % 2) * 0.08 + Math.floor(i / 2) * 0.06}
            className={s.cell}
          >
            <PixelCard variant="hubble" className={s.card}>
              <span className={`${s.icon} ${s[stat.icon]}`} aria-hidden="true" />
              <p className={`num ${s.value}`}>{stat.value}</p>
              <p className={s.label}>{stat.label}</p>
              <ArrowButton
                href={stat.href}
                label={`${stat.label} — read more`}
                tone="onBlue"
                className={s.arrow}
              />
            </PixelCard>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
