import CloudLink from '@/components/sections/CloudLink'
import Cta from '@/components/sections/Cta'
import Marquee from '@/components/Marquee'
import PixelDissolve from '@/components/PixelDissolve'
import Products from '@/components/sections/Products'
import Projects from '@/components/sections/Projects'
import SequenceHero, { type Beat, type FrameCount } from '@/components/SequenceHero'
import HowWeWork from '@/components/sections/HowWeWork'
import Statement from '@/components/sections/Statement'
import Strings from '@/components/sections/Strings'
import Stats from '@/components/sections/Stats'
import { load } from '@/lib/content'
import type { Project, Stat } from '@/lib/types'

type Home = {
  hero: {
    scrollHint: string
    primary: { label: string; href: string }
    sequence: { frames: FrameCount; poster: string }
    beats: Beat[]
  }
  statement: React.ComponentProps<typeof Statement>
  howWeWork: React.ComponentProps<typeof HowWeWork>
  marquee: string
  cloudlink: React.ComponentProps<typeof CloudLink>
  products: React.ComponentProps<typeof Products>
  stats: Stat[]
  projects: { eyebrow: string; title: string; items: Project[] }
  cta: React.ComponentProps<typeof Cta>
}

export default function HomePage() {
  const home = load<Home>('home')

  return (
    <>
      <SequenceHero
        frames={home.hero.sequence.frames}
        poster={home.hero.sequence.poster}
        beats={home.hero.beats}
        scrollHint={home.hero.scrollHint}
        primary={home.hero.primary}
      />

      <Statement {...home.statement} />

      {/* DISABLED — all three dissolve bands are off. At a 5px cell and 24 rows
          they were building 5,880 cells each (17,640 total, 94.7% of the page's
          DOM at 1222px wide, ~27,600 at 1920) and the scrub loop walked every
          one of them per frame. Uncomment to restore; see PixelDissolve.tsx's
          CELL and ROWS for the cost.

          `to` is the white Products now sits on, not the `--n-75` HowWeWork used
          to bring — the band has to resolve to whatever actually follows it.
      <PixelDissolve from="var(--blue-700)" to="var(--white)" direction="up" seed={3} /> */}

      <Products {...home.products} />

      <HowWeWork {...home.howWeWork} />

      {/* Pointer-driven and desktop-only — it renders nothing on narrow
          screens or under reduced motion. */}
      <Strings />

      <Marquee text={home.marquee} />

      <CloudLink {...home.cloudlink} />

      {/* DISABLED — see the note on the first band.
      <PixelDissolve to="var(--white)" direction="up" seed={17} overlap /> */}

      <Projects {...home.projects} />

      <Stats items={home.stats} />

      {/* DISABLED — see the note on the first band.
      <PixelDissolve from="var(--white)" to="var(--black)" direction="up" seed={29} /> */}

      <Cta {...home.cta} />
    </>
  )
}
