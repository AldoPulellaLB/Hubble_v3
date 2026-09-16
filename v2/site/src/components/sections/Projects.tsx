'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowRing } from '../Button'
import Reveal from '../Reveal'
import { onScrub, prefersReducedMotion } from '@/lib/motion'
import type { Project } from '@/lib/types'
import s from './Projects.module.css'
import ScrollRevealTitle from '../ScrollRevealTitle'

type Props = { eyebrow: string; title: string; items: Project[] }

/* The comp staggers the row rather than aligning it. Repeating four-step
   pattern, in px on the 1440 frame. The deepest step is mirrored in the CSS as
   --stagger-max, which is how much room the rail leaves below the track for it
   and its shadow — raise a step here and that has to follow. */
const STAGGER = [60, 0, 130, 40]

/**
 * The project rail.
 *
 * A real horizontal scroller — native overflow, snap points, wheel and touch —
 * rather than a pinned hijack, so it stays operable by keyboard and does not
 * take the page's scroll away from the reader. Drag-to-pan is layered on for
 * pointer devices, and each card carries a small vertical parallax keyed to
 * page scroll so the stagger breathes as the section passes.
 */
export default function Projects({ eyebrow, title, items }: Props) {
  const rail = useRef<HTMLDivElement>(null)
  const sec = useRef<HTMLElement>(null)

  /* Drag to pan. */
  useEffect(() => {
    const el = rail.current
    if (!el) return

    let down = false
    let startX = 0
    let startLeft = 0
    let moved = 0

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return   // native touch scrolling is better
      down = true; moved = 0
      startX = e.clientX
      startLeft = el.scrollLeft
      el.setPointerCapture(e.pointerId)
      el.classList.add(s.dragging)
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - startX
      moved = Math.max(moved, Math.abs(dx))
      el.scrollLeft = startLeft - dx
    }
    const onUp = (e: PointerEvent) => {
      if (!down) return
      down = false
      el.releasePointerCapture(e.pointerId)
      el.classList.remove(s.dragging)
      // Swallow the click that ends a real drag, keep it for a plain click.
      if (moved > 6) {
        const kill = (ev: Event) => { ev.preventDefault(); ev.stopPropagation() }
        el.addEventListener('click', kill, { capture: true, once: true })
        setTimeout(() => el.removeEventListener('click', kill, { capture: true }), 0)
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [])

  /* ── Auto-advance ───────────────────────────────────────────────────────────
     Steps the rail one card at a time when nobody is touching it, holds three
     seconds on each, and runs back to the first once the last is reached.

     Written as a rAF tween over `scrollLeft` rather than
     `scrollTo({ behavior: 'smooth' })`, because the native smooth scroll gives
     no control over either curve or duration — it is UA-defined and differs
     between engines, and a rail that advances at a different pace in Safari is
     not a designed movement. `easeInOutCubic` accelerates and decelerates
     symmetrically, which is what makes a card-to-card step read as soft rather
     than as a snap; the house `--ease-out` would be wrong here, being an expo
     curve that covers most of the distance in the first 100ms.

     **It never listens to `scroll`.** The tween writes `scrollLeft` every
     frame, so treating scroll as interaction would make it interrupt itself on
     the first frame. Only real input events count — wheel, touch, pointer,
     keyboard — which is the one thing that has to be right for an autoplay to
     coexist with a scroller the reader can also drive. */
  useEffect(() => {
    const el = rail.current
    const section = sec.current
    if (!el || !section) return
    if (prefersReducedMotion()) return

    const HOLD = 3000    // parked on a card
    const STEP = 820     // one card to the next
    const REWIND = 1500  // the whole way back to the first
    const IDLE = 4000    // quiet needed before it picks up again

    let timer = 0
    let raf = 0
    let hovering = false
    let inView = false

    /* The scroll offset that brings each card to where the first one rests.
       Read fresh every step: the cards restagger and the rail re-measures on
       resize, and a cached list would send it to last week's positions.

       The tail needs tidying, and it is not cosmetic. Every card's offset is
       clamped to `max`, so the last two or three collapse onto the same value —
       raw, this rail gives `[0, 475, 950, 1426, 1901, 1926, 1926]`. Left alone
       the row finishes with a 25px twitch and a three-second hold on it, which
       reads as a stall rather than as a step. So near-duplicates are dropped and
       a final stop that is within a fraction of a step of the end is pulled onto
       the end itself: `[0, 475, 950, 1426, 1926]`, every move a real one. */
    const stops = () => {
      const cells = [...el.querySelectorAll<HTMLLIElement>('li')]
      const max = el.scrollWidth - el.clientWidth
      if (!cells.length) return { list: [0], max }
      const base = cells[0].offsetLeft

      const list: number[] = []
      for (const n of cells) {
        const v = Math.min(n.offsetLeft - base, max)
        if (!list.length || v - list[list.length - 1] > 40) list.push(v)
      }
      const last = list[list.length - 1]
      if (last < max - 1) {
        if (max - last < 120) list[list.length - 1] = max
        else list.push(max)
      }
      return { list, max }
    }

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const glide = (to: number, ms: number) => {
      const from = el.scrollLeft
      const d = to - from
      if (Math.abs(d) < 1) { schedule(); return }
      /* Snap off for the duration. `scroll-snap-type: x proximity` re-evaluates
         on every rest, and a tween writing a new offset each frame gives it a
         rest to argue with. */
      el.classList.add(s.gliding)
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms)
        el.scrollLeft = from + d * ease(t)
        if (t < 1) { raf = requestAnimationFrame(tick); return }
        el.classList.remove(s.gliding)
        schedule()
      }
      raf = requestAnimationFrame(tick)
    }

    const step = () => {
      /* Re-check rather than bail: the reader may have parked the pointer on a
         card, and this has to pick up again when they move it away without
         needing an event to tell it so. */
      if (hovering || !inView) { schedule(); return }
      const { list, max } = stops()
      if (max <= 1) { schedule(); return }
      const here = el.scrollLeft
      if (here >= max - 2) { glide(0, REWIND); return }
      glide(list.find(v => v > here + 2) ?? max, STEP)
    }

    const schedule = (ms = HOLD) => {
      clearTimeout(timer)
      timer = window.setTimeout(step, ms)
    }

    /* Any real input stops it dead and buys the reader IDLE of quiet. */
    const interrupt = () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      el.classList.remove(s.gliding)
      schedule(IDLE)
    }

    const onEnter = () => { hovering = true; interrupt() }
    const onLeave = () => { hovering = false; schedule(IDLE) }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('wheel', interrupt, { passive: true })
    el.addEventListener('touchstart', interrupt, { passive: true })
    el.addEventListener('pointerdown', interrupt)
    el.addEventListener('keydown', interrupt)
    el.addEventListener('focusin', onEnter)
    el.addEventListener('focusout', onLeave)

    /* Off screen it does nothing at all — a rail that has quietly advanced four
       cards while the reader was elsewhere has thrown its own opening away. */
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting }, { threshold: 0.25 })
    io.observe(section)

    schedule()

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      io.disconnect()
      el.classList.remove(s.gliding)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('wheel', interrupt)
      el.removeEventListener('touchstart', interrupt)
      el.removeEventListener('pointerdown', interrupt)
      el.removeEventListener('keydown', interrupt)
      el.removeEventListener('focusin', onEnter)
      el.removeEventListener('focusout', onLeave)
    }
  }, [])

  /* Parallax on the stagger. */
  useEffect(() => {
    const el = sec.current
    if (!el) return
    if (prefersReducedMotion()) return

    return onScrub(el, (q) => el.style.setProperty('--p', String(q)))
  }, [])

  return (
    <section ref={sec} className={`on-light ${s.sec}`} aria-labelledby="projects-title">
      <div className={`wrapIn ${s.head}`}>
        <Reveal variant="mask">
          <p className="t-eyebrow">{eyebrow}</p>
          <h2 id="projects-title" className={`t-h2 ${s.title}`}>
              <ScrollRevealTitle>{title}</ScrollRevealTitle>
            </h2>
        </Reveal>
      </div>

      <div ref={rail} className={s.rail} tabIndex={0} aria-label="Projects — scroll horizontally">
        <ul className={s.track}>
          {items.map((p, i) => (
            <li
              key={p.name}
              className={s.cell}
              style={{ ['--offset' as string]: `${STAGGER[i % STAGGER.length]}px` }}
            >
              <Link href={p.href} className={s.card}>
                {/* One surface, layered rather than turned. The photograph is
                    the floor; the map plate sits on top of it and slides up on
                    hover to uncover it, taking the title with it. The chip,
                    the figure and the ring are siblings of the plate rather
                    than passengers on it, so they hold their positions
                    throughout. */}
                <span className={s.surface}>
                  <Image
                    className={s.photo}
                    src={p.photo}
                    alt=""
                    width={870}
                    height={980}
                    sizes="(max-width: 767px) 78vw, 30vw"
                  />
                  <span className={s.scrim} />

                  <span className={s.plate}>
                    <Image
                      className={s.map}
                      src={p.map}
                      alt=""
                      width={763}
                      height={753}
                      sizes="(max-width: 767px) 78vw, 30vw"
                    />
                  </span>

                  <span className={s.chip}>{p.sector}</span>
                  {/* The band is the title's travel. See the note in the CSS. */}
                  <span className={s.nameBand}>
                    <span className={`t-h3 ${s.name}`}>{p.name}</span>
                  </span>
                  <span className={s.figure}>{p.figure}</span>
                  <ArrowRing className={s.go} tone="solid" size="lg" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
