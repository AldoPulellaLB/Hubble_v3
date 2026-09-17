import Image from 'next/image'
import Link from 'next/link'
import { PixelArrow } from './Icons'
import type { Mega } from '@/lib/types'
import s from './MegaPanel.module.css'

type Props = { mega: Mega; open: boolean }

/**
 * The wide Solutions panel (Figma `1816:10`).
 *
 * Two columns of copy and a promo card — 1358 x 493 on the comp, which is the
 * bar's own measure rather than the trigger's. That is why `Nav` drops
 * `position: relative` from an item carrying one of these: the panel anchors to
 * `.inner`, so it spans the bar and not the word "Solutions".
 *
 * It stays *inside* the trigger's `<li>` all the same, and that is load-bearing
 * rather than tidy — the open/close handlers live on the `li`, so a panel
 * rendered as its sibling would fire `mouseleave` the moment the pointer
 * reached it and shut itself.
 *
 * ── Columns of groups, not of rows ──────────────────────────────────────────
 * `1816:10` replaced the three labelled columns with two, and the left one
 * carries *two* labelled groups with a rule between them. So a column is a list
 * of groups rather than one label over one list, and the content file says which
 * groups share a column instead of the component inferring it from a count.
 *
 * `inert` while shut, for the same reason the simple dropdown carries it:
 * `opacity: 0` hides a panel from the eye but not from the tab order, and this
 * one is a dozen focus stops deep.
 */
export default function MegaPanel({ mega, open }: Props) {
  return (
    /* `data-mega` is the hook `Nav.module.css` uses to drop `position:
       relative` from the item holding this. An attribute, not the hashed class
       name — a `[class*='mega']` substring match would be at the mercy of the
       hash and of anything else whose class happens to contain the word. */
    <div className={`${s.mega} ${open ? s.open : ''}`} data-mega inert={!open}>
      <div className={s.sheet}>
        {/* The heading and the columns travel together: the comp bottom-aligns
            this block against the promo, and the promo is the shorter of the
            two. */}
        <div className={s.main}>
          <p className={s.title}>{mega.title}</p>

          <div className={s.cols}>
            {mega.columns.map((col, ci) => (
              /* `--c` is the column's index and the only thing its entrance
                 delay is built from — see the CSS. */
              <div
                key={col.groups[0].label}
                className={s.col}
                style={{ ['--c' as string]: String(ci) }}
              >
                {col.groups.map((group) => (
                  <section key={group.label} className={s.group}>
                    <p className={s.groupLabel}>{group.label}</p>
                    <p className={s.groupNote}>{group.note}</p>

                    <ul className={s.list}>
                      {group.items.map((item) => (
                        <li key={item.title} className={s.row}>
                          <Link href={item.href} className={s.rowLink}>
                            <span className={s.rowTitle}>{item.title}</span>
                            <span className={s.rowCopy}>{item.copy}</span>
                            <PixelArrow className={s.rowArrow} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ))}
          </div>
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
              sizes="429px"
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
