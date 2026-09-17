'use client'

import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import RevealText from './RevealText'
import { PixelArrow } from './Icons'
import { clamp, onFrame, prefersReducedMotion } from '@/lib/motion'
import { HERO_READY } from './Preloader'
import s from './SequenceHero.module.css'

export type Beat = { frame: number; eyebrow: string; title: string; copy: string }

/** One number when both renders share a length, or one per variant when they
 *  don't — the desktop and mobile sequences are separate exports and have no
 *  reason to agree. A bare number is read as "the same for both". */
export type FrameCount = number | { desktop: number; mobile: number }

/** Where the frames live under `public/`, without leading or trailing slashes.
 *  One directory when both variants share a render, one per variant when they
 *  don't. A string, not a function, because the pages that pass this are server
 *  components and a function cannot cross that boundary. */
export type FrameDir = string | { desktop: string; mobile: string }

/* Both variants share Hubble's own 422-frame desktop render. The separate
   mobile set was ON.energy's artwork and has been removed; a mobile cut
   should be rendered from the Hubble source and split back out here. */
const LANDING_FRAMES: FrameDir = 'sequence/desktop'

type Props = {
  frames: FrameCount
  /** Defaults to the landing page's own set, so its call site is unchanged. */
  dir?: FrameDir
  beats: Beat[]
  /** The comp's row under the nav: a section label left, a standing line right.
   *  Omitted on the landing page, which puts its eyebrow in the beat instead. */
  labels?: [string, string]
  poster: string
  scrollHint: string
  primary: { label: string; href: string }
  /** The ghost button beside the primary. Omit it and the hero runs on the
   *  primary alone — the landing page does, high voltage still carries one. */
  secondary?: { label: string; href: string }
}

const MOBILE_BREAK = 834

/**
 * The scroll-scrubbed frame sequence — carried over from v1 unchanged in
 * mechanism, re-skinned to the new hero.
 *
 *  · frames fetched in a Web Worker, decoded to Image objects
 *  · drawn to one canvas (alpha:false, desynchronized) on the shared rAF
 *  · section pinned for 350lvh; frame index mapped from pin progress
 *  · copy beats keyed to frame number, not scroll percentage
 *  · reduced motion / no-JS falls back to a single poster frame
 *
 * The rule that makes it feel solid: `draw()` falls back to the nearest
 * already-decoded frame, so a partly-loaded sequence never shows an empty
 * canvas and never stalls the scrub.
 *
 * Frame files must be `frame_000.webp` upward — zero-based, three-digit and
 * contiguous — under whatever `dir` names. Exports rarely arrive that way; run
 * `node scripts/normalise-sequence.mjs public/sequence/<variant>` over a new
 * one. Get it wrong and index 0 is a 404 and `ready` never flips — and since
 * frame 0 is also what fires `HERO_READY`, the site-wide preloader then holds
 * until its own MAX_MS ceiling rather than opening on the render.
 *
 * This component has no loading UI of its own. It used to carry a
 * "Loading sequence N%" bar; `components/Preloader.tsx` now covers the whole
 * site until this hero says frame 0 is decoded, so the bar only ever sat
 * behind it.
 */
export default function SequenceHero({
  frames, dir = LANDING_FRAMES, beats, labels, poster, scrollHint, primary, secondary,
}: Props) {
  const desktopCount = typeof frames === 'number' ? frames : frames.desktop
  const mobileCount = typeof frames === 'number' ? frames : frames.mobile
  const desktopDir = typeof dir === 'string' ? dir : dir.desktop
  const mobileDir = typeof dir === 'string' ? dir : dir.mobile

  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  /* The variant is only knowable in the browser, so the first paint assumes
     desktop; the effect corrects it before any frame arrives. */
  const [total, setTotal] = useState(desktopCount)
  const [frame, setFrame] = useState(0)
  const [ready, setReady] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const el = section.current
    const cv = canvas.current
    if (!el || !cv) return

    if (prefersReducedMotion()) {
      setReduced(true); setReady(true)
      /* No frames to wait for under reduced motion — the poster is the hero.
         Announce immediately or the preloader sits on its minimum. */
      window.dispatchEvent(new Event(HERO_READY))
      return
    }

    const variant = window.innerWidth < MOBILE_BREAK ? 'mobile' : 'desktop'
    const frames = variant === 'mobile' ? mobileCount : desktopCount
    const base = variant === 'mobile' ? mobileDir : desktopDir
    setTotal(frames)
    const images: (HTMLImageElement | null)[] = new Array(frames).fill(null)
    const ctx = cv.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return

    let disposed = false
    let lastDrawn = -1
    let lastWanted = -1
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(window.innerWidth * dpr)
      cv.height = Math.round(window.innerHeight * dpr)
      cv.style.width = `${window.innerWidth}px`
      cv.style.height = `${window.innerHeight}px`
      lastDrawn = -1
    }

    /* object-fit: cover, by hand */
    const paint = (img: HTMLImageElement) => {
      const cw = cv.width, ch = cv.height
      if (cw <= 0 || ch <= 0) return false
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
      return true
    }

    /** Draw frame `i`, else the nearest decoded neighbour. */
    const draw = (i: number) => {
      const exact = images[i]
      if (exact?.complete && exact.naturalWidth) return paint(exact)
      for (let d = 1; d < frames; d++) {
        const a = images[i - d]
        if (a?.complete && a.naturalWidth) return paint(a) && false
        const b = images[i + d]
        if (b?.complete && b.naturalWidth) return paint(b) && false
      }
      return false
    }

    const worker = new Worker('/image-worker.js')
    const objectUrls: string[] = []

    worker.onmessage = (e: MessageEvent<{ blob?: Blob; index: number }>) => {
      if (disposed) return
      const { blob, index } = e.data
      if (!blob) return
      const url = URL.createObjectURL(blob)
      objectUrls.push(url)
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        images[index] = img
        if (index === 0) {
          setReady(true); lastDrawn = -1
          /* Frame 0 is the first thing the canvas can actually paint, so it is
             the honest moment to let the preloader open. */
          window.dispatchEvent(new Event(HERO_READY))
        }
        else if (index === lastWanted) lastDrawn = -1
      }
      img.src = url
    }

    for (let i = 0; i < frames; i++) {
      worker.postMessage({ imageUrl: `/${base}/frame_${String(i).padStart(3, '0')}.webp`, index: i })
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const stop = onFrame(() => {
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? clamp(-r.top / total) : 0
      const idx = Math.min(frames - 1, Math.round((frames - 1) * p))
      lastWanted = idx

      if (idx !== lastDrawn) {
        if (r.bottom > 0 && r.top < window.innerHeight) {
          if (draw(idx)) lastDrawn = idx
        }
        setFrame(idx)
      }
    })

    return () => {
      disposed = true
      stop()
      worker.terminate()
      window.removeEventListener('resize', resize)
      objectUrls.forEach(URL.revokeObjectURL)
    }
  }, [desktopCount, mobileCount, desktopDir, mobileDir])


  /* The active beat by index, not just by value: the headline reveal needs the
     beat's own span, which means knowing which beat follows it. */
  let bi = 0
  for (let i = 0; i < beats.length; i++) if (frame >= beats[i].frame) bi = i
  const active = beats[bi] ?? beats[0]
  const progress = total > 1 ? frame / (total - 1) : 0

  /* 0–1 across the active beat alone. The last beat runs to the final frame.
     This, not the section's rect, is what drives the headline reveal — the pin
     holds the copy still, so there is no rect travel to read. */
  const beatFrom = active?.frame ?? 0
  const beatTo = beats[bi + 1]?.frame ?? total - 1
  const beatP = beatTo > beatFrom ? clamp((frame - beatFrom) / (beatTo - beatFrom)) : 1

  return (
    <section ref={section} className={s.section} aria-label="Hubble Energy — power keeps life in motion">
      <div className={s.pin}>
        <div className={s.scene}>
          {reduced ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.poster} src={poster} alt="" aria-hidden="true" />
          ) : (
            <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
          )}
          {/* Sits over the render and under the scrim, so the foot of the
              hero is the scrim's blue over a darkened frame rather than over
              the raw one. */}
          <div className={s.tint} aria-hidden="true" />
          <div className={s.scrim} aria-hidden="true" />
        </div>

        {labels ? (
          <p className={`wrap ${s.labels}`}>
            <span>{labels[0]}</span>
            <span>{labels[1]}</span>
          </p>
        ) : null}

        <div className={`wrap ${s.content}`}>
          <div className={s.copy} key={active?.title}>
            {/* Conditional: a page whose comp puts its label in the `labels`
                row above has nothing to say here, and an empty `<p>` would
                still carry the eyebrow's margin under the heading. */}
            {active?.eyebrow ? (
              <p className={`t-eyebrow ${s.eyebrow}`}>{active.eyebrow}</p>
            ) : null}
            {/* The first beat is already on screen when the page arrives, with
                no scroll behind it, so it plays its reveal on mount; the beats
                after it scrub against their own span of the sequence. */}
            <h1 className={`t-display ${s.title}`}>
              <RevealText progress={reduced ? 1 : beatP} mode={bi === 0 ? 'mount' : 'scroll'}>
                {active?.title ?? ''}
              </RevealText>
            </h1>
            <p className={`t-lead ${s.lead}`}>{active?.copy}</p>
          </div>

          <div className={s.actions}>
            {/* `light`, the nav bar's own treatment: white plate, blue label —
                and the variant already carries a blue chevron. */}
            <Button href={primary.href} variant="light">{primary.label}</Button>
            {secondary && (
              <Button href={secondary.href} variant="ghost">{secondary.label}</Button>
            )}
          </div>
        </div>

        <div className={`wrap ${s.hud}`} aria-hidden="true">
          <span className={s.track}>
            <span className={s.fill} style={{ transform: `scaleX(${progress})` }} />
          </span>
          <span className={s.hint}>{scrollHint}</span>
          <span className={s.caret}><PixelArrow dir="down" cell={3} /></span>
        </div>
      </div>
    </section>
  )
}
