# Placeholder Images

64 generated placeholders covering every image slot in the site. **All are temporary** — drop your
own assets in at the same paths and filenames and nothing else needs to change.

Regenerate at any time:

```bash
node tools/generate-placeholders.mjs
```

---

## How these were made

These are **procedurally generated**, not photographs or AI renders — drawn as SVG in the Hubble
design system and rasterised to WebP. That gives exact aspect ratios, on-brand colour, no
licensing exposure, and instant regeneration if a size or a product name changes.

Three visual families, drawn from the project references:

| Family | Look | From | Used for |
|---|---|---|---|
| **studio** | `#0D1421` ground, elliptical floor pool of light, isometric product form with cyan LED strip, soft floor reflection | on.energy | Products, product heroes, case studies |
| **field** | Flat `#0832B4`, orthogonal circuit routing with paired main/sub lines and a cyan pulse, node dots | cantor8.io `flow2-wrap` | Solutions, industries, editorial heroes, OG |
| **data** | `#0D1421` surface, grid, power-flow curves in cyan and lime, mono stat tiles | Hubble CloudLink | CloudLink dashboard, app screens, fleet |

Every image carries a small mono caption bottom-left naming the slot, so a placeholder is never
mistaken for final artwork in a review.

Product forms are parametric archetypes — `brick`, `wall`, `blade`, `rack`, `tower`, `cabinet`,
`container` — proportioned to the real product so the layout reads correctly at the right scale.
The Blade is genuinely long and slim, the Energy Container is genuinely 4:1.

---

## Contents

```
products/
  low-voltage/     8 models × 2 (4:3 detail 1600×1200 + 1:1 card 1200×1200)
    s-100a · x-101 · am2-plus · am4 · am5-plus · am10-plus · am16-plus · blade
  high-voltage/    7 models × 2
    hv100ah-rack · hv100ah-stack · hv280ah-rack · hv314ah-rack
    energy-cube · energy-block · energy-container

hero/              2400×1350
  home-hero · low-voltage · high-voltage · solutions · about · partners

solutions/         1600×1066 — the five offers
  01-energy-solutions · 02-energy-arbitrage · 03-wheeling · 04-ppa · 05-sla

projects/          1600×1066 — the six real case studies
  cerebos-salt · malamala · the-outpost · rattrays · kirkmans-kamp · mpumalanga-lodge

industries/        1400×1050
  commercial-industrial · agriculture · lodges · manufacturing · telecom · microgrid

cloudlink/
  dashboard 2400×1350 · fleet 1600×1066 · device 1600×1200
  app-owner 1200×1600 · app-installer 1200×1600 (portrait, device frame)

og/                1200×630
  home · solutions · products · cloudlink · projects · about
```

`manifest.json` lists every generated file.

---

## Replacing them

Same path, same filename, and the site picks up the new asset. Recommended real-asset specs:

| Slot | Size | Notes |
|---|---|---|
| Product detail | 1600 × 1200 | Dark studio, single object, floor reflection. Match the on.energy plate treatment. |
| Product card | 1200 × 1200 | Same object, tighter crop, square |
| Hero wide | 2400 × 1350 | Full-bleed; keep the left third clear for the headline |
| Case study | 1600 × 1066 | Real installation photography preferred over renders here |
| Industry | 1400 × 1050 | |
| CloudLink app | 1200 × 1600 | Real app screenshots |
| OG | 1200 × 630 | |

Export **WebP quality 80–85**. Keep hero images under ~250 KB.

---

## Adding a new slot

Edit the manifest arrays near the bottom of [`../tools/generate-placeholders.mjs`](../tools/generate-placeholders.mjs)
(`LV`, `HV`, `PROJECTS`, `INDUSTRIES`, `OFFERS`, `OG`) and re-run. Product entries are
`[slug, displayName, formArchetype, specLine]`.
