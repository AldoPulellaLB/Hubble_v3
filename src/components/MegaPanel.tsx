import Image from 'next/image'
import Link from 'next/link'
import { PixelArrow } from './Icons'
import type { Mega } from '@/lib/types'
import s from './MegaPanel.module.css'

type Props = { mega: Mega; open: boolean }

/**
 * The wide Solutions panel (Figma `1780:6513`).
 *
 * Three columns of copy separated by hairlines, then a promo card — 1358 x 493
 * on the comp, which is the bar's own measure rather than the trigger's. That
 * is why `Nav` drops `position: relative` from an item carrying one of these:
 * the panel anchors to `.inner`, so it spans the bar and not the word
 * "Solutions".
 *
 * It stays *inside* the trigger's `<li>` all the same, and that is load-bearing
 * rather than tidy — the open/close handlers live on the `li`, so a panel
 * rendered as its sibling would fire `mouseleave` the moment the pointer
 * reached it and shut itself.
 *
 * `inert` while shut, for the same reason the simple dropdown carries it:
 * `opacity: 0` hides a panel from the eye but not from the tab order, and this
 * one is twenty focus stops deep.
 */
export default function MegaPanel({ mega, open }: Props) {
  return (
    /* `data-mega` is the hook `Nav.module.css` uses to drop `position:
       relative` from the item holding this. An attribute, not the hashed class
       name — a `[class*='mega']` substring match would be at the mercy of the
       hash and of anything else whose class happens to contain the word. */
    <div className={`${s.mega} ${open ? s.open : ''}`} data-mega inert={!open}>
      <div className={s.sheet}>
        <p className={s.title}>{mega.title}</p>

        <div className={s.cols}>
          {mega.columns.map((col, ci) => (
            /* `--c` is the column's index and the only thing its entrance
               delay is built from — see the CSS. */
            <div key={col.label} className={s.col} style={{ ['--c' as string]: String(ci) }}>
              <p className={s.colLabel}>{col.label}</p>
              <p className={s.colNote}>{col.note}</p>

              <ul className={s.list}>
                {col.items.map((item) => (
                  <li key={item.title} className={s.row}>
                    <Link href={item.href} className={s.rowLink}>
                      <span className={s.rowTitle}>{item.title}</span>
                      <span className={s.rowCopy}>{item.copy}</span>
                      <PixelArrow className={s.rowArrow} />
                    </Link>
                    {item.chip ? (
                      <Link href={item.chip.href} className={s.chip}>
                        <span>{item.chip.label}</span>
                        <PixelArrow className={s.chipArrow} />
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>

              {col.footnote ? (
                <p className={s.footnote}>
                  <span className={s.bolt} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" focusable="false">
                      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
                    </svg>
                  </span>
                  {col.footnote}
                </p>
              ) : null}
          </div>
          ))}
        </div>

        <div className={s.promo} style={{ ['--c' as string]: String(mega.columns.length) }}>
          <div className={s.promoCard}>
            <p className={s.promoTitle}>{mega.promo.title}</p>
            <Image
              className={s.promoImg}
              src={mega.promo.image.src}
              alt={mega.promo.image.alt}
              width={760}
              height={979}
              sizes="240px"
            />
          </div>
          <p className={s.promoCopy}>{mega.promo.copy}</p>
          <Link href={mega.promo.cta.href} className={s.promoCta}>
            <span>{mega.promo.cta.label}</span>
            <PixelArrow className={s.promoArrow} />
          </Link>
        </div>
      </div>
    </div>
  )
}
