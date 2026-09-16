# Session handover — v2 landing page

Last updated 2026-09-15 (session 10). Supersedes the v1-era handover (kept in
`_backup-2026-08-25/context/`).

Full session transcripts are archived in `_transcripts/` — a compressed `.jsonl`
(the complete record) plus a readable `.md` extract with image payloads stripped.
`_transcripts/2026-09-09-session-7-figures/` keeps the three working images that
carry decisions: the hero parallax before/after, what its crop cost, and the
Figma render the meter bar was measured against.
`_transcripts/2026-09-14-mega-nav-figures/` keeps the promo card's Figma render.

Archived 2026-09-16, covering Products through the PNG export:
`2026-09-16-session-10-projects-footer-export` is **the one to read** — that
session resumed the previous one and carries its whole history (18 messages from
Aldo, 535 from Claude, 384 tool calls). Its sibling
`2026-09-15-session-8-9-products-howwework-cloudlink` is almost entirely a subset
and is kept only because four records at an interrupt boundary exist nowhere
else.

**This repo still has no version control.** On 2026-09-14 "commit these changes"
was read as a request for one and a repo was initialised, then removed when Aldo
clarified he meant "locked in, back it up". The tree is exactly as it was. If it
is ever wanted: 1,127 files / 150 MB tracked with `node_modules/`, `.next*/`,
`.DS_Store`, `public/product sequence/` (347 MB of PNG masters, superseded
by the webp sets) and `public/Intro/` (323 MB, referenced nowhere in
`src/`) ignored — the optimised sets the app serves stay tracked, so a clone runs.

**Read first:** `docs/DESIGN-SYSTEM.md`. It holds the working knowledge — the
layout system, the motion contracts, and the traps that have already cost time.
This file is orientation and open questions only.

---

## Where things stand

the repo root is the live build; `v1/site` is archived and still runnable.

- **Home page** — complete and **signed off**, at Awwwards-quality fidelity
  against Figma `EhfzMjyCPVx7KwWTcfUVee`.
- **`/products/high-voltage`** — **partial, in progress.** The hero and the first
  section of Figma `1719:27`; Aldo's design for the rest of the page is not
  finished. The four remaining section nodes are listed in `docs/DESIGN-SYSTEM.md` →
  "Products — High Voltage".
- **`/solutions/energy-arbitrage`** — complete and **signed off 2026-09-09**.
  Eight sections, all new except `Cta`. See session 7 below and the long
  "Solutions — Energy Arbitrage" chapter in `docs/DESIGN-SYSTEM.md`.

**Two pages are now signed off, and the arbitrage page is the pattern for the
rest of Solutions** — its `ImageHero`, `SolutionSplit`, `ModelCards` and
`CaseFeature` are written to be reused, and its content file is the shape a
solutions page's JSON takes.

Every other nav link is still a dead href.

**The home page is now the declared source of truth for every page that
follows.** Aldo's instruction: match its UI, fonts, colours, animations, cards,
pixel-card hover and hero composition rather than inventing a parallel set.
That system is written up in `docs/DESIGN-SYSTEM.md` under **The design system —
the source of truth for new pages**; read it before starting a page. The next
page's design is coming from Aldo.

```bash
npm run dev     # :3210   (v1 is on :3211)
npm run check                   # production build into .next-check
```

**Never run `npm run build` while `next dev` is live** — it overwrites `.next`
and the dev server 404s on `main-app.js`, so nothing hydrates and the page
renders as unstyled inert markup. `npm run check` exists to avoid exactly that.
Full note in the README.

### Section order (`src/app/page.tsx`)

Hero → Statement → dissolve → **Products** → Services → Strings → Marquee →
CloudLink → dissolve(overlap) → Projects → **Stats** → dissolve → CTA → Footer.

Reordered 2026-09-14: Products moved above Services, Stats below Projects.

All three PixelDissolve bands sweep **up**.

---

## Session 10 (2026-09-15 → 16) — project cards, the rail, and a tidy-up pass

`npm run check` passes. Home page only.

### What changed

- **Two new project cards after Hospitality** — *Bedfordview Frontier*
  (Residential) and *Rosenhof Dairy farm* (Agriculture), Figma `1805:1693` /
  `1805:1707` and `1805:1721` / `1805:1735`. Seven cards now. No component
  change was needed: the map-plate-slides-up-on-hover mechanism already handles
  both states, so these are content plus four assets.
- **Assets**: `maps/bedfordview.webp`, `maps/rosenhof.webp`,
  `projects/bedfordview-frontier.webp`, `projects/rosenhof-dairy.webp`. The
  Figma masters were 3MB PNGs; capped at 900px (maps) / 1200px (photos) and
  encoded to webp they are 86 / 44 / 291 / 203 KB, in line with the existing set.
- **The rail auto-advances.** One card, hold 3s, next; at the end it runs back to
  the first and repeats. Full write-up in the README.

### The two things that would cost the next person time

1. **An autoplay over a scroller must not listen to `scroll`.** The tween writes
   `scrollLeft` every frame, so scroll-as-interaction makes it interrupt itself
   on frame one. Only real input events count — `wheel`, `touchstart`,
   `pointerdown`, `keydown`, `focusin`.
2. **A stop list built from card offsets has a bad tail.** Each offset is clamped
   to `scrollWidth - clientWidth`, so the last two or three collapse onto the
   same value — `[0, 475, 950, 1426, 1901, 1926, 1926]` here. Unfixed, the rail
   ends on a 25px twitch and then holds three seconds on it, which reads as a
   stall. Drop near-duplicates and pull a final near-end stop onto the end.

### Flagged, not done

- **The comp's static state shows "860 MWh" on *both* new cards** — the MalaMala
  figure, copy-pasted. The hover states carry the real numbers (430kWh and
  461 MWh) and those are what shipped, normalised to "430 kWh" / "461 MWh".
  Worth a second look if either figure matters.
- **"Rosenhof Dairy farm"** keeps the comp's lowercase "farm". Not corrected,
  because it is a name.
- Both new `href`s (`/projects/bedfordview-frontier`,
  `/projects/rosenhof-dairy-farm`) are dead, like every other project link.

### Then a run of small, precise changes (2026-09-16)

All content or single-rule CSS; nothing structural.

- **Three project sectors relabelled to `Hospitality`** — The Outpost and
  Kirkman's Kamp were *Lodge operations*, Rattray's was *Ultra-luxury safari*.
  Four of the seven cards now carry the same chip; flagged as possibly
  repetitive, left as asked.
- **Footer copy moved and rewritten.** The line under the heading went from
  trailing the buttons to sitting between the title and them — pure source
  order, each block carries its own `margin-top`. Its measure went `34ch` → `30rem`
  so it holds one line (it needs 438px and `.brand` is 544 wide); at 360 it had
  been breaking *inside* "end-to-end" at the compound's own hyphen.
- **"Connect with us" added over the social row**, and the pair bottom-aligned
  with the Contact row's stroke opposite — measured at exactly 0 offset.
- **Statement: the aside lifted 50px, the rotating claim 30px.** Both as
  `position: relative; top`, never a margin — see below.
- **`home-2026-09-16-1600w.png`** in `context/_exports/`: the whole home page,
  1600 x 13752. The shooter is described below and is worth keeping.

### Three more things that would cost the next person time

3. **On a pinned plate, "move it up 50px" is not a margin.** The Statement's
   `.aside` is `align-self: end`, so a bottom margin grows the row, the grid and
   the plate — 739 + 50 + 220 of frame padding is 1009 in a 900 viewport, which
   puts the plate's own foot below the fold for the whole pin. And trimming the
   claim's `margin-top` *shrinks* the grid, which lifts the bottom-aligned aside
   with it: two blocks moving when one was asked for. `position: relative; top`
   moves the block and nothing else. **Scope it** — below 1024 the aside stacks
   under the claim and -50px overlapped them by 5px at 900 and 10px at 390.
4. **A required content key that has been deleted still renders.** `footer.sub`
   was removed from `site.json` between sessions; `Footer.tsx` still declared it
   `sub: string` and rendered `<p>{sub}</p>`, so it shipped an **empty paragraph
   still carrying its 20px top margin**. `load<Site>` cannot check JSON against
   the type, so nothing caught it. Now `sub?: string`, rendered only when
   present. Worth assuming the same of any other key Aldo removes.
5. **A full-page screenshot of this site cannot be taken in one pass.**
   `captureBeyondViewport` renders past the viewport but IntersectionObservers
   still fire against the real one, so every `Reveal` below the fold photographs
   at opacity 0; and a giant viewport breaks the `100lvh` sections and the
   sticky pins instead. The working approach is a real 900px viewport scrolled
   in bands and stitched — script kept, see below.

### The page shooter

Headless Chrome over CDP, driven from Node with **no dependencies** — Node 24
has a global `WebSocket`, so `fetch` for the endpoint plus one socket is the
whole client. It lives in the session scratchpad rather than the repo; if it is
wanted again the three things it has to do are:

- every move through `lenis.scrollTo(y, { immediate: true })`, because Lenis owns
  the offset and animates back over a bare `window.scrollTo`;
- `position: fixed` layers hidden after the first band, or the nav is stamped
  into all sixteen;
- `[class*="ScrollRevealTitle_char"]{opacity:1 !important}` before capturing.
  Those titles wipe 0.22 → 1 across `top 80%` → `top 20%`, so a heading near the
  top of its band is a fifth of the way through its reveal and photographs
  half-grey. GSAP writes the opacity inline, which `!important` beats.

The hero appears four times in the export and the Statement twice — both are
pinned and genuinely hold across several screens. Not a stitching fault.

---

## Session 9 (2026-09-15) — CloudLink goes light

`npm run check` passes. Home page only.

### What changed

- **The Marquee band and CloudLink are white.** Aldo's brief: background
  `#ffffff`, leave the traces, the handset and its glow and the ticker's drift
  alone, adapt everything printed on the ground. So: title → `--blue-700`,
  eyebrow → `--blue-400`, body → `--n-700` (emphasis `--n-900`), the floating
  tags from smoked-glass to opaque `--blue-500` pills with white chevrons, and
  the store badges onto a `--n-100` plate.
- **`StoreBadge` gained `tone`** — `dark` (default, the stores' near-black
  lockup) and `light`. Both logos already draw with `fill: currentColor`, so the
  mark follows the label with no second asset.
- **Both now carry `data-nav-light`**, so the bar takes its light palette over
  them. The attribute and not `.on-light`, which would drag `--cyan-ink` in.
- **The three circuit traces now leave through the right edge**, stepping down
  and out at y = 660 / 712 / 750, where all three used to run down to y=980 and
  stop dead in the white above Projects. `.flow` also gained `overflow: hidden`
  — without it nothing ever cut them.
- The page's light run is now continuous from `Strings` to `Stats` — `--n-75`,
  white, white, white — with no seam to manage.

### The thing that would cost the next person time

**`background: ffffff` was invalid, and the page had been using the fallback as
a design.** No `#`, so the declaration was dropped and the section computed to
transparent — and what it let through was `body { background: var(--black) }`.
This section had read as "the darkest ground on the page" for months while its
own stylesheet said white. Fixing the one character was most of the brief.
→ **A section whose ground you cannot find in its own stylesheet is a bug, not a
convention.** Diff the computed value against the declared one.
→ And **a section that changes ground has to tell `Nav`**: it reads
`.on-light, [data-nav-light]` once on mount, so a light section without the flag
keeps the dark palette and puts a white logo on white glass.

### The second thing that would cost time

**Under `slice`, the visible floor moves with the viewport — and the traces had
been aimed at it.** Width always drives the scale (the marquee hand-over depends
on that), while the section's height caps at 950, so the viewBox's visible
height is `sectionHeight / (width / 1440)`: **900 units at 1440, 761 at 1798,
713 at 1920, 534 at 2560.** A tail authored to leave through the floor leaves
through a different floor on every screen. The **right** edge is the stable one:
x maps with no offset, so x=1440 is the right edge at every width. Aim tails
there.
→ And the reason it read as broken rather than merely cropped: **nothing was
clipping the svg.** `FlowLines` sets `overflow: visible` for Products' sake and
`.sec` said `overflow: show`, which is not a value. The traces drew 274px past
the section. Two invalid/absent declarations in one section, both silent.

### The third thing — and the one that actually read as "unfinished"

**Re-routing the tails was not enough; the traces were invisible.** Measured
against the two grounds: trace @0.3 is 1.31:1 on black and 1.52:1 on white —
barely moved. But the **pulse**, `--cyan-400`, is **12.73:1 on black and 1.65:1
on white**. It went from the brightest mark in the section to the faintest, so
the only part of it still registering was its 4px `drop-shadow` — a bright
smudge with no line under it. The eye caught a fragment and nothing joining it
to an edge.
→ Charge is `--blue-500` now (6.93:1); traces raised to 0.75 / 0.5 / 0.55.
→ **On a light ground a charge must be *denser* than its trace, not brighter.**
That relationship inverts with the field and is the one thing that does not
survive turning a section over.
→ How it was pinned down, worth reusing: prove the geometry first by reading
each path's last point through `getScreenCTM()` (all three land at x=1560
against a 1440 edge), then restyle the traces to 4px solid red and screenshot.
Once red lines visibly ran off the edge and the shipped ones did not, the
question stopped being "where do they end" and became "can you see them".

### Still open
- **At 390 the left-hand tag still hangs off the edge** ("Fleet management" is
  clipped). Pre-existing: the `≤767` rule re-anchors it to `right: 84%` and that
  is not enough for the longest label. `body { overflow-x: hidden }` is what
  stops it scrolling the page. More noticeable on white than it was on black.

---

## Session 8 (2026-09-14) — Products redrawn, and Services replaced

`npm run check` passes. Home page only; the two other routes are untouched.

### What changed

- **The two rows are mirrored.** High Voltage now leads with its render on the
  **left** and copy on the right; Low Voltage is copy-left, render-right. The
  comp is the spec and Aldo confirmed the swap before it was made — the live
  build was the other way round because the run had been drawn to his own sketch
  ("down the right margin, left under the top render…").
- **The circuit run mirrored with it** — every x is `1440 - x`, the pair's offset
  went negative, and the two XL reach constants swapped ends. Those three move
  together; the README says so.
- **HV/LV copy rewritten** and both rows gained the comp's **blue kicker**
  (`--blue-400`, `.t-eyebrow`): *Commercial & Industrial* / *Homes and small
  businesses*. The blue tick before the row titles is **gone** — the comp does
  not draw it. Row body ink moved `--n-600` → `--n-700`, the comp's `#2D3748`.
- **`Partnered Innovations`** — a new blue panel closing the section, with the
  cut-out photograph, and the run now finishes in it. Full write-up in the
  README; content is `products.partners` in `content/home.json`.
- **`Reveal` gained `variant="none"`** — the observer and its `data-in`, no
  entrance of its own, for a section that drives all of its own parts. The panel
  is the first caller; `DayOnTheMeter` hand-rolls an observer for the same reason
  and could be moved onto it.
- One stray **U+2028** removed from `products.title`. Three more remain in
  `stats` (four characters across three strings) — same no-op, left alone
  because they are outside this change.

**Then, the same day: the "five ways" section was replaced.**

- **`Services.tsx` is out, `HowWeWork.tsx` is in** — Figma `1797:618` and
  `1797:684`. One heading ("How we put intelligent energy to work") over two
  halves: *Our process*, five icon steps that stagger in, and *Your options*,
  the two commercial routes as pale-blue cards. Content moved from
  `home.json` → `services` to → `howWeWork`.
- **The five solutions links are gone from the home page.** They are still in
  the nav's Solutions mega-panel and at their own routes. The retired copy is in
  `context/_concept-backups/services-five-ways/` — that directory is the only
  copy of it, since the repo has no version control.
- `Services.tsx` / `Services.module.css` are **dead code** now, and so is the
  `Service` type in `lib/types.ts`. Kept on the same terms as `RadialFan`.
- **`emphasise` now also takes `[label](href)`**, rendering a `next/link`. First
  caller is card 02's two sub-columns.
- **`Reveal` gained `variant="none"`** earlier in the session; `HowWeWork`'s
  process row is its second caller.
- **`Reveal` also gained `data-out`** — the edge the element left by, `"up"` or
  `"down"` — so an exit can travel in the reader's direction instead of reversing
  the entrance. `HowWeWork` sets `repeat` on its subheads, its process row and
  its options list, so the whole section now plays **out** as well as in.
  Entrances 620/820ms on a 90ms stagger; exits 390/500ms on 45ms (~62%, the
  house ratio).

### The three things that would cost the next person time

1. **`height: auto` on an `<svg>` is its viewBox aspect ratio, not the box `top`
   and `bottom` describe.** A viewBox makes the svg a replaced element with an
   intrinsic ratio, so `bottom` is silently ignored and the height lands at
   `width x viewBoxH/viewBoxW`. At 1440 that happened to equal the right answer
   exactly; at 1280 it was 88px short and the run's tail hung in the white above
   the panel. Presents as "the lines stop early, but only at some widths". Set
   the height outright — `calc(100% - …)`.
2. **The dev server's image optimiser can wedge, and it reads as a broken
   component.** A new `next/image` source returned `complete: false`,
   `naturalWidth: 0` and an empty `currentSrc` forever, while `fetch()` on the
   same URL returned 200 and `sharp` encoded the file standalone in 91ms. A
   `curl` with a browser `Accept` header hung past 120s. **Restarting `next dev`
   fixed it** — 0.14s afterwards. Before suspecting the asset or the CSS, check
   whether the optimiser answers a curl. (Related: README's dev-server-noise
   note.)
3. **A photograph inside a panel should be sized off the panel's height.** The
   plate is as wide as the page while its height is the comp's, so a width share
   that looks equivalent is not: at 1440 it made the figure 663 against the
   comp's 545 and clipped 22% of the image instead of 5.5%.
4. **A `transition` shorthand hands its delay to every property in it.** The
   process cards carry a staggered entrance *and* an instant hover, and with one
   shorthand the stagger landed on `background-color` too — the fifth card took
   360ms to answer the pointer. Per-property delays fix it; the rules split the
   same way, `scaleY` for the entrance and `opacity` for the hover, so the two
   never write the same property.
5. **A numeral's line box is not its glyph.** `line-height: 1` on a digits-only
   run leaves the descender half of the em empty — 25px of phantom leading at
   90px, which pushed a card 28px past the comp. `.72` is the glyph's own share;
   digits have no descender, so nothing clips.
6. **A CSS transition is read off the style the element is moving _to_.** That
   is what makes a two-way reveal cheap: the base rule governs leaving and the
   `[data-in]` rule governs arriving, so enter and exit get different durations
   and staggers with no extra class and no JS. Worth knowing before reaching for
   a library.
7. **A two-way reveal needs to know which edge it left by**, or one of the two
   directions is always wrong — share one rest state and the content sinks back
   down as it leaves upward, which reads as falling behind rather than leaving.
   `Reveal`'s `data-out` plus a single `--y` custom property is the whole fix.

### Flagged, not done

- **The comp labels both rows' primary button *More about Low Voltage*.** Read as
  a copy-paste slip; High Voltage ships *More about High Voltage*.
- **At exactly 1440 the page has no gutter at all.** `globals.css` zeroes every
  wrapper's inline padding from 1440 up and relies on the `--maxw` cap plus
  centring for the margin — which is nothing at 1440 itself, so the section
  heading and the new panel both touch the viewport edges. Pre-existing and
  site-wide, not specific to this section, but the comp clearly draws a ~128px
  gutter there. Aldo's call.
- **`--t-h3` renders 35.2px at 1440 against the comp's 32**, and `.t-h3` is
  weight 700 against the comp's 600. Pre-existing — the row titles already used
  it — so it was left on the scale rather than changed under the whole site.
- **"Intergration" corrected to "Integration"** — the comp and the delivered icon
  filename both have the typo. The file keeps its name; `HowWeWork`'s `ICONS` map
  reconciles the two.
- **A duplicated sentence dropped from *Configured solutions*.** The comp ends
  the *Funded partnerships* column with "…energy arbitrage and where wheeling."
  and then repeats it, in bold and without the stray "where", as the card's
  footnote. The footnote is kept; the trailing copy is not.
- **`HowWeWork`'s eyebrow is `--blue-400`, the comp's colour, where every other
  eyebrow on the page is `--cyan-ink`.** It is 4.46:1 on `--n-75` — a whisker
  under AA for 13px label text, and the only eyebrow on the page that differs.
  Either unify on blue or hold this one apart; `--blue-500` is 6.47:1.
- **The Aspen and Idwala links point at `/projects`**, which is what the nav's
  own chips for those two projects do. Neither has a page of its own.

---

## Session 7, continued (2026-09-14) — nav, mega-nav, Statement, page order

Same session, a week on. `npm run check` passes throughout; the home page and
both other routes are unchanged in weight.

### What changed

- **`/products/high-voltage` started** — the hero (259 product frames, 333 MB of
  PNG re-encoded to 15.8 MB of webp) and `BusinessStakes`, the four numbered
  claims. Four sections of the comp still to come; see the README table.
- **`About` is hidden from the nav** — `nav[4].hidden: true` in `site.json`, a
  flag `Nav` filters on **once, above both the bar and the sheet**. The entry and
  its four children stay in the file. The footer still links to `/about`.
- **The Solutions dropdown is a mega-nav** (`MegaPanel`, Figma `1780:6513`) —
  three columns, chips, a footnote and a promo card. It expands its white plate
  by `clip-path` and then staggers the columns in; the exit is one object.
- **The bar's surface**: pills and small dropdowns both at `--r-nav` (8),
  `rgba(0,0,0,.4)` and a 6px blur, and a dropdown is never narrower than its
  trigger (`min-width: 100%`).
- **The Statement pins and rotates a claim** — "WE KEEP" over four lines that
  change as you scroll, then the page continues. This is the biggest structural
  change on the home page: the section is now a screen plus one hold per line.
- **Home page reordered**: Products above Services, Stats below Projects.

### The three things that would cost the next person time

1. **Pinning a section freezes every scrub inside it.** A stuck element's rect
   does not move, so `scrubProgress` on its own box returns a constant. The
   Statement's flow lines sat at 0.71 for 1,728px of scroll, permanently
   half-drawn, with nothing in the console. Fixed with a zero-size marker outside
   the pin and `FlowLines`' `anchors`.
2. **A pinned plate must fit the screen, and its padding must be sized in `lvh`.**
   Aldo reported the lines "look unfinished" — they were fully drawn, but the
   plate was 890 + 220 of frame padding in a 900 viewport, so the bottom 89px,
   where the traces exit, was below the fold for the whole pin.
3. **Reordering the page breaks cross-section anchors.** `Products` used to
   bracket its draw to the heading of whatever section followed it —
   `#stats-grid`, then `#services-title`. **No longer:** it now brackets to
   `#partnered-innovations`, its own panel, so both landmarks are inside the
   section and the page order cannot reach them. If another section grows a
   cross-section anchor, this is the trap.

### Flagged, not done

- ~~`CloudLink.module.css` has **`background: ffffff`**~~ — **fixed 2026-09-15**,
  when Aldo asked for the section to go white. The diagnosis here was half right:
  the declaration was indeed invalid and dropped, but what showed through was
  `body { background: var(--black) }`, not white — which is why the section read
  as the darkest ground on the page while its own stylesheet claimed otherwise.
  `overflow: show` in the same rule is still invalid and still discarded; left
  alone, because changing it changes what the render may spill past.
- The `nav` burger is still `rgba(0,0,0,.2)` while the pills moved to `.4`.
- The mega-nav's eleven destinations are guesses against routes that exist; the
  comp names none of them.
- The mobile sheet still renders the old five-item Solutions list, not the mega.

## Session 7 (2026-09-08 → 09) — Solutions / Energy Arbitrage, built and refined

The second page of the site, from Figma `1693:195` and a run of Aldo-selected
refinements. **Signed off by Aldo on 2026-09-09.** `npm run check` passes; the
route is **6.45 kB / 165 kB** first load. Nothing on the home page changed
except three shared components, all backwards-compatible.

### What exists

`app/solutions/energy-arbitrage/page.tsx` + `content/solutions-energy-arbitrage.json`,
composing eight sections — `ImageHero`, `CommercialCase`, `SolutionSplit`,
`ArbitrageMoves`, `DayOnTheMeter`, `ModelCards`, `CaseFeature`, `Cta`. The
ground alternates blue / light / blue / light and closes on black, which is the
home page's own rhythm.

**All of the how-and-why is in `docs/DESIGN-SYSTEM.md`** under "Solutions — Energy
Arbitrage". This section is the orientation only.

### Shared components that changed (check these before touching the home page)

- **`lib/motion.ts` gained `exitProgress` / `onExit`** — a third scroll ramp for
  anything pinned to the top of the document. `onScrub` now delegates to a
  shared quantised driver; its behaviour is unchanged, and `Projects` and
  `RadialFan` were left alone.
- **`Reveal` gained a `rootMargin` prop**, and its viewport rescue is now scoped
  to the default margin — otherwise a custom margin is silently defeated.
- **`ScrollRevealTitle` renders `\n` as `<br>`**, and renders it as
  `<Fragment> <br /></Fragment>`: accessible-name computation inserts no
  whitespace for a `<br>`, so a bare one had the a11y tree read "built
  aroundyour business".
- **`PixelCard` gained `barBlue` / `barGreen` variants and an `active` prop** for
  driven (non-hover) use.
- **`ScrollSnap` is new** and mounted in the layout — soft snapping for any
  section carrying `data-full-vh`.
- **`globals.css`** gained Sora 400, the `--t-h2s` / `--t-h3s` / `--t-h5` steps
  and their utilities, and `[data-full-vh] { min-height: 100lvh }`.

### The refinements Aldo asked for, in order

Hero parallax strength → the resting frame up 15px → how to edit copy → the
split heading up to `t-h2s` → five capability chips under it → their borders
drawn in with the title → the meter bar redrawn from `1765:4070` → the duplicate
card numeral removed.

Four of those turned up bugs that looked like taste questions, and each is
written up in the README with its measurement:

1. **The hero's parallax was delivering half its travel.** `scrubProgress`'
   span is `viewport + element`, so a masthead — never scrolled *in* — starts at
   ~0.5 and can never reach the lower half of its ramp. Hence `exitProgress`.
2. **Growing a `cover` plate is not a translate.** Asked to lift the hero's
   resting frame 15px, growing the plate delivers −11.9px in the sky and −3.0px
   at the mark, because the plate's height is also the scale. The parallax is
   now `--reach` / `--head` / **derived** `--lift` so a framing change cannot
   spend crop.
3. **A `1/n` flex basis only knows today's copy.** Five equal shares of the
   split panel is 92px at 1024 and "Commissioning" is 121px — it hung 14px
   outside its chip. Fixed with `min-width: max-content` + `max-width: 50%` and
   **no breakpoint**, swept at 14 widths.
4. **Aldo keeps typing U+2028** (Shift+Return in his editor), which does nothing
   in Chrome. Three more arrived during his copy pass. **Grep any new copy for
   `chr(0x2028)`.**

### Assets added

`public/images/solutions/` — `arbitrage-hero.webp`, `arbitrage-design.webp`,
`cerebos-aerial.webp`. `public/images/icons/solutions/` — five service icons,
Aldo's own exports, referenced not redrawn. One is delivered as
`Icon_Field service.svg`, **with a space**; the path is percent-encoded in
`SolutionSplit`'s `ICONS` map rather than the file renamed, because a re-export
will land on the same name.

## Session 6 (2026-09-08) — copy editing, and three home-page changes

Started as a question — *"what will be the best way for me to edit the copy"* —
and ended with two new conventions. `npm run check` passes; `/` is 139 kB.

### Where copy actually lives

Audited rather than assumed. **All home-page section copy plus nav and footer is
already flat JSON** in `content/home.json` and `content/site.json`, read by
`lib/content.ts`. Editing either file takes effect on the **next request** — no
restart, no rebuild. Verified end to end against the running dev server: patched
`marquee`, curled `:3210`, saw the new string, restored the file byte-identical.

The README's claim that no component has copy baked in was **out of date**. Still
hard-coded, roughly 200 strings:

| File | Strings | What |
|---|---|---|
| `sections/SavingsCalculator.tsx` | ~104 | step titles and blurbs, the two connection-type cards, the 5 sim features, every button and field label |
| `lib/savings.ts` | ~78 | tariff, profile, battery and location names, plus every read-out row label |
| `ContactPanel.tsx` | 22 | the whole contact form |
| `Nav.tsx` / `Footer.tsx` | 10 | "Login", "Get In touch" |

**Recommended order, agreed in principle, not started:** extract those into
`content/calculator.json` and `content/contact.json` first, so all copy is one
folder; *then* build the `/admin` editor over the same files. Doing the admin
first leaves half the copy needing a code edit.

Two JSON traps found and now in the README:

- **`hero.eyebrow`, `hero.title`, `hero.copy` are dead keys.** `SequenceHero`
  renders only from `hero.beats[]`; `beats[0]` is the first screen. Editing the
  top-level trio changes nothing on screen.
- **`statement.title` contains a literal U+2028** line separator, which is what
  forces its break. Invisible in most editors, prints as a space in a JSON dump,
  silently lost if the line is retyped.

Also flagged, not acted on: **the repo still has no version control**, so a copy
edit has no undo beyond the editor's. One `git init` closes that.

### 1. Statement — two independent eyebrows

The panel renders the eyebrow twice (once over the heading, once over the body
copy) and both read the same key. Split: `statement.eyebrow` → the heading side
("how we see it"), new **`statement.asideEyebrow`** → the copy side ("how it
works"). `Statement.tsx` and `page.tsx`'s `Home` type updated.

### 2. Inline emphasis — a new convention

A phrase wrapped in asterisks in any `content/*.json` string steps up to medium
weight: `"the *connective intelligence* that makes …"`. `lib/emphasis.tsx` turns
each run into `<span class="t-med">`; `globals.css` gives `.t-med`
`font-weight: 500` — a real Montserrat Medium face, not synthesised — and
`color: var(--em-ink, inherit)`, the same arrangement as `.t-eyebrow` and
`--eyebrow-ink`. CloudLink's `.copy` sets `--em-ink: var(--white)`, so its
emphasised runs are full white against 74% white body copy.

Escape a literal asterisk as `\*`. **A section opts in by rendering
`{emphasise(copy)}` instead of `{copy}` — only CloudLink does so far.** The
whole-line form of the same convention already existed in the footer's
`presence.lines`.

Why not markup in the JSON: it is what the copy editor edits, and anything
markup-shaped there invites HTML in a string we would have to trust.

### 3. Reveal now exposes `data-in`

`Reveal` mirrors its state onto a `data-in` attribute as well as its `.in`
class, because the class is hashed into `Reveal.module.css` and cannot be named
from a section's own stylesheet. This is the hook for a descendant that wants an
entrance of its own off the same observer.

First use: Services' **01–05 numerals** rise 48px and fade, on top of the row's
own 28px and 120ms behind it, so the column reads as a count-in. The delay is
`calc(var(--rd, 0s) + 120ms)` — `--rd` is the per-row stagger Reveal sets inline.
**A fixed delay was the first attempt and was wrong:** every numeral moved
together whenever the whole list crossed the threshold in one observer batch,
which is what a flick or an anchor jump does. Measured delays are now
0.12 → 0.36s and all five reach `opacity: 1` / `translateY(0)`.

Prefer `data-in` to nesting a second `Reveal`: the nested wrapper becomes the
grid item and takes the child's `grid-area` with it, which would break the
Services row layout below 1024px.

### 4. Stats labels capped

`.label` in `Stats.module.css` → `max-width: 400px`. Verified on all four cards:
400px rendered inside 716px cards, wrapping to two lines.

### Copy has moved on

Aldo rewrote a lot of `home.json` by hand between turns this session — the hero
beats ("Energy that works for you."), the statement title and body, all four
stat labels (each now carries a second sentence), the CloudLink paragraph and
every Services item. Anything quoted in the earlier sections of this file is
likely stale; read the JSON.

### Next

Aldo is moving to **the next page**. The home page remains the declared source
of truth — see the README's design-system section before starting.

---

## Session 5 (2026-09-03) — the contact sheet

`/contact` now opens a right-hand form sheet, on the **same stage** as the
calculator. `SavingsStage` holds a `mode` (`savings` | `contact`) instead of a
boolean, so one component still owns the shell's transform — two overlays both
animating `scale`/`translate` on it would fight. Full write-up in
`docs/DESIGN-SYSTEM.md` → **The contact sheet**.

- Site knocks back to `scale .94` and **stays put**; the nav **retracts
  upwards**; the sheet slides in from the right over a `.42` scrim.
- Form follows on.energy's `.panel` (nine fields, three groups) with Hubble's
  own styling — white sheet, visible labels, real radios behind pills.
- **No endpoint.** Submit validates and shows a success view; the POST is a
  `TODO` in `ContactPanel.tsx`. It currently says "that's with us" and sends
  nothing — must be wired before any page with it goes live.
- `Button` gained a `type` prop, because it rendered `type="button"` and so
  could never submit a form.

Three bugs found and fixed while building it, all worth knowing:
`.dock` needed `z-index: 2` to beat the shell (at 0 the whole form was
unclickable behind the knocked-back site); the nav retract needed a **length**
not a percentage (`.bar` is zero-height, so `-140%` was 0); and mode rules must
key off `data-mode`, never `data-open`, since both modes are "open".

---

## Session 4 (2026-09-03) — the calculator, and a cleanup pass

Home page only; still no new routes. Everything is in `docs/DESIGN-SYSTEM.md` in
detail — this is the orientation.

**The savings calculator went from placeholder to finished.** Seven steps, and
it is available on every route already: `SavingsStage` wraps `{children}` in
`app/layout.tsx` and binds **one document-level capture listener** for
`a[href="/calculate-your-savings"]`. New pages need no wiring, and there must
be no route for it.

- Step one is an **intro screen** — the rail and the running total are absent
  until a connection type is chosen *and* confirmed, then the left column opens
  and they animate in.
- **Every step is a `.stack`** (chooser row → control + read-out → chart), not
  the old two-column `.split`, which is gone. `.optionCards` makes one equal
  column per option whatever the count.
- **Charts** live in `sections/SavingsCharts.tsx`: an hour × season rate
  heatmap, a day/generation area curve with a hover *and keyboard* read-out,
  and a donut with a legend. Hand-drawn SVG.
- **Reset and Share** sit beside the progress ring. Share builds the estimate
  as a standalone A4 document in a new window and calls `print()` — the browser
  gives "Save as PDF". Chosen over a PDF library; the trade is one dialog step.
- The **selected card** is a blue tile with white type, and the fill animates
  from a `::before` layer because gradients are not interpolable.
- The card's drop and the panel's height are one token, `--calc-drop` (100px).

**Cleanup pass, same session.** Two real bugs found and fixed:

1. The site chips never transitioned their lift, shadow or text colour —
   `.chip` is declared twice in `SavingsCalculator.module.css` and an earlier
   edit had landed on the losing declaration. **This file declares ~40
   selectors twice** (a base block plus a "Restored from the prototype" section
   at the foot, which wins). It is the file's main hazard: check which
   declaration wins before editing one.
2. `.side > figure { display: none }` at ≤560px silently stopped matching when
   the steps became stacks, so the charts had been reappearing on phones. Now
   `.stack > figure, .duo > figure, .plate > figure`.

Also: 55 lines of dead CSS removed (`.split` `.rows` `.side` `.chips`
`.stepOf` `.fine` — the abandoned two-column pattern), the README's
project-card and savings-drawer sections rewritten (both described mechanisms
that no longer exist), and a stale cross-module comment corrected.

**Open, for Aldo:** ESLint is not configured and both build scripts pass
`--no-lint`. Static checking is `tsc --noEmit` plus reading. Worth setting up
before the page count grows, but it is a project decision and will churn.

**Still blocked:** Figma MCP cannot read `EhfzMjyCPVx7KwWTcfUVee` — re-tested
2026-09-03, still *"you don't have edit access to this file"*. Designs have to
arrive as screenshots. Aldo has been giving them that way and it works fine.

---

## Session 2 (2026-08-25 evening) — what changed

Home page only; no new routes. All of it is in the README in detail.

- **Stat cards gained hover glyphs.** wrench / bars / bolt / africa, from
  `public/images/icons/Pixlecard{1..4}_icon.svg`, drawn as CSS masks in
  `#1239B4`, fading in place (no travel) *above* the pixel canvas. This
  **answers the old open question** about the burst artworks — they return over
  the canvas, not under it. The card's ground moves on `--ease-in-out`, not
  `--ease-out`: on an expo curve a colour snaps and then has a long invisible
  tail, which read as "no transition at all".
- **The Products circuit run was rebuilt to Aldo's sketch** — down the right
  margin, left under the top render, up through it, left into the gap, the long
  fall down the middle, left through the bottom render, up out of its roof,
  left along its shoulder, down through it and out. Corners kept rounded at 46,
  against a sketch drawn square. **Flag if this matters.**
- **Its projection changed** to `0 0 1440 1210` with `preserveAspectRatio="none"`,
  and `.flow` is now capped to `--maxw` and centred. Both were mis-tracking the
  layout — the run drifted off the renders at every width but one, and its tail
  ran down *beside* the first stat card instead of behind it. README has the
  arithmetic.
- **The draw is now bracketed by two landmarks** rather than a scroll fraction:
  it starts as *High Voltage* scrolls into view and finishes as the *first two
  stat cards* do. New `betweenProgress()` in `lib/motion.ts`, new `anchors` /
  `drawDelay` / `lag` props on `FlowLines`. `intoProgress()` was added and then
  removed when the landmarks superseded it.
- **Footer type came down.** Column links and presence lines to `.8rem`;
  "South Africa" and "Nigeria · Zambia" now render as region headings, marked
  in `content/site.json` by wrapping the line in `*asterisks*` (a convention the
  Footer strips). SemiBold 600, not 700 — Montserrat ships no 700 here, so 700
  would be a synthesised fake bold. Panel top padding cut 30% (every stop of the
  ramp, not just the cap).
- **Statement panel** now has an 80px left inset, via `--gut` so it matches the
  page's own gutter and still gives way on narrow screens.
- **The savings drawer concept was built** — see below.

## Hero sequence re-export (2026-08-26)

Aldo dropped a new desktop render into `public/sequence/desktop/`. It is a
**different animation** — an isometric grid of battery cubes, not the metallic
cabinet — at 2400×1359 (was 1800×1080), **422 frames** (was 351), 46MB (was
12MB).

Made to work: filenames normalised to the loader's contract via the new
`scripts/normalise-sequence.mjs`; frame counts made per-variant in
`content/home.json`; poster replaced with frame 000 of the new render; beat
frames rescaled 0/120/245 → 0/144/295 to hold their old 0%/34%/70% pacing.
README has the detail.

Three things this leaves open, all needing Aldo:

- **Mobile is still the old animation** — 351 frames at 900×1600, a portrait
  render of the *cabinet*. Desktop and mobile now show different scenes.
- **46MB of frames are fetched eagerly** on every desktop visit. The worker
  posts all 422 up front. At ~109KB/frame this is ~4× the old sequence, on the
  landing page's first screen. Options: re-export at lower quality, drop to
  ~250 frames, or load in two passes (every 4th first, then fill in).
- **Beat frames are proportional guesses.** They hold the old pacing but were
  never picked against this animation's content.
- `public/sequence/old/` (12MB, the previous desktop render) is now unreferenced
  and can go once the new one is signed off.

## Session 3 (2026-08-26) — what changed

Still the home page only. Everything below is in `docs/DESIGN-SYSTEM.md` in detail.

**The hero.** Aldo dropped a new desktop render — a different animation
entirely (isometric battery cubes, not the cabinet), 422 frames at 2400x1359
against the old 351 at 1800x1080. Filenames normalised, per-variant frame
counts, poster and beat frames updated. See the README's *hero sequence*
section; the mobile variant is still the old cabinet animation.

**The hero, visually.** The vignette is gone. In its place a single 500px band
at the foot fading into `--blue-700`, flush with the section's bottom edge. The
copy's primary button is now the nav's `light` treatment (white plate, blue
label, blue arrow); `Explore`'s arrow went white.

**Statement, inverted.** Ground is now `--blue-700` — the same value the hero's
band lands on, so the two sections read as one continuous field with no seam —
and the plate is white with `--blue-600` type. Traces re-inked for a light
ground and made two-tone. The dissolve below it had to be re-sourced from
`--blue-700`; it was still leaving from `--ink-black`.

**A light navigation.** Figma `1589:2330`. Over any light ground the bar swaps
to a deep translucent navy (`rgba(0,29,96,.5)`), brand-blue carets, a blue
`Calculate your savings` plate and an inverted logo (`Logo2_onLight.svg`,
generated from `Logo2.svg` with its two fills exchanged). Detection is a single
probe at y=44 — the pill row's own middle — against `.on-light` and
`[data-nav-light]`. The old black scrim under the bar is deleted.

**Products.** The two renders are now `*_off` / `*_on` pairs that cross-fade as
each row arrives and **fade back out on the way up** — the lit layer is not a
`Reveal` for exactly that reason (see the README). Content carries `image` and
`imageOn`.

**Mobile work.** Statement is a full screen with the traces in a band along its
foot, drawn from their own short route. CloudLink reads bottom-up against
desktop — render, badges, words, full-width CTA — with its own upright phone
crop served by `<picture>`.

**Type and spacing.** Hero and every content wrapper lose their gutter at
1440+ (one rule in `globals.css` on `.frame`/`.wrap`/`.wrapIn`). Footer small
type down to `.8rem`, its plate's padding even top and bottom, column lists
tightened to `.2rem`, region lines bolded via an `*asterisk*` convention in
`site.json`. Statement's inner left inset is `--gut`.

**Nav order.** Products dropdown now lists High Voltage above Low Voltage,
matching the page.

**One real bug found and fixed:** every content button's arrow had been
invisible. `.chev` carried `padding-inline-start: .4rem`, the svg's `width="4"`
is a presentation attribute, and the global reset is `border-box` — the padding
ate the entire box and left zero content width. The button's own 12px `gap`
does that spacing now.

## Awaiting Aldo

### From session 8 (High Voltage — in progress)

- **259 source PNGs (333 MB) are still in `public/product sequence/`.**
  Everything in `public/` is served and copied into the build. The webp sets are
  made and in use, so these should move to `3D Files/Sequence/product/` with the
  other source sequences — **not done, because they are Aldo's source assets and
  moving 333 MB of them is his call.**
- **The phone gets the landscape render.** The landing hero has a dedicated
  portrait sequence for mobile; this one does not, so `product-mobile` is the
  same framing at 1200px and `cover` crops it hard on a phone. Either a portrait
  render or an accepted crop is a design decision.
- **The label row sits 161px in from the left on the comp**, not on the page's
  80px gutter — the frame is double-inset, which looks like a construction
  artefact. Built on the gutter with the rest of the hero copy; say if the comp's
  inset is intended.
- **`BusinessStakes` rows have no `href`.** The comp draws a ring on all four.
  Add a destination and the row becomes a link; the ring and the row-slide are
  already built for it.
- **The section is ~960 tall against the comp's 848** — see the README note. The
  comp's frame is auto-sized to its content, so it carries no padding at all.

### From session 7 (Energy Arbitrage)

**The page is signed off** — but these were flagged during it and none of them
were closed by the sign-off. They are all content or judgement calls for Aldo,
not defects that block the page.

- **`arbitrage-design.webp` is still the old crop.** He asked to replace the
  split panel's photograph with a pasted 3180x2576 image; a pasted image has no
  file on disk, and searching the project, Downloads, Desktop, Pictures and the
  Claude app's caches (including for untyped blobs by magic bytes) found nothing.
  **He needs to drop the file somewhere and name the path.** Once it lands: crop
  to ~0.8 centred on the engineer keeping the reaching arm, encode webp, and
  re-check the `width`/`height` props and `sizes`.
- **The meter's two new pale labels fail AA.** The comp's `#8798CC` measures
  **2.17:1 and 2.4:1** on its own grounds. Shipped as designed and flagged; the
  fix that keeps the design's character is the same hue darker — **`#4C5C93`**,
  which measures 4.91 / 5.44. (The `COST AVOIDED` contrast flagged in session 7
  *was* actioned by his redesign — 1.3:1 to 11.8:1 — so these flags do get read.)
- **The mobile hero's rule-link runs onto the dark cladding.** A consequence of
  his longer `hero.copy`: sampled across the link it is 4.6:1 at the left end and
  **1.0:1 for the last fifth**, where the arrow is. Desktop is fine. Four options
  offered (trim a line, raise the fade, put the link on a plate, drop it below
  the photograph on mobile); no answer.
- **The four `ModelCards` have no `href`.** Add one and the whole card becomes a
  link; the hover and focus states are already built for it.
- **`ArbitrageMoves` is the only section not on the 120px gutter at 1920**, which
  leaves its heading ~183px inboard of its neighbours. The route is the
  composition there, so it owns its own box. Flagged as a decision, not a bug.
- **`split.title` and the four card titles are his own copy now** — the
  other-brand placeholder text in `split.columns` was replaced during his pass,
  so that item is closed.

### Older

- **The savings drawer.** Working end to end but not signed off; revert is one
  script (`context/_concept-backups/savings-drawer/REVERT.sh`). The calculator
  panel is still a placeholder — heading and close button only.
- **Copy the comps show but the content does not carry.** The Statement's aside
  eyebrow reads "Our distinctive view", duplicating the heading's; both mobile
  comps say "Connected intelligence". CloudLink's mobile comp also shortens the
  paragraph to "…visible and responsive." Flagged four times, never actioned —
  they are content decisions, so they have been left alone.
- **The mobile hero sequence is the old animation.** 351 portrait frames of the
  cabinet against desktop's cube grid. The two variants now show different
  scenes.
- **46MB of hero frames are fetched eagerly** on every desktop visit.
- **CloudLink's mobile tags** are anchored in percentages authored for the wide
  render and sit over the middle of the new upright crop rather than beside the
  handset as the comp has them.
- **`phone-mobile.png` is 187KB.** A webp export would be a quarter of that;
  this machine has no encoder to do it.
- **Products run corners** are still rounded (46) against a square-cornered
  sketch.
- **The Statement panel is now asymmetric** — 80px left, 40px right. Offered to
  match; no answer.
- **The footer's small type is 12.8px throughout.** Deliberate, but it is below
  the site's body size everywhere else.

## Decided in session 1, and why

- **Hero sequence** is the only thing carried over from v1 (Aldo's explicit
  ask). 351 frames × 2 variants, worker-decoded onto one canvas.
- **Products order**: High Voltage above Low Voltage.
- **The radial fan was removed** from the services section and replaced by the
  interactive **Strings** field (`lib/strings-effect.js`, supplied by Aldo).
  `RadialFan.tsx` / `.module.css` still exist but nothing imports them — dead
  code, kept only because this repo has no version control. Safe to delete on
  request.
- **Stat cards** are solid blue plates with a **React Bits PixelCard** hover,
  vendored into `components/PixelCard.jsx`. The wrench / bars / bolt / africa
  marks were dropped here as unable to coexist with a full-bleed pixel canvas —
  **reversed in session 2**: they now fade in *over* the canvas on hover, from
  `public/images/icons/`. The older burst artworks in `public/images/burst/`
  are still unused.
- **`public/Strings section/`** is the original supplied package, kept for
  reference. Nothing loads it; the engine is bundled.

## Deliberate deviations from Figma

1. **Eyebrow contrast.** The comp's cyan is 2.5:1 on light grounds. Light
   sections carry `.on-light`, swapping in `--cyan-ink` `#00719A` (5.1:1). On
   black and on brand blue the comp's own cyan is kept — it passes there.
2. **Nav radius** is `--r-nav: 8px`, scoped to the bar, because every Figma node
   for the bar says 8. The page's buttons are still `--r-btn: 10px`. **Raised
   with Aldo three times, never answered** — ask before touching.
3. **Login label** held at 12px when everything else in the bar dropped 2px;
   10px would be below a readable floor.
4. **Project rail** is a real horizontal scroller, not a pinned scroll-hijack.

## Open questions for Aldo

- Kirkman's Kamp's card **back** face says "Hospitality / 860 MWh"; the front
  says "Lodge operations / 412 MWh". The front's values are live. Which is right?
- Cards 4 and 5 (Kirkman's, Rattray's) share the **same Sabi Sands map** — the
  comp does this, both being in Sabi Sand, but side by side it reads as a
  duplicate. Offered a different crop or an `object-position` offset.
- Three project **back-face photos are under-resolution** (The Outpost,
  Rattray's, Kirkman's — 564–608px against a 435px card at DPR 2).
- Nav pills are `rgba(0,0,0,.2)` per spec, which **nearly vanishes over the
  hero's near-black**. Fine on the light and blue sections.
- **`News`** has a caret in the comp's nav but no sub-pages; it renders as a
  plain pill.

## What is not built

Every route other than `/`. The v1 build has 40+ stubbed routes and a working
`/admin` CMS writing flat JSON — neither has been ported. `lib/content.ts`
reads the same flat-JSON shape, so the v1 CMS should point at
`content/` with little change.

**`content/*.json` is read at build time.** The dev server does not watch it —
touch a source file or restart after editing copy.

---

## Session (2026-09-01 → 02) — perf, XL breakpoints, CloudLink rebuild, calculator

Home page only. Everything below is in the build; `tsc --noEmit` is clean.

### 1. All three PixelDissolve bands are DISABLED

Commented out in `src/app/page.tsx` (three one-line uncomments to restore).
**Why:** `CELL = 5` / `ROWS = 24` was producing **5 880 cells per band —
17 640 total, 94.7% of the entire DOM** at 1222px wide (~27 600 at 1920), and
the scrub loop walked every one per frame. After: 987 DOM nodes, full-page
scroll median 16.7ms / p99 18.5ms.

CSS hiding would not have helped — the nodes are built and the rAF runs
regardless. If the effect is wanted back, the fix is the cell budget, not the
feature: `CELL: 30` / `ROWS: 6` is ~860 cells total, which is what the original
design ran at.

Left behind while they are off, both harmless: `.copyCol { margin-bottom }` in
CloudLink and the mobile `.ctaWrap` padding, which existed to clear the band.

### 2. `ScrollRevealTitle` — new, on all six section titles below the hero

`src/components/ScrollRevealTitle.tsx`. Per-character reveal driven by GSAP
ScrollTrigger, scrubbed `top 80%` → `top 20%`, `duration: 0.3`, `stagger: 0.02`
— the timing of the reference pen Aldo supplied (SplitType + GSAP + Lenis).

Deliberate differences from that pen:
- characters split in the markup, not by SplitType (no dependency; the text is
  already a React child). Words wrapped in `white-space: nowrap` — without it
  the browser breaks lines mid-word.
- **opacity, not `color`.** Mixing each title's colour toward its section
  background was tried and broke: CloudLink and Cta got no dim at all, Products'
  dim came out identical to its lit colour, because the ancestor-background walk
  found the wrong element. Over a solid ground the two are the same operation.

### 3. `ScrollTrigger.refresh()` after hydration — SITE-WIDE fix

In `useGsap()` (`lib/motion.ts`). Without it only the first two titles animated;
the other four sat permanently lit. ScrollTrigger does refresh on `load` and
`DOMContentLoaded`, but **both fire before Next hydrates**, so by the time a
trigger exists there is nothing left to re-measure — everything below the fold
is measured against a much shorter page and reads as past its end. Now fires on
rAF + a 400ms timeout + `fonts.ready`. Any other ScrollTrigger on the site had
the same latent bug.

### 4. Extra-large breakpoint: every wrapper on a 120px gutter at ≥1920

Nine sections now carry the same four lines — release `max-width`, set
`padding-inline: 120px`: hero content+hud, Statement frame, Services inner,
CloudLink grid, Products inner, Stats grid, Projects head, Cta grid, Footer
frame. Verified at 2560: all nine at gutter 0/0 against their section edges.

**Recommended cleanup, not done:** this collapses to one block in `globals.css`
beside the existing 1440 rule —
`@media (min-width: 1920px) { .frame, .wrap, .wrapIn { max-width: none; padding-inline: 120px } }`
— and the nine per-section overrides can then be deleted. Bigger blast radius,
so it was left for a decision.

Two latent bugs found doing this: `Projects.tsx` rendered `wrapIn ${s.head}`
with no `.head` rule in the module, so the class list was literally
`"wrapIn undefined"` (now declared); the Footer uses the bare global `.frame`
with no module class, so its override needs `:global(.frame)`.

### 5. CloudLink rebuilt

- **New asset** `public/images/cloudlink/Cloudlink_Phone2.png` (933×1920, RGBA,
  upright handset, no concrete beam). All the beam-era machinery is gone:
  `.shot`, the flush-to-bottom-left logic, `--shot-scale`, the `<picture>`
  art-direction swap, the mobile `aspect-ratio` override.
- **`.media` → flex row, `.stage`** = the handset's box, `aspect-ratio: 933/1920`,
  `clamp(13rem, 19vw, 17.5rem)` (the comps keep it roughly one size).
- **`ShapeBlur` behind it** — see below.
- **Tags re-anchored.** Their `x`/`y` in `content/home.json` were percentages of
  the old 1152×934 composite; against a 274px stage they flew off the edge. They
  now anchor to the handset's own edges (`left: 64%` / `right: 96%`), so their
  distance from it is width-independent. `y` values were rewritten as
  percentages of the handset. A new optional `dx` field nudges one tag
  horizontally (Live Data has `dx: 25`) — folded into the side anchors, *not* a
  transform, because `.tag` already animates `transform` on the float loop.
- **Tags are `z-index: 2`**, above the render — `.phone` carries `z-index: 1`, so
  DOM order alone left the labels clipped in half.
- **`.stage` is `translate(-80px, -80px)`** at 1440–1919 (lift + leftward move);
  the left-hand tag gets the 80px back through its own `right` anchor so it
  alone holds position.

**Still open on CloudLink:**
- `Cloudlink_Phone2.png` is **1.8MB**; the old asset was a 50KB WebP. Worth
  converting before ship.
- **Line 15 reads `overflow: show`, which is not valid CSS** — discarded, so the
  section computes to `visible`. If unclipped is intended it should say
  `visible`.
- `.media` is still capped at `--maxw`, so at 1920 the render sits at x=240 while
  the copy is on the 120px line. Needs a decision.

### 6. `ShapeBlur` — React Bits port

`src/components/ShapeBlur.tsx`, from `ShapeBlur-JS-CSS.json`. Only dependency is
`three@^0.180.0`, already installed at exactly that version. Shaders verbatim.
Config in CloudLink: `variation 0`, `shapeSize 1.75`, `shapeRatio 2.06`,
`roundness 0.65`, `borderSize 0.1`, `circleSize 0.3`, `circleEdge 1.3`,
`color #3164FF`.

Five deviations from the registry, each deliberate:
- pointer bound to the **section**, not `document` (the registry chases a cursor
  anywhere on the page).
- **rAF gated on an IntersectionObserver** — the registry renders for the life of
  the page.
- **`u_pixelRatio` dropped from the prop-sync effect.** `resize()` sets it from
  the real display ratio and it must stay in step with `u_resolution`, or the
  shader's mouse coordinate lands in the wrong place. The registry overwrites it
  and breaks tracking on any non-2× display. This is why `pixelRatioProp` is not
  passed.
- **inline `width/height: 100%` removed.** The registry hard-codes it, and an
  inline style outranks any class — a consumer sizing it with `inset` gets an
  element that moves but never resizes.
- **new `shapeRatio` uniform** (`vec2(size, size * ratio)`, default 1). The
  registry's `sdRoundRect` takes a scalar, so it can only draw a *square* — it
  could never trace a 1:2 handset.

**Geometry that matters:** the canvas is `inset: -10%` (20% larger than the
render, aspect preserved) because the shape sits *behind an opaque PNG* — on the
phone's exact footprint it renders correctly and is completely invisible. An
edge lands at `size / 4.2` in units where the canvas half-width is 0.5, so
`0.5 / 1.2 × 4.2 = 1.75`, and `shapeRatio` is just the asset's aspect.

### 7. Products circuit run at ≥1920

The renders moved to the 120px gutter, outside the run's centred 1440 box, so
both ends stopped short. **The box was NOT released to full width** — that was
tried and reverted: under `preserveAspectRatio="none"` it scales x by 1.33 at
1920 and 1.78 at 2560 while y stays 1.0, and every corner radius goes
elliptical. Instead `RUN_XL` lengthens **only the two end verticals**
(`x: 205 → -30`, `1345 → 1470`), drawn outside the viewBox via the svg's
`overflow: visible` — the same licence the route already takes with y = -60 and
y = 1450. Toggled by `.flow` / `.flowXl` display, the Statement pattern.

Those two numbers come from the overlap of what each width needs (house
`-120…376` at 1920 vs `-440…56` at 2560; warehouse `1064…1560` vs `1384…1880`).
Scale stays 1.000 : 1.003 — corners circular.

### 8. Savings calculator — implemented

- **`src/lib/savings.ts`** — the model ported from
  `reference/calc/Electricity Calculator/Savings Calculator v2.dc.html` as a pure
  module: 8 tariffs, 5 load profiles, 5 battery formats, 5 locations, the TOU
  band map, every derived row set, and the arithmetic. **Verified exact** against
  an independent transcription of the original formula: baseline 3 364 081.6,
  saving 1 384 161.0, arbitrage 362 027.4, demand 96 012, solar 926 121.6,
  capex 5 060 000, payback 3.656 — all match the rendered figures.
- **`SavingsCalculator.tsx`** — seven-step wizard, rail doubling as progress and
  navigation, running-total panel, progress ring, per-step icons, tariff detail
  with winter/summer rate tables, three read-out tables, five summary cards with
  working Edit, carried-configuration block, numbered sim features.
- **`.panel` is `height: 80vh`**, not `inset: 0`. That is exactly where the site
  card's top edge lands when open: `translate: 0 75vh` plus the 5% its `scale:
  .9` gives back. Verified panel bottom = shell top = 720 at a 900px viewport.
- **Panel inline padding is `5vw`**, matching the card's own visible edge for
  the same reason. Verified: calculator content left = card left = 72 at 1440.
- **Monochromatic**: the neutral ramp throughout; blue only for the current
  step, the chosen option, the saving, and the peak-hour bars.
- **Selected-card edge** is an SVG `<rect pathLength="1">` with
  `stroke-dashoffset` 1 → 0 over 620ms on `--ease-out`, 3px — a traced outline,
  not a border colour. The card's own 1px border goes transparent when selected
  or it rings the drawn edge with a grey hairline.
- **No scroll on desktop**: zero clipping on all seven steps at 1440, all five
  Edit buttons reachable.

**Open on the calculator:**
- **Mobile deviates from "must not scroll".** The strip is ~400px on a phone
  against ~600 on desktop for the same content. Below 900px the step *body*
  scrolls inside its own box — heading, rail, running total and buttons stay
  fixed and the page never moves. Charts are hidden, site chips become one
  horizontal row, and explanatory prose is dropped at ≤560px. The alternative
  that removes the scroller is splitting steps 3–4 into sub-steps on narrow
  screens.
- The **sim feature list still numbers `01`–`05`** (from the prototype). Aldo
  asked for "the numbering" removed and had selected the step counter; that was
  removed, this was left.

### 9. Hero and Statement odds and ends

- **Hero title reveal**: `RevealText` (words, not chars) driven by *per-beat
  sequence progress*, because the hero is pinned — a rect-driven reveal freezes
  while the pin holds. Beat 1 plays on mount (no scroll behind it yet); beats 2
  and 3 scrub.
- **Dissolve scrub window**: `START = 0.15`, `END = 0.85` in `PixelDissolve.tsx`
  (moot while the bands are off).
- Hero lead is `font-weight: 500` (it inherited 400 from body; `.t-lead` sets no
  weight). Hero eyebrow is `--cyan-400` (#66D7FF) — a step lighter than the
  `--cyan-600` used elsewhere.
- A `.tint` layer (`rgba(0, 8, 35, 0.20)`) sits between the hero canvas and the
  scrim, ordered by DOM position rather than z-index.
- **Statement `.frame` padding-block now copies Services'** literal clamps
  (`clamp(3.5rem, 6.9vw, 6.25rem) clamp(4rem, 8.3vw, 7.5rem)`) — duplicated, not
  tokenised. If Services' padding moves, this must be moved with it.
- Statement `.grid { padding-block-start: 6rem }` at ≥1920.

### 10. BLOCKER — Figma MCP has no access

`get_metadata` and `get_screenshot` both return *"you don't have edit access to
this file"* for `EhfzMjyCPVx7KwWTcfUVee`. Every layout decision this session was
taken from screenshots Aldo pasted, not from the frames. **Granting the MCP
account edit access would remove a whole class of guesswork** — the 1440/1920/
2560 CloudLink frames (`1623-2`, `1623-327`, `1623-657`) were never readable.

### Gotchas worth keeping

- **`text-wrap: balance` on `.t-h2` blocks uneven line breaks.** The 1920 comp
  wants "Intelligence built / into every Hubble / system", which balance cannot
  produce — it jumps from three lines to two with nothing between. That one
  breakpoint needs `text-wrap: wrap` plus an explicit px measure.
- **Next `<Image>` `sizes` that overstates the rendered width can hang the
  decode.** `34vw` claimed 653px at 1920 for a 280px element, so the browser
  chose the `w=1920` candidate and **upscaled a 933px source to 1920×3951** — a
  ~30MB bitmap whose decode never completed and the render never appeared.
  `fetch()` succeeded while `new Image()` timed out. `sizes` is now a length.
- **CSS Modules hash per class, not per instance** — all three PixelDissolve
  wrappers share one class name, so element data cannot tell you which band you
  are looking at.
- **A module class used in TSX but never declared in the CSS renders as the
  literal string `undefined`** in the class list.
- **The `mini-css-extract-plugin` HMR `removeChild` errors and stale
  `useEffect` dep-array warnings are dev-server noise.** Check `GET /` status
  and `tsc` before believing them; a server restart clears the hook records.
