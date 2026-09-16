import type { Metadata } from 'next'
import ArbitrageMoves from '@/components/sections/ArbitrageMoves'
import CaseFeature from '@/components/sections/CaseFeature'
import CommercialCase from '@/components/sections/CommercialCase'
import Cta from '@/components/sections/Cta'
import DayOnTheMeter from '@/components/sections/DayOnTheMeter'
import ImageHero from '@/components/sections/ImageHero'
import ModelCards from '@/components/sections/ModelCards'
import SolutionSplit from '@/components/sections/SolutionSplit'
import { load } from '@/lib/content'

type Page = {
  meta: { title: string; description: string }
  hero: React.ComponentProps<typeof ImageHero>
  commercialCase: React.ComponentProps<typeof CommercialCase>
  split: React.ComponentProps<typeof SolutionSplit>
  moves: { eyebrow: string; title: string; items: React.ComponentProps<typeof ArbitrageMoves>['moves'] }
  meter: React.ComponentProps<typeof DayOnTheMeter>
  model: { eyebrow: string; title: string; cards: React.ComponentProps<typeof ModelCards>['cards'] }
  feature: React.ComponentProps<typeof CaseFeature>
  cta: React.ComponentProps<typeof Cta>
}

const FILE = 'solutions-energy-arbitrage'

export function generateMetadata(): Metadata {
  const { meta } = load<Page>(FILE)
  return { title: meta.title, description: meta.description }
}

/**
 * Solutions — Energy Arbitrage.
 *
 * The ground alternates blue / light / blue / light and closes on black, which
 * is the landing page's own rhythm: each blue band is a claim and each light one
 * is the evidence for it. Three hand-offs are seamless rather than butted — the
 * hero's 400px fade into the commercial case's blue, and the case study's wash
 * into the black CTA — so the page reads as one surface changing colour instead
 * of a stack of sections.
 *
 * No PixelDissolve bands. The comp has one, hidden, on the case-study section,
 * and the landing page's three are commented out on cost grounds (see the note
 * in app/page.tsx) — so this page is consistent with both by having none.
 */
export default function EnergyArbitragePage() {
  const c = load<Page>(FILE)

  return (
    <>
      <ImageHero {...c.hero} />
      <CommercialCase {...c.commercialCase} />
      <SolutionSplit {...c.split} />
      <ArbitrageMoves eyebrow={c.moves.eyebrow} title={c.moves.title} moves={c.moves.items} />
      <DayOnTheMeter {...c.meter} />
      <ModelCards eyebrow={c.model.eyebrow} title={c.model.title} cards={c.model.cards} />
      <CaseFeature {...c.feature} />
      <Cta {...c.cta} />
    </>
  )
}
