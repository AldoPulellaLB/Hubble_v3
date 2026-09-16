'use client'

import { useEffect, useRef, useState } from 'react'
import StringsViewport from '@/lib/strings-effect'
import s from './Strings.module.css'

/** Below this the section is not rendered at all — see the note on gating. */
const MIN_WIDTH = 768

/**
 * The interactive strings field.
 *
 * The engine is the supplied one (`lib/strings-effect.js`), driven from a ref.
 * It reaches for `.strings-canvas`, `.labels-layer` and `.fx-cursor` by those
 * literal names and creates its own `.keyword-label` elements, so those class
 * names stay unhashed here and the stylesheet targets them through `:global`.
 *
 * Gating is done in JS, not only in CSS. `display: none` would still leave a
 * requestAnimationFrame loop drawing to a canvas every frame on a phone —
 * invisible, but burning battery. Not mounting is the only real off switch.
 * The same applies to reduced motion: this is a continuous ambient animation
 * with no still state worth showing, so it is withheld rather than frozen.
 */
export default function Strings() {
  const host = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(wide.matches && !still.matches)

    sync()
    wide.addEventListener('change', sync)
    still.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      still.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !host.current) return
    const engine = new StringsViewport(host.current, {
      color: '#1748DF',
      rotationSeconds: 220,
      labelFadeMs: 2700,
      labelHoldMs: 5800,
      labelStaggerMs: 900,
      labelGapMs: 1150,
      centerPulsePeriod: 1.75,
      centerPulseLifetime: 1.9,
      centerPulseStrength: 18,
    })
    return () => engine.destroy()
  }, [enabled])

  if (!enabled) return null

  return (
    <section className={s.sec} data-nav-light aria-hidden="true">
      <div ref={host} className={s.viewport}>
        <canvas className="strings-canvas" />
        <div className="labels-layer" />
        <div className="fx-cursor">
          <span className="fx-cursor__ring" />
          <span className="fx-cursor__dot" />
        </div>
      </div>
    </section>
  )
}
