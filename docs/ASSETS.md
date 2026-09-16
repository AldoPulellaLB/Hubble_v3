# Assets — what is in the repo, and what is not

`public/` holds **only what the site serves**. Everything in `public/` is
copied into the build, so render masters and reference material kept there are a
real cost on every deploy, not just clutter.

Everything else lives outside the repo, beside it:

```
Documents/Claude/
  Hubble 2026/                  ← the repo
  Hubble 2026 Masters/          ← not tracked
```

## What the repo serves (97 MB)

| Path | Size | What |
| --- | --- | --- |
| `public/sequence/desktop/` | 46 MB | Landing hero, 422 frames. Hubble's own render. Serves **both** desktop and mobile. |
| `public/sequence/product/` | 16 MB | High-voltage product sequence, 259 frames. |
| `public/sequence/product-mobile/` | 6.1 MB | Same, mobile cut. |
| `public/images/` | 24 MB | Photography, icons, maps, partner marks. |
| `public/models/` | 4.9 MB | `.glb` for the 3D product viewer. All three files are currently the same placeholder mesh. |
| `public/fonts/` | 412 KB | Sora + Montserrat woff2. |
| `public/logo/` | 144 KB | Logo SVGs. |
| `public/Strings section/` | 40 KB | Section-specific art. |

Frame counts are declared in the content files and must match what is on disk —
`content/home.json` (`hero.sequence.frames`) and
`content/products-high-voltage.json`.

## The landing hero has no mobile set

`SequenceHero` takes either one directory (both variants share a render) or a
`{ desktop, mobile }` pair. The landing hero is currently on the **shared**
form:

```ts
const LANDING_FRAMES: FrameDir = 'sequence/desktop'
```

It used to have a real mobile set, but those 351 frames were **ON.energy's
artwork**, pulled in as a development placeholder at the client's instruction so
the scroll mechanic could be tuned against real cinematic frames. They have been
removed from the repo.

This works, but mobile now downloads desktop-weight frames. **The fix is a real
mobile cut rendered from the Hubble source**, after which:

1. Put the frames in `public/sequence/mobile/`, normalised (see below).
2. Restore the pair:
   `const LANDING_FRAMES: FrameDir = { desktop: 'sequence/desktop', mobile: 'sequence/mobile' }`
3. Set `hero.sequence.frames` in `content/home.json` back to
   `{ "desktop": 422, "mobile": <count> }`.

The product hero already has both cuts and is the worked example.

## What lives outside the repo

Nothing below was destroyed — it was moved to `../Hubble 2026 Masters/`.

| Folder | Size | Why it is not tracked |
| --- | --- | --- |
| `source-frames/Intro/` | 323 MB | 423 source JPGs — the masters `public/sequence/desktop/` was encoded from. |
| `source-frames/product sequence/` | 347 MB | 259 source PNGs at 2200×1237 plus a duplicate un-normalised webp encode. |
| `source-frames/sequence-old-onenergy/` | 12 MB | Retired ON.energy desktop placeholder. |
| `client-material/Figma/` | 9.1 MB | The client's own `.fig` design-system sources. |
| `client-material/Electricity Calculator prototype/` | 15 MB | The client's `.dc.html` savings prototype. |
| `reference-docs/Docs/` | 58 MB | Client PDFs — brand strategy, content strategy, brochures, site map, the Cerebos arbitrage case. |
| `onenergy-placeholder/sequence-mobile/` | 6.8 MB | The removed mobile hero frames. |
| `internal/transcripts/` | 43 MB | Session transcripts, raw and readable. |
| `internal/` | — | Competitor teardowns (`reference-on-energy.md`, `reference-cantor8.md`). |
| `3D Files/` | 25 MB | Byte-identical duplicate of `public/models/`. |

The `.gitignore` blocks these by name, so a fresh render export or a client
deliverable dropped into the tree cannot reach a commit by accident.

### The savings model no longer has its prototype beside it

`src/lib/savings.ts` was ported from the client's `Savings Calculator v2.dc.html`
and is **verified exact** against an independent transcription: baseline
3 364 081.6, saving 1 384 161.0, capex 5 060 000, payback 3.656. If a figure ever
looks wrong, check it against those four numbers before re-deriving anything.
The prototype itself is in `client-material/` if you need to go back to it.

## Re-encoding a sequence

Source masters are PNG or JPG straight out of the render. They are encoded to
webp before they go anywhere near `public/`.

The product set went **333 MB → 15.8 MB at q86** (4.7% of source); a 1200px-wide
mobile set at q82 is 6.1 MB. Pillow handles webp on this machine
(`PIL.features.check('webp')` is `True`) and a `ProcessPoolExecutor` gets through
259 frames in under a minute.

**Measure a sequence's bytes before doing anything else with it.**

## Naming — this one gates the loader

`SequenceHero` requests `frame_000.webp` upward: **zero-based, three-digit,
contiguous**. Render tools do not export that way.

Frame 0 is what gates the component's `ready` state, so a mis-numbered set leaves
the hero behind a progress bar that never completes — which reads as a hung page
rather than a 404.

Run this over every new export:

```bash
node scripts/normalise-sequence.mjs public/sequence/<variant>
```

Then re-check the frame numbers in `content/home.json` → `hero.beats`, which are
absolute indices into the sequence.

## Adding an image

Give `next/image` a `sizes` that matches the **real rendered width**. A `sizes`
that overstates it can hang the decode outright: `34vw` on a 280px element
claimed 653px at 1920, so the browser picked the `w=1920` candidate and upscaled
a 933px source to 1920×3951 — a ~30 MB bitmap whose decode never completed. The
image simply never appeared, while `fetch()` on the same URL returned 200.

And if a newly added image sits at `naturalWidth: 0` with an empty `currentSrc`
for ever: curl the `/_next/image` URL with a browser `Accept` header. If that
hangs, the dev server's image optimiser has wedged — restart `next dev`.

## Still unoptimised

`public/images/calc/banner.png` is **8.8 MB** and
`public/images/cloudlink/Cloudlink_Phone2.png` is **1.8 MB** — the asset the
latter replaced was a 50 KB webp. Both ship on every page load that uses them.
