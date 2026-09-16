'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import Button from '../Button'
import Reveal from '../Reveal'
import RuleLink from '../RuleLink'
import { onExit, prefersReducedMotion } from '@/lib/motion'
import s from './ImageHero.module.css'

type Props = {
  eyebrow: string
  title: string
  copy: string
  image: { src: string; alt: string }
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

/**
 * The standard hero for the pages below the landing page: one photograph, the
 * copy over its pale top third, and a 400px fade to brand blue at the foot so
 * the section hands over to the blue band beneath it with no seam. That fade is
 * the same device the landing page's sequence hero closes on — it is what makes
 * a still photograph and a scrubbed canvas read as the same masthead.
 *
 * ── Parallax ────────────────────────────────────────────────────────────────
 * The photograph is taller than the section and rises through it as the reader
 * scrolls, so the frame acts as a window onto a moving image rather than a box
 * with a picture in it.
 *
 * Three things make it behave:
 *
 * 1. It runs on the shared ticker (`onExit` → `onFrame`), not its own rAF and
 *    not a scroll listener. One clock for the whole page.
 * 2. `--p` is written to the section, and the transform is CSS. Nothing here
 *    reads layout, so the handler never forces a reflow.
 * 3. `onExit` guarantees the end states. A hero flicked past in one fast
 *    scroll still finishes its travel instead of freezing at whatever value the
 *    last frame happened to write — the trap every scrubbed animation in this
 *    codebase has fallen into at least once.
 *
 * ── Why `onExit` and not `onScrub` ──────────────────────────────────────────
 * A masthead sits at the top of the document, so the reader can only ever
 * scroll it *away*. On `scrubProgress`' ramp — whose span is `viewport +
 * element` — a section resting at scroll 0 already reads about 0.5, so the
 * whole lower half of the ramp is unreachable and the hero delivers half the
 * travel its plate has been grown to allow. Measured on this page it was worse
 * than half: 23px of the 56px allowed, because on a tall viewport the ramp
 * starts higher still. `exitProgress` is 0 at the top of the page and 1 when
 * the section has fully left, on every viewport, so every pixel of extra plate
 * is spent as movement.
 *
 * The travel is `--lift`, and the plate is grown by `--head + --lift`: the
 * headroom is what the image rests offset by, the lift is what it then travels,
 * and together they are the amount of photograph the frame must never run out
 * of. See the CSS for what the lift costs.
 */
export default function ImageHero({ eyebrow, title, copy, image, primary, secondary }: Props) {
  const sec = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sec.current
    if (!el) return
    /* 0 is the resting frame — the comp's crop exactly — which is also the
       CSS fallback, so a no-JS render and a reduced-motion one agree. */
    if (prefersReducedMotion()) { el.style.setProperty('--p', '0'); return }
    return onExit(el, (p) => el.style.setProperty('--p', String(p)))
  }, [])

  return (
    /* `data-nav-light` rather than `.on-light`: the nav's probe at y=44 lands on
       the photograph's pale sky, so the bar wants its deep-navy palette — but
       this section's eyebrow is brand blue, not the cyan `.on-light` would
       hand it. The two concerns are separate and the comp splits them here. */
    <section ref={sec} className={s.sec} data-nav-light aria-labelledby="hero-title">
      <div className={s.media}>
        <Image
          className={s.img}
          src={image.src}
          alt={image.alt}
          width={2400}
          height={1436}
          priority
          fetchPriority="high"
          /* Not 100vw: the plate is grown for the parallax and `cover` fills
             that height by overscaling the width, so the element is about
             122vw across wherever the height drives the crop (below ~1780px)
             and 100vw above it. The larger hint is right in the first case and
             harmless in the second — 122vw of 1920 still resolves to the
             widest candidate the 2400px source can produce. */
          sizes="122vw"
        />
      </div>

      {/* The hand-off. A 400px linear fade from transparent to the brand blue
          the next section opens on, so there is no visible edge between them. */}
      <div className={s.fade} aria-hidden="true" />

      <div className={`wrap ${s.inner}`}>
        <Reveal variant="mask" className={s.head}>
          <p className="t-eyebrow">{eyebrow}</p>
          <h1 id="hero-title" className={`t-h2 ${s.title}`}>{title}</h1>
          <p className={`${s.copy}`}>{copy}</p>
        </Reveal>

        <Reveal delay={0.14} className={s.actions}>
          <Button href={primary.href} variant="light">{primary.label}</Button>
          <RuleLink label={secondary.label} href={secondary.href} className={s.more} />
        </Reveal>
      </div>
    </section>
  )
}
