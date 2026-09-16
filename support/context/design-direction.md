# Hubble 2026 — Design Direction

The synthesis. How the brand strategy, the Hubble design system and the two references combine.

---

## 1. The idea

> **Power keeps life in motion.**

Everything on this site should be *moving, connected, and alive* — but quietly. Energy that never
stands still. The visual argument is: **a current runs through this whole brand.** That current is
literal in the design language — flow lines that trace from section to section, a pulse that
travels along them as you scroll, a 3D system that assembles itself under your control.

The brand strategy's instruction *"we turn complexity into clarity"* is the counterweight. This is
not a maximalist site. It is a **precise, instrument-grade, very quiet site with a few
extraordinary moments.**

**It must not read as:** an energy consulting shop (too corporate, stock-photo, tab-heavy) or an
e-commerce store (product grids, prices, add-to-cart, badges). Service leads. Product proves.

---

## 2. Design system — from the Hubble Figma file

Read live from `Hubble.fig` node `7:558` on 2026-08-17. **These are the authoritative tokens.**

### 2.1 Colour

```css
/* Blue — primary. Navigation, CTA, links, the brand field */
--brand-blue-dark:    #0832B4;   /* Blue/700 — base */
--brand-blue:         #1748DF;   /* Blue/500 — medium */
--brand-blue-400:     #3164FF;   /* Blue/400 */
--brand-blue-light:   #4B77FF;
--brand-blue-subtle:  #E1E9FF;   /* Blue/300 */
--brand-blue-50:      #F0F4FF;   /* Blue/200 */

/* Cyan — secondary. Badges, success, accents, data */
--brand-cyan-dark:    #00ABE6;   --brand-cyan:        #3DBEEB;
--brand-cyan-light:   #66D7FF;   --brand-cyan-subtle: #CEF2FF;
--brand-cyan-50:      #F0FBFF;

/* Green — accent. Urgency, highlights, the "live" signal */
--brand-green-dark:   #CAD900;   --brand-green:       #DAE356;
--brand-green-light:  #E7ED8C;   --brand-green-subtle:#F7FAC6;
--brand-green-50:     #FEFFE9;

/* Neutral — 75% of the brand lives here */
--neutral-white:#FFFFFF; --neutral-50:#F8FAFB;  --neutral-100:#F0F2F5;
--neutral-200:#E4E7ED;   --neutral-300:#CDD2DB; --neutral-400:#A0A8B4;
--neutral-500:#717B8A;   --neutral-600:#4D5563; --neutral-700:#2D3748;
--neutral-800:#1A2232;   --neutral-900:#0D1421;
```

**Ratio, per the system:** ~75% white/neutral · blue primary · cyan 15% secondary · green 5% accent.

### 2.2 Type

Two families, both self-hosted from `Brand Assets/fonts/` as woff2.

| Token | Family | Size | Weight | LH | Use |
|---|---|---|---|---|---|
| `--text-display` | **Sora** ExtraBold | 72px / 4.5rem | 800 | 1.10 | Landing hero, campaign |
| `--text-h1` | Sora Bold | 56px | 700 | 1.15 | Page titles |
| `--text-h2` | Sora Bold | 44px | 700 | 1.20 | Section headers |
| `--text-h3` | Sora SemiBold | 32px | 600 | 1.25 | Sub-section titles |
| `--text-h4` | Sora SemiBold | 24px | 600 | 1.30 | Card titles, modals |
| `--text-h5` | Sora SemiBold | 20px | 600 | 1.35 | Sidebar labels, nav |
| `--text-h6` | Sora Medium | 18px | 500 | 1.40 | Overlines, small headers |
| `--text-body-xl` | **Montserrat** | 20px | 400 | 1.60 | Lead paragraphs |
| `--text-body-lg` | Montserrat | 18px | 400 | 1.60 | Product page body |
| `--text-body` | Montserrat | 16px | 400 | 1.60 | Default UI body |
| `--text-body-sm` | Montserrat | 14px | 400 | 1.55 | Helper text |
| `--text-caption` | Montserrat | 12px | 400 | 1.55 | Captions, legal |

### 2.3 Shape, elevation, spacing, motion

```css
--radius-xs:6px; --radius-sm:8px; --radius-md:12px;   /* primary */
--radius-lg:15px; --radius-xl:20px; --radius-2xl:24px; --radius-full:9999px;

--shadow-sm: 5px  5px 20px rgba(0,0,0,.10);   /* inputs, chips, small cards */
--shadow-md:10px 10px 30px rgba(0,0,0,.10);   /* cards, modals, dropdowns  */
--shadow-lg:15px 15px 40px rgba(0,0,0,.10);   /* hero cards, floating nav  */

/* spacing 4 → 96px: 4 8 12 16 20 24 32 40 48 64 80 96 */

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);    /* the default */
/* durations: 0 · 100–150 fast · 200–250 standard · 300–350 moderate · 400–500 slow */
```

Grid: 4 col / 16px gutter / 16px margin (<768) · 8 / 24 / 32 (768–1023) · 12 / 24 / 40
(1024–1279) · 12 / 32 / auto (≥1280).

Buttons: pill (`--radius-full`), Sora SemiBold 14px, `all 200ms ease`, four sizes
(XS 6/12 · SM 8/16 · MD 10/24 · LG 14/32).

### 2.4 Design-system discrepancies to resolve

Flagged, not silently fixed — see the questions at the end of this project's kickoff.

1. The typography page's CSS stack strings read `'Inter', system-ui…` and `'Segoe UI', system-ui…`,
   but the actual variables and the shipped font files are **Sora** and **Montserrat**. Treating
   Inter/Segoe as stale placeholder text.
2. The button system defines an **Accent** variant on `--brand-orange` / `--brand-orange-dark`, and
   the logo page lists `--logo-accent-dot: #F58B1D — the orange dot is always retained`. **No
   orange exists in the colour palette, and none of the ten supplied logo SVGs contain an orange
   dot.** Both look like leftovers from another brand (several descriptions on the page still say
   "Unisure Group"). Proceeding without orange; **Green** takes the Accent/urgency role.
3. The logo page gives `--brand-blue: #2163E5`, which is not in the variable set. Using
   **`#0832B4`** (Blue/700, the value actually used in the logo SVGs) as brand blue.

---

## 3. The visual system for the site

### 3.1 Two zones, and the transition between them

The site alternates between two worlds, and the *transition* between them is a designed moment.

| | **Deep zone** | **Light zone** |
|---|---|---|
| Ground | `--neutral-900 #0D1421` → `--brand-blue-dark #0832B4` | `#FFFFFF` / `--neutral-50` |
| Used for | Hero, 3D product sequences, CloudLink, case studies, CTA | Solutions, specs, content, learn, forms |
| Type | White on dark; cyan for data; green for live signals | `--neutral-900` on white; blue for links |
| Feel | Cinematic, engineered, product-as-object | Clear, calm, editorial, legible |

The **pixel-dissolve** from cantor8 (§5 of that teardown) is the transition device between them:
`data-from="#0832B4" data-to="#FFFFFF" data-accent="#66D7FF"`. 25 × 6 seeded grid, scroll-driven.

The nav swaps light/dark against whichever zone is under it, via the IntersectionObserver pattern.

### 3.2 Motion vocabulary — five devices, used consistently

| Device | Source | Where |
|---|---|---|
| **Scroll-scrubbed frame sequence** | on.energy | Home hero. 351 frames, canvas, pinned 350lvh, copy keyed to frame index |
| **Connectors** | cantor8 `flow2-wrap`, rethought | **Between** sections, in the flow — not behind them. A line leaves an anchor in one section, routes orthogonally across the gap and lands on a terminal node beside the next section's opening line, drawing itself as you scroll. Mono labels mark departure and arrival. |
| **Line-masked reveals** | Locomotive / Studio Freight | Every heading. Lines slide up individually from a mask — never a block fade. |
| **Pixel dissolve** | cantor8 | Blue ↔ white zone changes only. Never more than 3–4 times per page |
| **Reveal wrappers** | on.energy `blur-reveal` / `fade-reveal` | All headings and copy blocks. Blur variant on H1/Display only |
| **Energy-stream button** | on.energy `base-button` | Primary CTA only. Streams + wipe fill + radial glow |

Plus two supporting: the **scroll carousel** with y-pattern and 0.7→1.0 scale ramp (products,
projects), and the **line-reveal** text hover on buttons and nav links (desktop, fine pointer only).

**Discipline rule:** one hero moment per page, maximum. Everywhere else, motion is a 200–300ms
reveal and nothing more. The site should feel expensive because of restraint, not density.

### 3.2b Typographic scale — the contrast *is* the hierarchy

`--text-mega` runs to **15rem** and `--text-display` to 8rem, against a 0.75rem caption: a 17:1
ratio. Display sizes carry sub-1 leading (0.93 mega, 0.98 display) and heavy negative tracking
(−0.055em mega). Headings are optically aligned — pulled back by 0.045em so the first glyph's
sidebearing sits on the grid rather than beside it. Anything under H5 keeps normal alignment.

### 3.3 Navigation

on.energy's mechanic, Hubble's skin.

- Floating segmented bar, `position:fixed; top:1.1vw`, full width minus outer gutters.
- Equal-width segments (`flex:1`), each with a chevron. Hover/click → segment fills
  **white with `--neutral-900` text** (deep zone) or **`--brand-blue-dark` with white** (light
  zone), sub-links drop within that segment's column, staggered.
- Logo chip far left: the Hubble brand mark on `--brand-blue-dark`, expanding to the full wordmark
  on hover (`Logo Contracted` → `Logo Expanded` exists in the Figma file as a defined behaviour).
- Right: **"Calculate your savings"** as the accent CTA pill — the strategy makes the ROI
  calculator the commercial lead, so it earns the nav slot over a generic "Contact".
- Mobile: logo + burger, full-screen panel, CTA pinned bottom.

### 3.4 Footer

on.energy's structure, warmed by Hubble's voice.

1. Oversized conversational line — *"Energy should never stand still. Neither do we."* — with the
   energy-stream primary button.
2. A **live flow-line band** running the full width above the columns, pulse looping slowly.
3. Nav mirrored as accordions · Africa presence (SA / Nigeria / Zambia) · CloudLink app store
   badges · socials.
4. Legal row.

---

## 4. Page-level treatments

| Page | Hero moment | Notes |
|---|---|---|
| **Home** | Scroll-scrubbed 351-frame sequence, pinned 350lvh, copy in at frame ~13, zone flip at ~133 | Then: the five solutions, CloudLink app feature block with store badges, product preview carousel, proof/case strip, ROI CTA |
| **Solutions index** | Flow lines converging into five numbered offers | Numbered 01–05 exactly as the strategy defines them |
| **Solution detail** | Full-bleed image + blur-reveal H1 | Outcome-led copy. Financial logic foregrounded |
| **Product category** | **3D interactive viewer** — scroll rotates, cursor drags | Placeholder GLBs in `3D Files/Products/` |
| **Product detail** | 3D viewer + hotspot callouts + spec table | Specs are proof, not the headline |
| **CloudLink** | Distinct treatment — UI-led, dark, data-lit | App store badges. Positioned as the intelligence in every system, not a separate product |
| **Projects** | Scroll carousel with y-pattern + scale ramp | Faceted filter |
| **ROI calculator** | Light zone, form-first, results animate in | Lead-gen — the strategy's key commercial asset |

---

## 5. Non-negotiables

1. **Do not redraw the logos.** Use the supplied SVGs from `Brand Assets/Logo/` as-is.
2. Respect `prefers-reduced-motion` on every device above — sequences jump to a poster frame, flow
   lines render in their end state, dissolves skip to solid.
3. Self-host Sora + Montserrat as woff2; `document.fonts.ready` triggers a ScrollTrigger refresh.
4. Every scroll device must degrade: no JS → readable static page; slow device → reduced frame
   count; touch → no hover-dependent reveals.
5. The 3D placeholder and the hero sequence must both be **replaceable by dropping in a file**, no
   code change.
