# Hubble Energy — 2026 Site

Rebuild of the Hubble Energy website. Next.js App Router with GSAP/ScrollTrigger
and Lenis, built as a vertical slice: the full design system, nav and footer, a
complete home page with the scroll-scrubbed canvas hero, and one page from each
of the Solutions and Products families — so every signature mechanic is proven
before the remaining ~30 routes are scaled out.

Theme: **"Power keeps life in motion."** Services lead, products prove.

## Quick start

```bash
npm install && npm run dev
```

Dev server runs on **:3210**.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3210 |
| `npm run check` | Production build into `.next-check` |
| `npm run build` | Production build into `.next` |
| `npm run normalise-sequence <dir>` | Renames a frame export to `frame_000.webp…` |

> **Never run `npm run build` while `next dev` is running.** It overwrites
> `.next`, the dev server then 404s on `main-app.js`, nothing hydrates and the
> page renders as unstyled inert markup. Use `npm run check`, which builds into
> a separate dist dir. Recovery: stop the server, delete `.next`, restart.

## Routes

| Route | State |
| --- | --- |
| `/` | Signed off 2026-09-03. The reference for every page after it. |
| `/solutions/energy-arbitrage` | Signed off 2026-09-09. The pattern for the rest of Solutions. |
| `/products/high-voltage` | **Partial by instruction** — hero + `BusinessStakes` in, four section nodes outstanding. |

Every other nav destination is still a dead href. `/calculate-your-savings` has
no route by design: `SavingsStage` in `app/layout.tsx` binds a document-level
capture listener and intercepts the link from anywhere on the site.

## Layout

The repository **is** the Next.js app — `package.json` is at the root, so any
host auto-detects it and `npm install && npm run dev` works from a fresh clone
with no root-directory configuration.

```
src/app/              Routes, layout, globals.css
src/components/       Shared UI + motion primitives (Reveal, FlowLines, …)
src/components/sections/  Page sections
src/lib/              content.ts, motion.ts, savings.ts, emphasis.tsx
content/*.json        All page copy, read at runtime — edits land on next request
public/               Runtime assets only (97 MB, mostly the hero sequences)
scripts/              normalise-sequence.mjs

docs/
  DESIGN-SYSTEM.md    The deep documentation — read this first (129 KB)
  ASSETS.md           What is in public/, what lives outside the repo

support/              Not part of the build; excluded from tsconfig
  context/            Project history, decisions, session handover
  Brand Assets/       Fonts (Sora, Montserrat) and the 10 logo SVGs
  Placeholder Images/ Stand-in photography, procedurally generated
  tools/              Standalone scripts (link check, screenshots, placeholders)
```

`support/` is excluded in `tsconfig.json`. It holds a few `.tsx` concept
backups, and without that exclusion `tsc` and `next build` both try to compile
them.

## Where the detail lives

**[`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) is the real documentation.** The
layout system, motion contracts, the design-system tokens and roughly thirty-five
hard-won failure modes are written up there in full. Read it before building a
page, and add to it rather than starting a parallel set of notes.

## Assets

`public/` holds **only what the site serves** — 97 MB, of which 68 MB is
the encoded webp hero sequences. See [`docs/ASSETS.md`](docs/ASSETS.md) for the
full inventory, how to re-encode a sequence, and the frame-naming rule that
gates the hero's loader.

Everything dropped into `public/` is served *and* copied into the build, so
source material there is a real cost, not just clutter.

**What deliberately is not in this repo.** Render masters (656 MB of source JPGs
and PNGs), client-supplied material, and the internal working record all live in
a sibling folder, `../Hubble 2026 Masters/`:

| | |
| --- | --- |
| `source-frames/` | The uncompressed renders `public/sequence/*` was encoded from |
| `client-material/` | Client Figma sources and the Electricity Calculator prototype |
| `reference-docs/` | Client PDFs — brand and content strategy, brochures, site map |
| `onenergy-placeholder/` | See below |
| `internal/` | Session transcripts and competitor teardowns |

The `.gitignore` blocks these paths by name, so dropping a fresh render export
or a client deliverable into the tree cannot put it in a commit by accident.

> ### The hero currently shares one render across both variants
>
> There is no separate mobile frame set. The site had been using ON.energy's
> artwork as a development placeholder for the mobile cut; **that has been
> removed**, and `SequenceHero` now points both variants at Hubble's own
> 422-frame desktop render (`public/sequence/desktop/`).
>
> It works — the component takes a bare string for `dir` to mean "both variants
> share a render" — but mobile is paying desktop's weight. **A proper mobile cut
> should be rendered from the Hubble source** and split back out by restoring
> `LANDING_FRAMES` to a `{ desktop, mobile }` pair in
> `src/components/SequenceHero.tsx`, with the matching frame counts in
> `content/home.json`.

## Conventions worth knowing before you touch content

- **`*phrase*` in any content JSON string** renders medium-weight via
  `lib/emphasis.tsx`. A section opts in with `{emphasise(copy)}`. Escape a
  literal asterisk as `\*`.
- **`\n` is a hard break** in headings (`ScrollRevealTitle` renders it as `<br>`)
  and a **paragraph break** in body copy. Do not use U+2028 — Chrome does not
  treat it as a forced break, and it is invisible in most editors.
- **Make content keys the component can live without optional.** `load<T>()`
  parses JSON at runtime and cannot check it against the type, so a key deleted
  from a JSON file still renders as an empty element with its margins intact.

## Known state

- **No `/admin` CMS yet.** ~200 strings are still hard-coded (≈104 in
  `sections/SavingsCalculator.tsx`, ≈78 in `lib/savings.ts`, 22 in
  `ContactPanel.tsx`, 10 in Nav/Footer). Extract those to
  `content/calculator.json` and `content/contact.json` *before* building the
  editor, or half the copy will still need a code change.
- **All three `PixelDissolve` bands are commented out** in `app/page.tsx`. At
  their shipped cell budget they built 17,640 nodes — 94.7% of the DOM. Three
  one-line uncomments restore them; fix the cell budget first (`CELL: 30` /
  `ROWS: 6` is the original design's figure).
- **The savings drawer is an unapproved concept.**
  `context/_concept-backups/savings-drawer/REVERT.sh` is the clean way to take
  it back out.
- **`context/_concept-backups/services-five-ways/` is the only copy** of the
  retired Services section's content.
- **`SavingsCalculator.module.css` declares ~40 selectors twice** — a base block
  and a "Restored from the prototype" block at the foot, which wins. Check which
  declaration wins before editing; it has cost two bugs.

## Licence

Proprietary. © Hubble Energy. Not for redistribution.
