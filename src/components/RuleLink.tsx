import Link from 'next/link'
import { PixelArrow } from './Icons'
import s from './RuleLink.module.css'

type Props = {
  label: string
  href: string
  className?: string
}

/**
 * The secondary link that sits opposite a primary button: a hairline rule that
 * eats the slack between the two, then a small caps label and the pixel arrow.
 *
 * The comp uses it twice on the solutions pages — under the hero copy and
 * across the foot of the case-study band — and both times the rule is whatever
 * length is left over rather than a fixed measure. So the rule is the flexible
 * element and the label is `flex: none`; nothing here carries a width.
 *
 * Ink is `currentColor` throughout, because the two uses sit on opposite
 * grounds: brand blue over the hero's pale sky, white over the photograph. The
 * parent sets the colour once and the rule, the label and the arrow all follow.
 */
export default function RuleLink({ label, href, className = '' }: Props) {
  return (
    <div className={`${s.row} ${className}`}>
      <span className={s.rule} aria-hidden="true" />
      <Link href={href} className={s.link}>
        <span className={s.label}>{label}</span>
        <PixelArrow className={s.chev} />
      </Link>
    </div>
  )
}
