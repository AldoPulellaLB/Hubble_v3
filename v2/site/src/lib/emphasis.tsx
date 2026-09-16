import Link from 'next/link'
import type { ReactNode } from 'react'

/* Inline markup for copy that lives in `content/*.json`.
 *
 * The JSON has to stay plain text — it is what the copy editor edits, and
 * anything that reads as markup there invites HTML in a string, which we then
 * have to trust. So two small conventions instead, both borrowed from the
 * shapes people already type:
 *
 *   "makes the system *visible*, *responsive* and sharper"   → medium weight
 *   "(See it in action: [Aspen](/projects))"                 → an internal link
 *
 * The whole-line variant of the first already exists in the footer's
 * `presence.lines`. Escape a literal asterisk as `\*`.
 *
 * Links carry no class of their own: a link's colour belongs to the panel it is
 * printed on, not to this helper, so the use site styles `a` inside its own copy
 * block. `Link` and not `<a>` so an internal href prefetches like every other
 * route on the site.
 */
const TOKEN = /\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g

export function emphasise(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0

  for (const m of text.matchAll(TOKEN)) {
    const at = m.index!
    /* An escaped asterisk is not a delimiter — keep the run verbatim, minus
       the backslash. */
    if (m[1] !== undefined && text[at - 1] === '\\') continue
    if (at > last) out.push(text.slice(last, at))

    out.push(
      m[1] !== undefined ? (
        <span className="t-med" key={at}>
          {m[1]}
        </span>
      ) : (
        <Link href={m[3]} key={at}>
          {m[2]}
        </Link>
      ),
    )
    last = at + m[0].length
  }

  if (last < text.length) out.push(text.slice(last))
  return out.map(n => (typeof n === 'string' ? n.replace(/\\\*/g, '*') : n))
}
