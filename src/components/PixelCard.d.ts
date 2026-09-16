import type { HTMLAttributes, ReactNode } from 'react'

/** Types for the vendored JS component. Everything but `children` is optional;
 *  each falls back to the chosen variant's own value. Anything else a div
 *  accepts is passed straight through to the container. */
export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blue' | 'yellow' | 'pink' | 'hubble' | 'barBlue' | 'barGreen'
  gap?: number
  speed?: number
  colors?: string
  noFocus?: boolean
  /** Drives the effect from state instead of from hover/focus. Passing it at
   *  all takes over from the pointer: `true` scatters the pixels in, `false`
   *  takes them back out, and the hover handlers are not attached. */
  active?: boolean
  className?: string
  children?: ReactNode
}

export default function PixelCard(props: PixelCardProps): JSX.Element
