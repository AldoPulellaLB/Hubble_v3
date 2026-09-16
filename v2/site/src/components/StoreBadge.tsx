import { AppleLogo, PlayLogo } from './Icons'
import s from './StoreBadge.module.css'

type Props = {
  platform: 'ios' | 'android'
  sub: string
  label: string
  href: string
  /** The plate. `dark` is the near-black lockup the stores publish and the one
   *  to use over a dark ground or a photograph; `light` is the same lockup on
   *  the page's own pale plate, for a white section. Both logos are drawn with
   *  `fill: currentColor`, so the mark follows the label without a second
   *  asset. */
  tone?: 'dark' | 'light'
}

/** The two app-store lockups, drawn rather than shipped as raster badges. */
export default function StoreBadge({ platform, sub, label, href, tone = 'dark' }: Props) {
  return (
    <a className={`${s.badge} ${s[tone]}`} href={href} target="_blank" rel="noopener noreferrer">
      <span className={s.mark} aria-hidden="true">
        {platform === 'ios' ? <AppleLogo /> : <PlayLogo />}
      </span>
      <span className={s.text}>
        <span className={s.sub}>{sub}</span>
        <span className={s.label}>{label}</span>
      </span>
    </a>
  )
}
