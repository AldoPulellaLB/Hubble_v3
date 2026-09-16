'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { PixelArrow } from './Icons'
import s from './Button.module.css'

type Variant =
  | 'primary'   /* blue fill — the page's default action        */
  | 'accent'    /* green fill — one per screen, "Get in touch"  */
  | 'light'     /* white fill, blue label — over dark imagery   */
  | 'ghost'     /* translucent, borrows the surface beneath it  */
  | 'onBlue'    /* translucent dark, for use on the blue panels */

type Props = {
  children: ReactNode
  href?: string
  onClick?: () => void
  /** `submit` for the button that submits a form — the default cannot, and a
   *  form whose only button is `type="button"` looks fine and does nothing. */
  type?: 'button' | 'submit'
  variant?: Variant
  /** The wedge after the label. Off for lockups that carry their own mark. */
  chevron?: boolean
  /** A leading glyph — the calculator on "Calculate your savings". */
  icon?: ReactNode
  /** Puts the icon after the label instead, as the nav CTA does. */
  iconAfter?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * The comp's button: a 10px-radius rectangle, Montserrat label, and a small
 * wedge that steps forward on hover. The fill is wiped in from the left by a
 * pseudo-element rather than transitioned, so the hover reads as a charge
 * crossing the button rather than a colour change.
 */
export default function Button({
  children, href, onClick, type = 'button', variant = 'primary',
  chevron = true, icon, iconAfter = false, className = '', ariaLabel,
}: Props) {
  const cls = [s.btn, s[variant], className].filter(Boolean).join(' ')

  const inner = (
    <>
      <span className={s.wipe} aria-hidden="true" />
      {icon && !iconAfter ? <span className={s.icon}>{icon}</span> : null}
      <span className={s.label}>{children}</span>
      {icon && iconAfter ? <span className={s.icon}>{icon}</span> : null}
      {chevron ? <PixelArrow className={s.chev} /> : null}
    </>
  )

  if (href) {
    const external = /^https?:/.test(href)
    return external ? (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>{inner}</a>
    ) : (
      <Link className={cls} href={href} aria-label={ariaLabel}>{inner}</Link>
    )
  }
  return <button className={cls} onClick={onClick} type={type} aria-label={ariaLabel}>{inner}</button>
}

/* ── Circular arrow ─────────────────────────────────────────── */

type ArrowProps = {
  href?: string
  label: string
  /** 'hairline' on light grounds, 'solid' white on the project cards. */
  tone?: 'hairline' | 'solid' | 'onBlue'
  size?: 'sm' | 'lg'
  className?: string
}

const wedges = <PixelArrow className={s.arrowChev} />

/** The repeated affordance: a ring with a wedge that travels on hover. */
export function ArrowButton({ href = '#', label, tone = 'hairline', size = 'sm', className = '' }: ArrowProps) {
  return (
    <Link href={href} aria-label={label} className={`${s.arrow} ${s[tone]} ${s[`a_${size}`]} ${className}`}>
      {wedges}
    </Link>
  )
}

/**
 * The same ring as a span, for use inside a surface that is already a link —
 * a nested anchor is invalid HTML and breaks hydration. The row or card owns
 * the target; this only has to look like the affordance and react to the
 * parent's hover.
 */
export function ArrowRing({ tone = 'hairline', size = 'sm', className = '' }: Omit<ArrowProps, 'href' | 'label'>) {
  return (
    <span aria-hidden="true" className={`${s.arrow} ${s[tone]} ${s[`a_${size}`]} ${className}`}>
      {wedges}
    </span>
  )
}
