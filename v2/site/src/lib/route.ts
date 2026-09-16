export type Pt = [number, number]

/**
 * An orthogonal route with rounded corners — the brand's flow-line grammar.
 *
 * The comp draws every circuit trace the same way: straight runs meeting at
 * right angles, each turn softened by a fixed radius. Authoring those by hand
 * as path data is unreadable and impossible to tweak, so routes are written as
 * waypoints and the corners are generated.
 *
 * Turns use a quadratic with the corner as its control point. For a right
 * angle that is visually indistinguishable from an arc of the same radius, and
 * it degrades gracefully when two waypoints sit closer together than `r`.
 */
export function route(points: Pt[], r = 40): string {
  if (points.length < 2) return ''
  const d: string[] = [`M ${points[0][0]} ${points[0][1]}`]

  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]
    const [cx, cy] = points[i]
    const [nx, ny] = points[i + 1]

    // Never round more than half of either leg, or the corners collide.
    const inLen = Math.hypot(cx - px, cy - py)
    const outLen = Math.hypot(nx - cx, ny - cy)
    const rad = Math.min(r, inLen / 2, outLen / 2)

    const t1 = inLen === 0 ? 0 : rad / inLen
    const t2 = outLen === 0 ? 0 : rad / outLen

    d.push(`L ${cx + (px - cx) * t1} ${cy + (py - cy) * t1}`)
    d.push(`Q ${cx} ${cy} ${cx + (nx - cx) * t2} ${cy + (ny - cy) * t2}`)
  }

  const last = points[points.length - 1]
  d.push(`L ${last[0]} ${last[1]}`)
  return d.join(' ')
}
