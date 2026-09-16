'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import MegaPanel from './MegaPanel'
import { Calculator, Close, Menu, PixelArrow, User } from './Icons'
import { prefersReducedMotion } from '@/lib/motion'
import type { NavItem } from '@/lib/types'
import s from './Nav.module.css'

type Props = { items: NavItem[] }

/**
 * The floating pill bar.
 *
 * Sits 40px inside the frame over the hero, matching the comp. Two behaviours
 * beyond the static design: it retracts on the way down and returns on the way
 * up, so the bar is never between the reader and the page; and it carries a
 * second palette for light ground (Figma `1589:2330`), swapped in whenever the
 * pill row is over a section that declares itself light.
 *
 * That declaration is `.on-light`, which most light sections already carry for
 * their eyebrow ink, plus `[data-nav-light]` for the ones that don't want the
 * eyebrow behaviour — Stats, Strings and the Statement's white plate. The probe
 * is a single y: the pill row's own middle, 44px down, which is what has to
 * stay legible.
 */
export default function Nav({ items: all }: Props) {
  /* Filtered once, above both renders: the bar and the sheet map the same list
     and hiding an item in one but not the other is exactly the bug that would
     never be noticed on a desktop. `openIdx` indexes this array too, so the
     filter has to happen before it, not inside the map. */
  const items = all.filter((i) => !i.hidden)

  const bar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  /* Light ground under the bar. State rather than a class flip, because the
     logo swaps plate as well — it is written only on a real change, so the
     re-render happens a handful of times a page rather than every frame. */
  const [onLight, setOnLight] = useState(false)
  const wasLight = useRef(false)
  /* Pending close. See `closeMenu`. */
  const leaving = useRef<number | null>(null)

  useEffect(() => {
    const el = bar.current
    if (!el) return
    if (prefersReducedMotion()) return

    let prev = window.scrollY
    let ticking = false
    /* Travel accumulated since the last direction change. Flipping on the
       raw per-frame delta is what makes the bar stutter: a smooth-scrolled
       page reverses sign constantly, so the bar starts returning, gets told
       to leave again two frames later, and judders against the scroll.
       Leaving needs almost no evidence; coming back needs a real, sustained
       upward gesture. */
    let down = 0
    let up = 0

    const LEAVE_AFTER = 10   // px of downward travel before it retracts
    const RETURN_AFTER = 110 // px of upward travel before it comes back
    const PROBE = 44         // the pill row's middle: 19px of padding + half of 50

    /* The page is static once mounted, so the list is read once. */
    const lights = Array.from(document.querySelectorAll('.on-light, [data-nav-light]'))

    const update = () => {
      ticking = false
      const y = window.scrollY
      const d = y - prev
      prev = y

      const light = lights.some((n) => {
        const r = n.getBoundingClientRect()
        return r.top <= PROBE && r.bottom >= PROBE
      })
      if (light !== wasLight.current) { wasLight.current = light; setOnLight(light) }

      // Over the hero the bar always sits with the page.
      if (y < 320) {
        down = up = 0
        el.classList.remove(s.away)
        return
      }
      if (open) return

      if (d > 0) { down += d; up = 0; if (down > LEAVE_AFTER) el.classList.add(s.away) }
      else if (d < 0) { up -= d; down = 0; if (up > RETURN_AFTER) el.classList.remove(s.away) }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  // Body scroll lock while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* ── The dropdowns ──────────────────────────────────────────────────────
     Opening is immediate; closing waits a beat. Two reasons, and neither is
     decoration: the pointer has to cross a 6px seam to reach the panel (the
     CSS bridges it, but a fast diagonal can still clip the corner), and moving
     from one trigger to the next should slide the menu across rather than shut
     it and reopen it. 120ms is under the ~150ms at which a delay starts to
     feel like lag. */
  const openMenu = (i: number) => {
    if (leaving.current !== null) { clearTimeout(leaving.current); leaving.current = null }
    setOpenIdx(i)
  }
  const closeMenu = () => {
    if (leaving.current !== null) clearTimeout(leaving.current)
    leaving.current = window.setTimeout(() => { setOpenIdx(null); leaving.current = null }, 120)
  }
  const closeMenuNow = () => {
    if (leaving.current !== null) { clearTimeout(leaving.current); leaving.current = null }
    setOpenIdx(null)
  }

  useEffect(() => () => { if (leaving.current !== null) clearTimeout(leaving.current) }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); closeMenuNow() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header ref={bar} className={`${s.bar} ${onLight ? s.light : ''}`}>
        <nav className={s.inner} aria-label="Primary">
          {/* Two faces of a cube. The link itself carries the accessible name,
              so both plates are decoration. */}
          <Link href="/" className={s.logo} aria-label="Hubble Energy — home">
            <span className={s.cube} aria-hidden="true">
              <span className={`${s.face} ${s.faceFront}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={onLight ? '/logo/Logo2_onLight.svg' : '/logo/Logo2.svg'} alt="" width={95} height={50} />
              </span>
              <span className={`${s.face} ${s.faceSide}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo/Logo2_darker.svg" alt="" width={95} height={50} />
              </span>
            </span>
          </Link>

          <ul className={s.items}>
            {items.map((item, i) => (
              <li
                key={item.label}
                className={s.item}
                onMouseEnter={() => openMenu(i)}
                onMouseLeave={closeMenu}
                /* focusin/focusout bubble, so these catch the trigger and
                   everything in the panel — which is what lets the menu open
                   for a keyboard as well as a pointer. */
                onFocus={() => openMenu(i)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeMenu()
                }}
              >
                <Link
                  href={item.href}
                  className={s.link}
                  aria-expanded={item.children || item.mega ? openIdx === i : undefined}
                >
                  <span>{item.label}</span>
                  {item.children || item.mega ? <PixelArrow dir="down" cell={3} className={s.caret} /> : null}
                </Link>

                {/* The wide panel when the item has one, the list when it
                    doesn't. Both stay inside this `<li>`: the open and close
                    handlers are on it, so a panel rendered as its sibling would
                    fire `mouseleave` the moment the pointer reached it. */}
                {item.mega ? (
                  <MegaPanel mega={item.mega} open={openIdx === i} />
                ) : item.children ? (
                  /* `inert` while shut. `opacity: 0` hides a panel from the eye
                     but not from the tab order — five links a menu deep were
                     still focus stops, which is how you tab into a nav and
                     watch the focus ring vanish into nothing. */
                  <div
                    className={`${s.panel} ${openIdx === i ? s.panelOpen : ''}`}
                    inert={openIdx !== i}
                  >
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.label}>
                          <Link href={c.href} className={s.sub}>
                            <span className={s.subLabel}>{c.label}</span>
                            <PixelArrow className={s.subArrow} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <div className={s.actions}>
            {/* On light ground the plate inverts — blue with pale type, per the
                comp. `primary` rather than an override of `light`, because the
                variant also owns the hover wipe: a `light` button wipes to
                blue-200, which under pale type would erase the label. */}
            <Button
              href="/calculate-your-savings"
              variant={onLight ? 'primary' : 'light'}
              chevron={false}
              icon={<Calculator />}
              iconAfter
              className={s.calc}
            >
              Calculate your savings
            </Button>
            <Button href="/contact" variant="accent" chevron={false} className={s.touch}>
              Get In touch
            </Button>
            <Link href="/account" className={s.account}>
              <User />
              {/* Clipped rather than removed, so the link keeps "Login" as its
                  accessible name while it is collapsed to the mark. */}
              <span className={s.accountLabel}>Login</span>
            </Link>
            <button
              className={s.burger}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div className={`${s.sheet} ${open ? s.sheetOpen : ''}`} hidden={!open}>
        <ul className={s.sheetList}>
          {items.map((item, i) => (
            <li key={item.label} style={{ ['--i' as string]: String(i) }}>
              <Link href={item.href} onClick={() => setOpen(false)} className={s.sheetLink}>
                {item.label}
              </Link>
              {item.children ? (
                <ul className={s.sheetSubs}>
                  {item.children.map((c) => (
                    <li key={c.label}>
                      <Link href={c.href} onClick={() => setOpen(false)} className={s.sheetSub}>{c.label}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
        <div className={s.sheetActions}>
          <Button href="/calculate-your-savings" variant="light" icon={<Calculator />} iconAfter chevron={false}>
            Calculate your savings
          </Button>
          <Button href="/contact" variant="accent" chevron={false}>Get In touch</Button>
        </div>
      </div>
    </>
  )
}
