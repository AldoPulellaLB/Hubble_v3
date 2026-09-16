# Hubble 2026 — Project Context

Reference documentation for the Hubble Energy premium website build.
Compiled 2026-08-17 from the supplied source documents and first-hand teardowns
of the two reference sites. The teardowns themselves now live outside the repo
(see Source material locations).

| File | What's in it |
|---|---|
| **[`SESSION-HANDOVER.md`](SESSION-HANDOVER.md)** | **Start here.** Current state, standing design brief, architecture traps, open items — written so a fresh session can pick up cold. |
| [`brand-strategy.md`](brand-strategy.md) | Distilled positioning, narrative, offer architecture and voice from *Hubble Brand strategy.pdf* (66pp, Luckybeard) |
| [`sitemap.md`](sitemap.md) | Full IA from *Hubble Energy Site Map.pdf*, expanded into a route/template plan |
| [`products.md`](products.md) | The full product catalogue — 8 residential models, the HV indoor/outdoor range, CloudLink, plus 6 case studies and reusable copy |
| [`design-direction.md`](design-direction.md) | The synthesis: how the two references combine into a Hubble design system |
| [`decisions.md`](decisions.md) | Locked project decisions — stack, CMS, scope, navigation |
| [`asset-inventory.md`](asset-inventory.md) | What exists, what's placeholder, what is still missing |

## Source material locations

The build's own assets are in `public/` and `Brand Assets/`:

```
Brand Assets/Logo/        10 logo SVGs (do not redraw)
Brand Assets/fonts/       Sora + Montserrat (ttf + woff2)
public/models/    Per-product GLB placeholders (drop-in replaceable)
public/sequence/  Hero frame sequences, encoded webp
```

Client deliverables, render masters and the internal working record are **not in
this repo** — they are in the sibling folder `../Hubble 2026 Masters/`:

```
reference-docs/Docs/      Brand strategy PDF, content strategy PDF, site map,
                          product brochures, the Cerebos arbitrage case
client-material/Figma/    Hubble.fig — the design system source
client-material/          Electricity Calculator prototype (.dc.html)
source-frames/            Uncompressed render masters
internal/transcripts/     Session transcripts
internal/                 on.energy and cantor8.io teardowns
```

See [`../docs/ASSETS.md`](../docs/ASSETS.md) for the full inventory.

## The one-line brief

> **Power keeps life in motion.**
> An integrated energy company — not a battery shop, not an e-commerce store.
> Service offering leads; product offering supports.
