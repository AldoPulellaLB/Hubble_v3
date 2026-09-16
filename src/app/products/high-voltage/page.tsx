import type { Metadata } from 'next'
import BusinessStakes, { type Stake } from '@/components/sections/BusinessStakes'
import Cta from '@/components/sections/Cta'
import SequenceHero, { type Beat, type FrameCount, type FrameDir } from '@/components/SequenceHero'
import { load } from '@/lib/content'

type Page = {
  meta: { title: string; description: string }
  hero: {
    labels: [string, string]
    scrollHint: string
    primary: { label: string; href: string }
    secondary: { label: string; href: string }
    sequence: { frames: FrameCount; dir: FrameDir; poster: string }
    beats: Beat[]
  }
  stakes: { eyebrow: string; title: string; copy: string; items: Stake[] }
}

const FILE = 'products-high-voltage'

export function generateMetadata(): Metadata {
  const { meta } = load<Page>(FILE)
  return { title: meta.title, description: meta.description }
}

/**
 * Products — High Voltage (Commercial & Industrial).
 *
 * **Partial.** The comp (Figma `1719:27`) has five sections above the CTA and
 * this route carries the first of them; Aldo's design for the rest is still in
 * progress. The sections are added in comp order, so what is here is the top of
 * the page rather than a sample of it — see the README for the node ids of the
 * four still to come.
 *
 * The hero is the landing page's own `SequenceHero`, not a second
 * implementation of it: 259 frames of the product render instead of 422 of the
 * cube grid, one beat instead of three, and the comp's label row under the nav.
 * Everything that makes it feel solid — the worker fetch, the nearest-decoded
 * fallback, the pin, the reduced-motion poster — is shared, so a fix to one
 * hero is a fix to both.
 */
export default function HighVoltagePage() {
  const c = load<Page>(FILE)

  return (
    <>
      <SequenceHero
        frames={c.hero.sequence.frames}
        dir={c.hero.sequence.dir}
        poster={c.hero.sequence.poster}
        beats={c.hero.beats}
        labels={c.hero.labels}
        scrollHint={c.hero.scrollHint}
        primary={c.hero.primary}
        secondary={c.hero.secondary}
      />

      <BusinessStakes
        eyebrow={c.stakes.eyebrow}
        title={c.stakes.title}
        copy={c.stakes.copy}
        items={c.stakes.items}
      />

      {/* TODO — Figma `1719:152` "Not a hardware quote. One integrated system.",
          `1719:225` "Same system. Different stakes.", `1759:3805` "Two ways to
          put it on your site." Then the CTA below closes the page. */}

      <Cta {...load<{ cta: React.ComponentProps<typeof Cta> }>('home').cta} />
    </>
  )
}
