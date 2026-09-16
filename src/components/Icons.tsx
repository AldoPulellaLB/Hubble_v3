/* One icon family: 1.6px strokes on a 24 grid, round caps, no fills.
   Everything the landing page needs — nothing imported, nothing unused. */

type P = { className?: string; size?: number }
type ArrowP = { className?: string; cell?: number; dir?: 'right' | 'down' }
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.6,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true as const, focusable: 'false' as const,
})

/**
 * The arrow — every arrow on the site.
 *
 * Three 2px squares on a grid, never a drawn wedge or a stroked chevron. It is
 * the dissolve band's pixel language shrunk to a mark, which is why it is the
 * one glyph the comp uses in buttons, in rings, on the nav pills, on the
 * footer links and in the scroll HUD.
 *
 *   right          down
 *   ▉ ·            ▉ · ▉
 *   · ▉            · ▉ ·
 *   ▉ ·
 *
 * `cell` is the size of one square in px. The comp draws it at 2 almost
 * everywhere — deliberately tiny — and at 3 for the three standalone carets
 * that have no label beside them to lend them scale.
 */
export const PixelArrow = ({ className, cell = 2, dir = 'right' }: ArrowP) => {
  const right = dir === 'right'
  const cols = right ? 2 : 3
  const rows = right ? 3 : 2
  const cells = right
    ? [[0, 0], [1, 1], [0, 2]]
    : [[0, 0], [1, 1], [2, 0]]

  return (
    <svg
      className={className}
      width={cols * cell}
      height={rows * cell}
      viewBox={`0 0 ${cols} ${rows}`}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
    </svg>
  )
}

/* The designer's own file, referenced rather than redrawn — so it stays
   whatever it is in the asset, including its `#0832B4` fill. It is not
   `currentColor` and is not meant to be. */
export const Calculator = ({ className, size = 14 }: P) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className={className}
    src="/images/icons/Icn_calculate.svg"
    alt=""
    width={size}
    height={size}
    aria-hidden="true"
  />
)

/* The designer's own file, referenced rather than redrawn. White fill, fixed. */
export const User = ({ className, size = 18 }: P) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className={className}
    src="/images/icons/Icn_login.svg"
    alt=""
    width={size}
    height={size}
    aria-hidden="true"
  />
)

export const Menu = ({ className, size = 20 }: P) => (
  <svg className={className} {...base(size)}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </svg>
)

export const Close = ({ className, size = 20 }: P) => (
  <svg className={className} {...base(size)}>
    <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
  </svg>
)

export const Instagram = ({ className, size = 20 }: P) => (
  <svg className={className} {...base(size)}>
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
  </svg>
)

export const YouTube = ({ className, size = 20 }: P) => (
  <svg className={className} {...base(size)}>
    <rect x="2" y="5" width="20" height="14" rx="4.4" />
    <path d="M10.2 8.9v6.2L15.6 12z" fill="currentColor" stroke="none" />
  </svg>
)

export const WhatsApp = ({ className, size = 20 }: P) => (
  <svg className={className} {...base(size)}>
    <path d="M3.4 20.6 4.7 16.4A8.2 8.2 0 1 1 7.9 19.5z" />
    <path d="M8.9 8.2c.5-.1.7.1.9.5l.6 1.3c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6a6 6 0 0 0 2.5 2.4c.2.1.4.1.6-.1l.6-.6c.2-.2.4-.2.7-.1l1.3.6c.4.2.6.4.5.9-.2.9-1 1.5-1.9 1.5-2.7 0-6.1-3.4-6.1-6.1 0-.9.6-1.7 1.5-1.9z"
          fill="currentColor" stroke="none" />
  </svg>
)

export const LinkedIn = ({ className, size = 20 }: P) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24"
       fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M4.6 3a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM2.9 9h3.4v12H2.9zM9.4 9h3.2v1.7a3.6 3.6 0 0 1 3.2-1.8c3 0 3.9 1.9 3.9 4.6V21h-3.4v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V21H9.4z" />
  </svg>
)

/** App-store lockups, drawn rather than shipped as raster badges. */
export const AppleLogo = ({ className, size = 22 }: P) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24"
       fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.2 1.3-2.5 1.3-2.5s-2.5-1-2.5-3.6zM14.2 5.9c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2-.5 2.7-1.3z" />
  </svg>
)

export const PlayLogo = ({ className, size = 20 }: P) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24"
       fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M3.6 2.3 14.9 12 3.6 21.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1zM16.4 10.5l3.4 2.9-3.4 2.9-2.2-2.9zM4.9 1.6l11 6.3-2 2.6z" opacity=".92" />
  </svg>
)
