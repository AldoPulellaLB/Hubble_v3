# Hubble 2026 — v2

The current build. Implements the redesigned landing page from Figma
`EhfzMjyCPVx7KwWTcfUVee`, node `60:76`, measured at 1440.

`v1/` is the previous direction, kept intact and still runnable on port 3211.
Nothing in v2 imports from it.

```bash
npm run dev     # port 3210
npm run check   # production build, into .next-check
npm run build   # production build, into .next
```

**Use `npm run check`, not `npm run build`, while the dev server is running.**
A normal build writes over `.next` and takes the dev server's chunks with it.
The page then serves HTML that 404s on `main-app.js`, so React never hydrates:
no scroll animations, no reveals, no tokens — the site renders as unstyled,
inert markup and looks catastrophically broken. `check` builds into
`.next-check` instead (via `NEXT_DIST_DIR` in `next.config.ts`) and leaves dev
alone. If you ever see the site in Times with no colour, this is what happened
— stop the server, delete `.next`, restart.

---

## What carried over from v1

| Carried | Why |
|---|---|
| `SequenceHero` mechanism | Explicitly retained. Worker-decoded frames, one canvas, scroll-scrubbed over 350lvh. Re-skinned only. |
| `/public/sequence` (351 frames × 2 variants) | Already rendered and optimised. |
| `lib/motion.ts`, `SmoothScroll` | Lenis on the GSAP ticker — one clock for scroll and every scrubbed animation. |
| Fonts, logos, design-system colour values | Unchanged brand assets. |

Everything else is new. v1's components were built for a different layout and
are not reused.

---

## Layout system

The comp runs **two measures**, and both are kept:

| Token | 1440 value | Used by |
|---|---|---|
| `--frame` | 40px | The two inset panels (statement, footer), and the nav — but the nav is full-bleed and the panels are capped at `--maxw`, so the two only align at 1440 and below |
| `--gut` | 80px | Hero, services, stats — the type-led sections |
| `--gut-wide` | 120px | CloudLink, products, projects, CTA — the image-led sections |

The tighter measure is what gives the render sections their air. Helper classes
`.frame`, `.wrap`, `.wrapIn` in `globals.css`.

Type is sized from the comp and then made fluid: the `vw` term in each
`clamp()` is set so the token lands on its comp value exactly at 1440.

---

## Motion

Everything scroll-driven runs on **one shared `requestAnimationFrame` loop**
(`onFrame` in `lib/motion.ts`). There is no per-component rAF and no scroll
listener doing layout work.

| Component | What it does |
|---|---|
| `SequenceHero` | Frame index from pin progress. `draw()` falls back to the nearest decoded frame, so a partly-loaded sequence never blanks or stalls. |
| `FlowLines` | The circuit traces. `pathLength="1"` normalises every route so one `--draw` value scrubs them all; a second stroke runs a bright dash along the same path on a CSS loop. |
| `RadialFan` | The vector fan under the services list. Generated from a seeded PRNG so server and client agree; each strand has its own threshold, so the fan opens outward rather than appearing. |
| `PixelDissolve` | Two thresholds per cell — one to leave `from`, one to settle on `to` — swept and roughened. **Scrubbed, not triggered:** scrolling back up re-forms it cell by cell. |
| `Marquee` | Drifts on its own, and scroll *adds* to the drift. The band is a readout of the reader's movement, not a timer running beside it. |
| `Reveal` | The single entrance primitive. One IntersectionObserver, a class flip, animation in CSS. |
| `Stats` | The designer's burst art, revealed by a scroll-driven radial mask that opens from the icon outward. |

Every one of these has a `prefers-reduced-motion` path that lands on the final
state immediately.

## The nav bar

Full-bleed, inset 40px, and **elastic**: the row of section pills takes every
pixel the logo and the right-hand cluster leave, and each pill takes an equal
share of it. Every gap in the bar is the same 6px, so one rhythm runs from the
logo through to the login button. Nothing carries an auto margin — an auto
margin anywhere in that row would open a hole and break the rhythm.

The dropdowns are spec'd from Figma `1530:4`: a 220px panel on a grey gradient
at 60% over a 3px backdrop blur — not a flat scrim, which is what lets the
render behind stay legible through it. Rows are 34px, 12px Montserrat, arrow
right. **Hover fills the row `rgba(0,0,0,.36)` and turns its arrow from
`--blue-200` to `--blue-500`** — the row, not the label, is the hover surface.

The login button rests as its mark alone at 46 × 40 and opens on hover to the
comp's 108 × 40 (Figma `60:153`) — `rgba(203,203,203,.15)` over a 4px blur, the
supplied `Icn_login.svg` at 18px, and the word *Login*. `width` is animated
here on purpose: the layout shift *is* the interaction. Because the button
stays `flex: none` and the pills are elastic, the row to its left gives up the
62px and takes it back on the way out. The label is clipped rather than
removed, so the link keeps "Login" as its accessible name while collapsed, and
`:focus-visible` opens it for keyboard users.

Its show/hide is **hysteretic, not per-frame**. Flipping on the raw scroll
delta is what makes a bar judder: a smooth-scrolled page reverses sign
constantly, so the bar starts returning, is told to leave two frames later, and
fights the scroll. Instead it accumulates travel since the last direction
change — 10px down to leave, 110px up to come back — and the return carries a
180ms `transition-delay` while leaving stays immediate. Over the hero (< 320px)
it simply sits with the page.

### The bar has two palettes

Figma `1589:2330`. Over light ground the bar does not go pale — it goes the
other way, to a deep translucent navy, which is what keeps one bar identity
across the whole page instead of two unrelated navs.

| | dark ground | light ground |
|---|---|---|
| pills | `rgba(0,0,0,.2)` | `rgba(0,29,96,.5)`, blur 4 |
| carets | `--blue-400` | `--blue-700` |
| panel | `rgba(0,0,0,.2)` | `rgba(0,29,96,.6)`, blur 3 |
| Calculate | white plate, blue label | `--blue-400` plate, `--blue-200` label |
| logo | `Logo2.svg` | `Logo2_onLight.svg` |

Two things worth knowing. The **CTA switches Button variant** (`light` →
`primary`) rather than being recoloured in place: the variant owns the hover
wipe, and a `light` button wipes to blue-200, which under the comp's pale label
would erase it. And the **light logo is generated** from `Logo2.svg` with its
two fills exchanged, not exported from Figma — the MCP asset URLs expire after
seven days.

Detection is one probe at **y=44**, the pill row's own middle, tested against
`.on-light` and `[data-nav-light]`. Sections that already carried `.on-light`
for their eyebrow ink need nothing; Stats, Strings and the Statement's white
plate carry `data-nav-light` instead, because they want the bar behaviour
without the eyebrow one. The Statement is marked on the *plate*, not the
section — that section's ground is the hero's blue.

The black scrim the bar used to take once it left the hero is gone. The light
palette does the separating now.

### The stat cards

Solid `--blue-400` plates at rest. Hover drops the ground to `--blue-500` over
700ms and React Bits' **PixelCard** scatters brand pixels across it from the
centre outward — the same pixel language as the dissolve bands, arriving as an
effect rather than a transition.

`PixelCard.jsx` is vendored from the registry
(`https://reactbits.dev/r/PixelCard-JS-CSS.json`, no dependencies). Four
adaptations, none of them to the Pixel class or the animation:

1. **`'use client'`** — it uses hooks, canvas and `performance.now()`.
2. **A `hubble` variant** — the shipped ones are Tailwind sky/rose ramps.
3. **`tabIndex` is always -1.** Upstream makes the card itself a tab stop so it
   can catch focus, which would add four stops that go nowhere — the real
   target is the ring inside. React's `onFocus` bubbles, so keeping the
   handlers and dropping the tab stop still lights the effect on keyboard
   focus.
4. **`PixelCard.css` keeps only what the effect needs.** Upstream it also
   carries the demo card's look — a fixed 300×400, `aspect-ratio: 4/5`, a dark
   border, a 25px radius, `place-items: center` and a near-black radial
   `::before`. Every line of that fights the card it wraps. The canvas is also
   absolutely positioned rather than a centred grid item, which is what lets
   the card's content sit in normal flow instead of needing `position:
   absolute` as the upstream docs require.

The canvas takes no pointer events, so the ring stays clickable and the card
still works with the effect inert.

**The glyphs are back, on top of the canvas.** Hover also fades a mark up in
the bottom-right of each card — wrench / bars / bolt / africa, keyed off
`stat.icon` in `content/home.json` and drawn from
`public/images/icons/Pixlecard{1..4}_icon.svg`. They are painted as CSS
**masks**, not `<img>`, so the fill stays a CSS value (currently `#0D34AE`,
tuned by Aldo from the export's own `#123AB8`), and
they sit at `z-index: 1` — the same layer as the type, *above* the pixel
canvas, so the pixels scatter behind them and the shape stays solid. This
answers the old open question about the burst artworks: they return as hover
glyphs over the canvas, not as a layer under it. Opacity only, no travel: the
mark fades in place over 560ms on the same `--ease-in-out` as the ground, so
the two settle as one event. The ground itself moves `--blue-400 → --blue-700`
on that curve; on `--ease-out` (an expo) a colour covers most of its distance
in the first 100ms and reads as a snap with a long invisible tail.

### The project card reveal

Hover slides the **map plate up** to uncover the site's photograph beneath it,
taking the title with it. The figure and the ring stay where they are.

This replaced a 3D flip (both faces, `rotateY(180deg)`, each carrying its own
copy of the detail). The reveal is a simpler mechanism and a better one: one
surface, layered, so the copy exists once — which is also why the back face's
`aria-hidden` duplicate is gone rather than suppressed.

```
.surface   radius + overflow hidden; the shadow paints outside it
  .photo   the floor — rests at scale(1.08), eases to true as it is uncovered
  .scrim   bottom wash, fades in behind the plate
  .plate   brand-blue ground + the map, screened; slides up --reveal (74%)
  chip · nameBand · figure · ring        siblings of the plate, not passengers
```

| | Curve | Duration |
|---|---|---|
| Plate + title, in | `cubic-bezier(.2, 1.05, .3, 1)` | 900ms |
| Plate + title, back | `--ease-out` | 640ms |
| Photo scale to true | `--ease-out` | 1900ms |
| Shadow | `--ease-out` | 700ms |
| Scrim | `cubic-bezier(.45, 0, .55, 1)` | 820ms, **300ms delay** |

Four things here are load-bearing and each cost a pass to find:

**The overshoot curve goes in only.** A touch of overshoot makes the plate
settle rather than stop dead. Coming back is flat — an overshoot on the way out
bounces the plate down past its own frame.

**The scrim cannot take `--ease-out`.** The plate travels up, so the foot of the
card — where the wash is densest — is the *last* thing uncovered, and
`--ease-out` is steep enough at the front to be ~90% done by then: the wash sat
waiting at full strength the moment it came into view, which read as a hard cut.
A symmetric curve holds it back until there is photograph to darken.

**The title's travel is height-agnostic**, which matters because these titles
run to one or two lines. It sits in a band whose `top` is where it must end up
and whose `bottom` is where it rests. Sliding the band up by its own height and
the title back down by *its* own height nets exactly (band − title):
bottom-aligned becomes top-aligned, whatever either height is. Both halves must
share one duration and curve, or they cancel unevenly and the title wanders
mid-flight.

**The rail must not clip the shadow.** `box-shadow: 30px 30px 70px` reaches
~100px below a card, and the deepest stagger step drops one 130px past the
track. A horizontal scroller has to clip vertically (`overflow-y: hidden` is
the price of `overflow-x: auto`) and it clips at the *padding box* — so that
room has to be padding on the rail itself. Margin on the section below is
outside the clip and does nothing. `--stagger-max` + `--shadow-reach` on
`.sec` carry the two numbers; `--stagger-max` mirrors the deepest step of the
`STAGGER` array in `Projects.tsx`, so raising a step there means raising it
here.

Gated on `(hover: hover) and (pointer: fine)` — `:hover` latches on touch, and a
tapped card would otherwise stay stuck half-open. Touch therefore never sees
the photograph, which is why the ring is part of the resting card here rather
than a reward for hovering: on touch it is the only affordance saying this is
a link.

### The logo cube

Hovering the nav logo turns it about its vertical axis to reveal the dark plate
on the cube's right face. Two faces, each half the plate's width out from the
cube's centre, meeting along the plate's right edge.

`translateZ(calc(var(--logo-w) / -2))` on the cube is load-bearing, not
decoration: it pulls the cube's centre back so the resting face sits at z = 0.
Without it the front face floats toward the viewer and perspective scales it
up, so the logo reads visibly larger than its neighbours before anyone hovers.

Gated on `(hover: hover) and (pointer: fine)` rather than width alone — a touch
device has no hover to leave, so a tap would latch the cube half-turned.

### The rail advances on its own (2026-09-15)

Seven cards now, and the rail steps through them when nobody is driving it: one
card, hold three seconds, the next, and once the last is reached it runs the
whole way back to the first and starts again.

**A rAF tween over `scrollLeft`, not `scrollTo({ behavior: 'smooth' })`.** The
native smooth scroll gives no control over curve or duration — both are
UA-defined and differ between engines, and a rail that advances at a different
pace in Safari is not a designed movement. The curve is `easeInOutCubic`, which
accelerates and decelerates symmetrically; the house `--ease-out` is wrong here,
being an expo curve that covers most of its distance in the first 100ms and
would read as a snap followed by a crawl. 820ms a card, 1500ms for the rewind.

**It never listens to `scroll`.** The tween writes `scrollLeft` every frame, so
treating scroll as interaction would make it interrupt itself on the first
frame. Only real input counts — `wheel`, `touchstart`, `pointerdown`, `keydown`,
`focusin` — which is the one thing that has to be right for an autoplay to
coexist with a scroller the reader can also drive. Any of them stops it dead and
buys four seconds of quiet; hovering holds it for as long as the pointer is over
the rail, because a card that slides away while you are reading it is worse than
no autoplay at all.

**Snap comes off for the duration** (`.gliding`). `scroll-snap-type: x proximity`
re-evaluates on every rest, and a tween writing a new offset each frame hands it
a rest to argue with. It goes back on afterwards — the tween lands on a snap
position anyway.

**The stop list needs its tail tidied, and that is not cosmetic.** Every card's
offset is clamped to `scrollWidth - clientWidth`, so the last two or three
collapse onto the same value: raw, this rail gives
`[0, 475, 950, 1426, 1901, 1926, 1926]`. Left alone the row finishes with a 25px
twitch and then holds three seconds on it, which reads as a stall rather than a
step. Near-duplicates are dropped and a final stop within a fraction of a step of
the end is pulled onto the end itself — `[0, 475, 950, 1426, 1926]`, every move a
real one. The list is rebuilt every step, because the cards restagger and the
rail re-measures on resize.

It does nothing off screen (an IntersectionObserver on the section) — a rail that
has quietly advanced four cards while the reader was elsewhere has thrown its own
opening away — and nothing at all under `prefers-reduced-motion`.

Measured over a full cycle: rests at 475 → 951 → 1426 → 1927 → **0** → 475 → …,
each held 3.12s. Hovered, it moved 0px in 8 seconds; released, it advanced again
within 9.

## The arrow

There is exactly one arrow on this site, `PixelArrow` in `Icons.tsx`: three 2px
squares on a grid, in two orientations.

```
right          down
▉ ·            ▉ · ▉
· ▉            · ▉ ·
▉ ·
```

It is not a wedge, not a stroked chevron, and not from an icon set — it is the
dissolve band's pixel language shrunk to a mark, which is why the comp uses the
same glyph in buttons, in rings, on the nav pills, on the footer links and in
the scroll HUD. `cell` is one square in px: **2** almost everywhere, **3** for
the three standalone carets that have no label beside them to lend them scale.

Colour is per surface, sampled off the comp:

| Where | Colour |
|---|---|
| Nav pill carets | `--blue-700` `#0832B4` |
| Dropdown rows | `--blue-200` `#F0F4FF`, → `--blue-500` on hover |
| Buttons, footer links, CloudLink tags | `--cyan-600` `#00ABE6` |
| Rings — service rows, stat cards, project cards | `--blue-500` `#1748DF` |
| Scroll HUD caret | white |

## The strings section

The supplied interactive field, below the services list. The engine is the
author's, carried into `lib/strings-effect.js` with three adaptations and no
change to its drawing, geometry or timing: an ES module export instead of a
`window` global, retained listener/rAF handles, and a `destroy()`.

**`destroy()` is not optional.** The original constructor starts a rAF loop,
a window resize listener and three label timers and offers no way to stop
them. React's dev double-mount alone would leak two engines before the page is
interactive.

**Desktop-only, gated in JS.** `display: none` is not an off switch — the
canvas would still redraw every frame on a phone, invisible, on battery. The
component returns `null` below 768px and under `prefers-reduced-motion`, and
re-mounts if the viewport crosses back. (Check: after crossing the breakpoint
twice there must still be exactly three `.keyword-label` elements, not six.)

**The dome is a crop.** The engine draws a full circle sized from the viewport
it is handed, hub at 61% of its height. The comp shows only the upper dome with
the hub on the band's floor, so the viewport is much taller than the band and
hangs above it. The three numbers in `Strings.module.css` are one set — they
also put the hub on the horizontal centre, which is where the marquee's strands
pick the current up. Re-check that join if you retune the band.

Two selector bugs in the supplied `section.css` are fixed in the port: several
rules repeated `.network-strings-viewport` inside themselves and so could never
match, which left the custom cursor permanently invisible and the label dot
ordering inert.

The original package is still at `public/Strings section/` for reference. It is
no longer loaded — the engine is bundled — so it can be deleted.

### Traces must connect, and must never stop mid-field

Two rules for the circuit lines:

**Every trace runs off an edge.** A route that simply ends in open space reads
as a broken line rather than a short one. Give it a waypoint past the viewBox
and let the section's `overflow: hidden` do the cutting.

**The products run alternates; it is not a staircase.** Down in from the top
**left**, right, **up**, right, **down**, right, **up**, right, and down out at
the bottom right into the partner panel — five verticals against four horizontal
runs, so the run doubles back on itself twice on the way across. An earlier
version stepped only ever downward, which reads as a decorative diagonal rather
than as routed cabling. The pair is a uniform 44 offset on both axes, which
staggers the corners instead of nesting them concentrically.

It was mirrored on 2026-09-14 to follow Figma `1797:533`, which leads with the
High Voltage render on the left. The layout mirrors exactly — the row is two
equal `1fr` tracks and `.flip` only swaps which holds the copy — so every x is
`1440 - x` of the original and lands on the same part of the same render. The
pair's offset went negative with it, and the two XL reach constants swapped
ends. If it is ever mirrored back, those three things move together.

**Traces that meet across a section boundary must share one coordinate
system** — and so must any trace whose horizontal placement matters. The fan's
centre strands hand over to the marquee's tails, which hand over to CloudLink's
circuit — three separate SVGs in three separate sections. They only line up
because all of them use a **1440-wide viewBox with `xMid`, and a viewBox height
short enough that width always drives the scale**. Those two conditions
together make x map as `x * (width / 1440)` with no offset, so `x=712` means
the same pixel in all three. CloudLink previously used `xMaxYMin` with a
720-tall box, which put its ends ~180px adrift of the tails at 1329px wide —
and the code looked perfectly reasonable. If you change a viewBox or its
alignment, re-measure.

**Products is the exception, and deliberately so.** It threads *between two
renders*, so it has to track the layout vertically as well as horizontally, and
`slice` cannot do that: it divides y by the width scale, so the same layout
measured 1292 units tall at 1305px wide and 969 at 1799. The run was pinned to
the renders at one width and slid off them at every other. It now uses
`viewBox="0 0 1440 1210"` with **`preserveAspectRatio="none"`** — 1210 being
the section's real pixel height at 1440, so one unit is one pixel and every
coordinate in `RUN` is a real position in the comp. The section's px height
barely moves between 1280 and 1800 (the renders cap at 31rem, the copy wraps
the same), so the bottom render lands within ~26 units of its authored place at
1305 and on it at 1799. The price is elliptical corners wherever the two scales
differ — 12% out at 1305, 25% at 1799, unreadable on a 1.35px trace, and dead
square at 1440.

**A full-bleed SVG cannot describe capped content.** `.flow` is capped to
`--maxw` and centred, because the layout is. Left at `inset: 0` the svg keeps
stretching past 1440 while the content stops and centres, so every coordinate
drifts left of the thing it was authored against — at 1799 the run's tail sat
4px *outside* the stat card it is supposed to disappear behind, and its ends
looked cut off because they were dying in open white beside the card rather
than under it. Below the cap both scale with the viewport and agree.

### The Statement's rotating claim, and what pinning costs

`statement.possible` in `content/home.json` adds a claim under the heading: an
eyebrow, a static lead ("WE KEEP"), and a line that changes as the reader scrolls
— `THE POWER ON` → `COSTS DOWN` → `YOUR INVESTMENT WORKING` → `YOUR POWER CLEAN`.
From Figma `1797:511`: a 12px Montserrat SemiBold eyebrow over a 40px Sora pair,
the lead in `--blue-400` and the rotating line in `--n-900`. **Weight 800, not
the comp's 600** — Aldo's call, and the tighter `-.014em` tracking goes with it.

`YOUR INVESTMENT\nWORKING` breaks over two lines. The box reserves **two lines
always** (`min-height: 2.1em`), not the current line's height: the entries are
stacked absolutely so the wrapper carries its own height, and sizing it to
whichever line is showing would shove everything under it down and back on every
swap. Verified — the aside below holds at a constant offset across the whole
pin.

**Two or more lines pins the section.** It grows to a screen plus one hold per
line (`--hold: 48vh`, `34vh` on a phone), the panel sticks, and the last hold is
the tail that keeps the final line up until the section releases. One line or
none and nothing changes — the pin, the height and the scrub are all behind
`[data-rotating]`.

The index is **floored off the pin's own progress**, not tracked through
transitions, so it is right at any scroll position: a reload halfway down or an
anchor jump into the middle of the pin both land on the correct line.

**All four lines stay in the DOM**, one visible. That is deliberate: read in
order they say "We keep the power on, costs down, your investment working, your
power clean", which is the claim the rotation is making. No `aria-live` —
announcing each swap as someone scrolls would be noise.

#### A pinned plate has to fit the screen, or the traces never look finished

The traces leave through the bottom-left of the plate. With the panel at 890 plus
220 of frame padding inside a 900 viewport, **89px of the plate — and the trace
exits with it — sat below the fold for the entire pin**. The drawing was
complete (`--draw: 1`, dash offsets 0); you simply could not see where the lines
went, so they read as unfinished.

So while pinned the frame gives up its block padding — the section's own height
is the spacing now — and the plate's own padding is measured **against the
viewport's height, not the page's width**: `min(4.7rem, 6lvh)` / `min(3.6rem,
4.5lvh)`. A `vw` clamp knows nothing about the screen a pinned plate has to fit.
That gives a 791 plate at a 900 viewport and 780 at 800, both fully visible;
below about 750 the copy alone is taller than the screen and it goes back to
drifting, which is the old behaviour and all that is left.

Checked by transforming each trace's last point into screen space: they end at
y=918 and y=−57 against an 829 plate, so all three genuinely leave it.

#### Pinning froze the flow lines, and the fix is an anchor outside the pin

**A stuck element's rect never moves, so `scrubProgress` on its own box returns a
constant.** The traces live inside the pin; measured, their draw stopped at 0.71
and stayed there for 1,728px of scroll, never finishing. Nothing errored — the
lines were simply half-drawn for the whole section.

The fix uses `FlowLines`' existing `anchors`: a zero-size marker at `top: 120vh`
inside the section but **outside** the pin, so `betweenProgress(section, marker)`
has something that still moves. The draw now starts as the section crosses the
fold and reaches 1 exactly as the panel arrives, then holds. The `window` prop
comes off — with a real bracket it would only remap the ends.

The anchors array is memoised: `FlowLines` has `anchors` in its effect deps and
this component now re-renders on every line change, so a fresh array each time
would tear the scrub down and rebuild it three times a visit.

**`.pin` is `display: grid` even when it is not pinning.** The phone's rules
stretch the frame to a full screen through `.sec > .frame`, and the wrapper sits
between them — as a plain block it swallows that stretch and the plate collapses
to its content.

### Scrubbed animations must be able to finish

Two rules, both learned the hard way — every scroll-driven drawing broke one
of them.

**1. Never bail out of a scrub handler without writing an end state.** A
handler that returns early when its element is off screen leaves whatever
partial value it last wrote, so anything flicked past in one fast scroll
freezes half-drawn and reads as a cut-off line. `scrubProgress()` in
`lib/motion.ts` returns 1 once the element is fully above the fold and 0 while
it is still below, and `onScrub()` drives every scrubbed value through it.
Use them rather than hand-rolling a `getBoundingClientRect` loop. The only
handler allowed to bail out is the marquee, which has no completion state.

**Anchor a draw to what the reader can see, not to a fraction of a box.**
`FlowLines` takes `anchors={[from, to]}` — two landmarks, each a ref *or* a CSS
selector — and `betweenProgress()` (`lib/motion.ts`) ramps 0→1 between the
moment the first crosses the bottom of the screen and the moment the second
does. Products uses `[firstRow, '#services-title']` — **the heading of whatever
section follows it**, so the far anchor moves when the page order does. It was
`#stats-grid` while Stats sat directly below Products; after the 2026-09-14
reorder Stats is under Projects and that bracket would have spanned four
sections. The run starts as **High
Voltage** scrolls in and is finished by the time the **next section's heading**
is — measured after the move, it reaches 1 about 600px into Products, while the
section is still on screen. The selector form exists because the far end lives in another component and
`page.tsx` is a server component, so a ref cannot be threaded across. Three
things this buys: the trigger is a thing on screen rather than a number that
needed re-tuning four times; the ramp is the *document distance* between the
two landmarks, so it is the same stretch of page on every screen,
unlike `scrubProgress`, whose span is `viewport + element`; and nothing has to
change when the copy reflows. Note the `window` prop still applies **on top of**
the bracket — leave it at `[0, 1]` or it will remap the ends.

**A masthead needs the third ramp, `exitProgress` / `onExit`.** `scrubProgress`'
span is `viewport + element`, which assumes the reader scrolls the element *in*
and then *out*. Nothing at the top of the document is ever scrolled in: it is
already there at scroll 0, where the ramp reads `vh / (vh + height)` — about 0.5
on a laptop and 0.58 on a tall screen. So the whole lower half of the ramp is
unreachable, and a scrubbed hero delivers **half the travel its plate was grown
to allow** while paying the full cost of the other half. `ImageHero` was doing
exactly that: 23px of movement out of 56px of extra photograph, and the missing
33px were being paid for in a tighter crop for nothing. `exitProgress` is
`clamp(-top / height)` — 0 at the top of the page and 1 once the section has
fully left, on every viewport — so the whole allowance is spent. Same guaranteed
end states as the other two. Use it for anything pinned to the top of a page.

**Pace is a house style.** CloudLink spends ~1090px of scrolling on its draw.
Anything slower reads as sluggish, anything much faster as a flick. Products'
843px bracket is close enough to read as the same hand.

**`drawDelay` staggers a pair without staggering time.** The second line of the
Products pair carries `drawDelay: 0.1`: it waits a tenth of the window, then
travels faster so it still lands with the first. Because the offset is *along
the route* rather than in time, both still track the scroll 1:1. `FlowLines`
also takes a `lag` (follow-through, the draw closing a share of its remaining
distance each frame) — built, then taken back off Products, because a lagged
draw reads as disconnected from the scroll beside CloudLink's direct tracking.

**2. Staggered draws must budget for their own span.** If each element starts
at its own threshold and takes `SPAN` to draw, then `max(threshold) + SPAN`
must be ≤ 1 or the last elements to start can never finish. `RadialFan`'s
strands summed to 1.09 and its outer strands sat permanently at ~74%.
`STAGGER_MAX` (`RadialFan.tsx`) and the draw span (`RadialFan.module.css`) are
two halves of one number — change them together.

### Mobile is a different composition, not a reflow

Two sections are re-authored rather than re-flowed below 768.

**The Statement is a full screen.** `min-height: 100lvh` — `lvh` so a collapsing
URL bar doesn't resize the plate mid-scroll, `min-height` so long copy pushes it
taller instead of spilling. The traces move to a band along the foot with their
own short route, authored in a `375x112` box so `preserveAspectRatio="none"`
maps it 1:1; the desktop spine sliced into a phone arrives as a cropped tangle.

That band **stays absolutely positioned**. As a grid row it contributes the
svg's own max-content height — 274px for a `375x300` box at 343 wide — and a
`1fr` row cannot override that while the plate is sized by its content: the
plate grows, the section overshoots the fold, and no amount of `min-height: 0`
breaks the circularity. Out of flow it costs nothing, and `padding-bottom` on
the copy reserves its space. The reservation is 7rem; at 9rem the section
overshot 100lvh on a 375 phone.

**CloudLink reads bottom-up.** Render, store badges, words, then a full-width
CTA. `.actions` is a plain row on desktop and `display: contents` on mobile, so
its two halves take their own places in the column — which is why each Reveal
had to move onto the *children*: a `display: contents` element generates no box
and cannot be transformed, so the animation would have silently stopped.

Its phone render is art-directed via `<picture>` + `<source media>`, not two
`<Image>`s toggled with `display: none` — both of those download. The swap
changes the file but **not** the `width`/`height` attributes, so the upright crop
inherits the landscape one's `aspect-ratio` and is squashed unless the mobile
rule restates it.

The CTA clears the dissolve band by `max(80px, calc(6 * (100vw / 24)))`. That
band carries `overlap`, so it is pulled back over the section's foot by exactly
its own height — 94px at 375 — and a flat 80 would still leave the button's last
14px under the pixels.

### Content sits on the frame at 1440 and up

One rule in `globals.css`: `.frame`, `.wrap` and `.wrapIn` all drop their inline
padding at `min-width: 1440px`. Above the comp's own width the box is capped and
centred, so content rides the edge of the 1440 measure; below it the box *is*
the viewport and the gutter is the only thing keeping type off the glass.

### Giving a descendant its own entrance

`Reveal` mirrors its state onto a **`data-in`** attribute as well as its `.in`
class. The class is hashed into `Reveal.module.css` and cannot be named from a
section's own stylesheet, so `data-in` is the hook for anything inside a
`Reveal` that wants an entrance of its own off the same observer:

```css
.num { opacity: 0; transform: translate3d(0, 48px, 0); transition: …;
       transition-delay: calc(var(--rd, 0s) + 120ms); }
.rowWrap[data-in] .num { opacity: 1; transform: none; }
```

Inherit `--rd` in the delay — `Reveal` sets it inline as the element's stagger,
so picking it up keeps a list counting in even when every row crosses the
threshold in one observer batch, which is what a flick or an anchor jump does. A
fixed delay makes them all move together.

Prefer this to nesting a second `Reveal`: the nested wrapper becomes the grid
item and takes the child's `grid-area` with it. `Services`' 01–05 numerals are
the worked example — they rise 48px on top of the row's own 28px and land a beat
behind it.

### Two traps worth knowing about

**Never hide a `Reveal` target with `clip-path`.** A clip empties the element's
intersection rectangle, so the observer that is supposed to reveal it can never
see it — the element stays invisible forever. `Reveal`'s `mask` variant uses a
`mask-position` slide instead, and the observer also falls back to the raw
bounding rect. Both fixes are load-bearing.

**A presentation attribute plus padding plus `border-box` can erase an icon.**
The button chevron is a 4x6 svg; `width="4"` is a presentation attribute, so it
maps to the CSS `width` property. Under the global `border-box` reset, the
`.4rem` of inline padding it used to carry was subtracted from that 4px box:
content width zero, arrow gone — while still reporting a valid colour and a
6.4x6 box, which is what makes it hard to see in devtools. Space icons with the
parent's `gap`, not with padding on the icon.

**`ch` resolves against the element's own font.** A `max-width: 20ch` on a 16px
wrapper is a quarter of what it is on the 72px heading inside it. Heading
measures belong on the heading.

---

## The PixelDissolve `overlap` mode

`<PixelDissolve overlap />` pulls the band back over the section above by
exactly its own height and starts its cells transparent. The section is then
visibly *eaten* by the dissolve instead of ending at a seam beside it — this is
what the comp does to the concrete plinth under the CloudLink phone.

The section above must keep its last band-height strip free of anything that
must stay readable. `CloudLink.module.css` lifts its copy column by exactly
that amount; only the render is meant to be consumed.

---

## The preloader

The site's entry. A field of `--blue-700` split by a white 2px line that draws
left to right while the first view loads. The line carries a trail of
`PixelCard`'s pixels — the same effect as the Stats and meter cards — and the
standing line **CONNECTED INTELLIGENT ENERGY**, right-aligned to the leading
edge. At 99% the label and the trail fade off; at 100% the line completes and
the two blue halves part from it, opening the page.

Phases are `drawing → closing → opening → gone`. The draw creeps to a **0.99
ceiling** over 3.4s; `closing` is the 99→100 fade, `opening` the parting.

`components/Preloader.tsx` + `.module.css`, mounted **first in `<body>`** in
`app/layout.tsx` — above `SmoothScroll`, so it covers every route including the
nav and the drawer stage. `z-index: 1000`; nothing else in the site claims a
layer that high (drawer stage 100, skip link 200).

**It is in the server markup, and that is the point.** A preloader mounted after
hydration shows the site and then covers it up, which is worse than not having
one. The panel ships in the first paint and JS only ever removes it.

### What it waits for

| Route | Resolver |
| --- | --- |
| Landing (`SequenceHero`) | the `hubble:hero-ready` event, dispatched when **frame 0** decodes |
| Everything else | `window.load` + `document.fonts.ready`, then a 400ms grace |

The grace exists because on the landing page `load` fires well before frame 0 has
decoded — opening on `load` alone reveals an empty canvas. Fonts are in the wait
specifically so Sora and Montserrat swap in *behind* the panel rather than
reflowing the page after it opens.

`HERO_READY` is exported from `Preloader.tsx` and dispatched from two places in
`SequenceHero` — the frame-0 `onload`, and the reduced-motion early return,
where there are no frames to wait for and the poster is the hero.

### Three ceilings, because a stuck preloader takes the whole site with it

1. `MIN_MS` (900) — the floor, not a ceiling: the line must visibly draw, or a
   warm reload flashes a blue frame and reads as a glitch.
2. `MAX_MS` (5000) — opens regardless of what has or has not loaded.
3. **A CSS `@keyframes` failsafe at 8s** on `.root`. It runs off the CSS clock,
   so it fires when the bundle never executes at all — no JS, a hydration
   error, a stalled chunk. It is on the container's visibility only, so it
   cannot fight the halves' transforms.

### The pixel trail is clipped, never resized

`PixelCard` rebuilds its entire pixel field from a `ResizeObserver`, so
animating the canvas's own width would re-initialise it on every frame of the
draw. The canvas sits in a fixed-width inner element and a wrapper clips it;
only the wrapper moves. Verified: the canvas stayed `1483x20` across the whole
draw. A `mask-image` fades the tail so it reads as a trail rather than a bar
with a hard left end.

The label's brand-blue ground is not decoration — it is what stops the pixels
running underneath the text, which is the relationship in the comp.

### The label has to be measured, not guessed

It is right-aligned to the leading edge, so early in the draw it runs off the
left of the viewport: measured at **-298px of a 301px label on a 375 phone, at
full opacity, for the first 1.2s**. A fraction would only know today's copy, so
the component measures the label (`ResizeObserver` + `fonts.ready` + resize) and
publishes `--labelw`. Two things use it, and they share one threshold so they
cannot disagree:

- CSS `left: max(calc(var(--p) * 100%), var(--labelw))` — the hard guard, so it
  can never be pushed off-screen.
- `labelFits` in the component — the label is only painted once the line is
  genuinely long enough to carry it, so it never sticks out past the end of the
  line it is supposed to be riding.

Below 640px the label steps down to 11px / 0.08em tracking. At the desktop
setting it is 80% of a phone's width and would only clear its own width in the
last fifth of the draw; the step-down brings that forward to about 60%. 11px is
the floor — below that Montserrat stops being a label a reader can use.

### Two things that bit during the build

**The draw is never tied to a real total.** The only honest number here is
"frame 0 plus the fonts", which resolves in one jump — a real progress bar would
sit at 0 and then snap to 1. The line creeps to 0.9 on an ease-out and the last
tenth belongs to the ready signal, so the line *finishing* is always the truth.

**Lenis has to be acquired by polling, not by one read.** The preloader is
mounted above `SmoothScroll` so its markup is first in the body — which means
its effect also runs first, and `window.__hubbleLenis` does not exist yet. A
single `lenis?.stop()` there silently no-ops and the page scrolls behind the
panel. Verified: `isStopped` stayed `false`. The `documentElement.overflow` lock
masks it enough to look fine, which is what makes it easy to miss.

Measured lifecycle (desktop, dev): draw runs to the 0.99 ceiling with the label
and trail tracking the edge, `closing` at ~1.2s fades both over 400ms, `opening`
at ~1.8s parts the halves, node removed at ~3.0s.

## The hero sequence

Three contracts, all of which the 2026-08-25 desktop re-export broke at once.

**1. Filenames.** `SequenceHero` asks for `frame_${i.padStart(3,'0')}.webp`,
`i` from 0 to `frames - 1`, so a folder must be **zero-based, three-digit and
contiguous**. The export arrived as `frame_01 … frame_09`, `frame_010 …
frame_099`, `frame_0100 … frame_0422` — a literal `frame_0` prefix plus the
natural number, one-based. Only 90 of 351 requests resolved, and crucially
`frame_000` was not among them: index 0 is the one frame that gates `ready`, so
the hero sat behind a loader that could never finish. Normalise any new export
before anything else:

```bash
node scripts/normalise-sequence.mjs public/sequence/desktop --dry   # inspect
node scripts/normalise-sequence.mjs public/sequence/desktop         # rename
```

It reads whatever integers the filenames carry, sorts numerically, renames in
order through a temp prefix (a single pass would clobber — `frame_010` wants to
become `frame_009` while a `frame_009` still exists), and is a no-op on an
already-normalised folder.

**2. Frame count is per variant.** Desktop and mobile are separate renders with
no reason to agree — they are currently **422** and **351**. `hero.sequence.frames`
in `content/home.json` therefore takes `{ "desktop": n, "mobile": n }`; a bare
number still works and means "same for both". The count is resolved inside the
effect, once the variant is known, and mirrored into state for the loader
percentage.

**3. Beats are frame numbers, so they move when the length does.** `hero.beats`
keys copy to absolute frames. 0 / 120 / 245 against 351 frames became 0 / 144 /
295 against 422 to hold the same 0% / 34% / 70% pacing. Re-picking them against
what the animation actually shows is a content decision, not arithmetic.

**Also worth knowing:** the poster (`/images/hero/poster.webp`) is what
reduced-motion and no-JS readers see *permanently*, so it must come from the
current render — it is frame 000 of the live sequence. The previous one is kept
beside it as `poster-old-sequence.webp`.

---

## The hero hands over to the Statement

The hero no longer carries a vignette. What is left is a single band at its
foot — 500px, bottom-anchored, fading to `#0832B4` — and the Statement's ground
is that same `--blue-700`. Measured, both sides of the seam are
`rgb(8, 50, 180)`, so there is no boundary to see: the render fades into the
ground the next section is already sitting on. The plate inside it inverts to
white with `--blue-600` type, and its traces are re-inked for a light ground
(`--blue-400`, one route in cyan) because the comp's cyan is nearly invisible
on white.

**The knock-on to watch.** The dissolve band below the Statement was authored
`from="var(--ink-black)"`. With the ground now blue that is a hard black-to-blue
seam at the plate's foot; it is re-sourced to `--blue-700`. Any section whose
ground changes has to check the band on either side of it.

## The product renders light up

Each product carries two stills — `image` (unlit) and `imageOn` (lit) — stacked
with the lit one absolutely positioned over the base at `inset: 0`, so the row's
height is set by the base alone and the two can never disagree about it.

The lit layer is **not** a `Reveal`, and that is the point: `Reveal` fires once
and disconnects its observer, which is right for copy arriving and wrong here,
because scrolling back up has to put the lights out again. `Lit` in
`Products.tsx` keeps its observer connected and reports both directions into a
`data-on` attribute. The 0.55s delay applies to the arriving rule only — held on
the way out too, the lights linger after the row has left, which reads as lag.

`imageOn` is optional. A product without one is a single still, exactly as
before.

## How we put intelligent energy to work

Figma `1797:618` (*Our process*) and `1797:684` (*Your options*), built as
`HowWeWork.tsx`. It **replaced the "five ways" services list** on 2026-09-14 —
five rows, each a link to a `/solutions/*` route. Those solutions are still in
the nav's Solutions mega-panel; the copy that was here is in
`context/_concept-backups/services-five-ways/`, because the repo has no version
control and that file is the only copy of it. `Services.tsx` and
`Services.module.css` are still in the tree and nothing imports them — dead code
on the same terms as `RadialFan`, safe to delete on request.

### The process row

**A real `<ol>`.** The steps are numbered and the order is the argument, so the
numeral belongs to the list and not to the decoration. It is written into the
heading text rather than left to a `list-style` marker, because a marker cannot
be centred under a centred icon.

**The rules between the cards are `::after`, not `border-right`,** because they
have to answer to a *neighbour's* state. A hovered card grows a 25px-radius
plate and a rule drawn against that rounded edge reads as a seam, so a card drops
its rule when it is hovered **or when the card after it is** (`:has(+ .step:hover)`).
That is exactly what the comp draws: card 2 is shown hovered and only the 3|4 and
4|5 rules survive. Verified in the page — rule opacities `[0, 0, 1, 1]` with card
2 hovered.

**`min-height: 243px` is the comp's card height, and it is a floor, not a
height.** What it actually buys is the rule and the hover plate, which are
card-height: on content height alone both came out 17px shorter than the comp
draws them. It is dropped again in the one-column layout, where there is no rule
and no neighbour and every card is its own grid row — there it only added 22–44px
of dead space to each of five stacked cards.

**One `Reveal` drives all five.** `variant="none"` on the row, and each card,
its icon and its rule transform off the `data-in`. Five cards side by side cross
the fold in the same frame, so five separate observers would only look staggered
on a slow scroll. Each card's share is `--sd: calc(var(--rd, 0s) + var(--i) * 90ms)`
— added to `Reveal`'s own delay, not replacing it (see *A fixed delay does not
stagger a list*). Measured mid-flight: opacity 0.82 → 0.73 and travel 4.6 → 7.1px
across the five.

**The delays are per-property, and that matters.** The entrance is staggered and
the hover is not. Carried in a single `transition` shorthand, the stagger would
land on `background-color` too and the fifth card would take 360ms to answer the
pointer. The rule splits the same way — `scaleY` is the entrance (staggered),
`opacity` is the hover (immediate), so the two never write the same property.

### It plays out as well as in

Both groups here pass `repeat`, so the section animates on the way out too, and
**the exit is not the entrance reversed**.

**A transition is read off the style the element is moving _to_.** That is the
whole mechanism: the base rule governs *leaving* and the `[data-in]` rule governs
*arriving*, so each direction gets its own durations and its own stagger out of
one declaration each — no second class to toggle, no JS. The exits run 390/500ms
against the entrance's 620/820 (~62%, the house ratio) on a 45ms stagger against
90ms. A reader leaving has already decided.

**`Reveal` now reports which edge it left by.** `data-out="up"` when the element
has gone off the top, `"down"` when it is below the fold, and the CSS spends it
on one custom property:

```css
.step { --y: 26px; transform: translate3d(0, var(--y), 0); }
.processWrap[data-in]      .step { transform: none; }
.processWrap[data-out='up'] .step { --y: -18px; }
```

Without it both directions share one rest state and **one of them is always
wrong** — scroll down and the content sinks back down as it leaves upward, which
reads as falling behind rather than as leaving. Verified in the page: mid-exit
the row sits at −15.6px scrolling down and +22.4px scrolling up. The exit travel
is shorter than the entrance's (18 against 26, 22 against 32) because an exit
only has to read as departure.

**The icon goes with its card on the way out.** On the way in it is held 160ms
behind, so the mark lands into a box that has already arrived; on the way out it
shares the card's delay, because a mark that outlives its own plate reads as a
bug rather than as a flourish.

**The options cards animate in two layers.** The plate fades and rises as one
object; its head, body and buttons then rise a little further off the same
`data-in`, 120/200/280ms apart — the arbitrage split's foot pattern, where the
block carries the fade and the parts carry the order. **Only the plate fades:**
fading the contents too would composite every glyph against a ground that is
itself still fading, which reads as muddy rather than as soft. Measured
mid-entrance, card 1's three parts sat at 3.0 / 3.6 / 4.4px with card 2's whole
set behind them.

### The options cards

`439fr 831fr` with a 10px gap — the comp's proportion expressed as shares, so the
gap comes out of the pair rather than off the end. Both plates are pale blues
that are **not in the palette** (`#D8EAFF`, `#D8E3F8`); the comp separates the two
cards by a half-step of the same hue rather than by a border.

**The numerals are text, not the comp's exported SVG** — same weight and family
as the page, so they stay crisp and follow the type scale. Their `line-height` is
**.72, deliberately below 1**: digits have no descender, so at `line-height: 1`
the lower half of the line box is empty, and that 25px of phantom leading pushed
the whole card 28px past the comp's 487. .72 is the glyph's own share of the em.

Card 02 carries two sub-columns and an inline link each. `lib/emphasise` now
handles `[label](href)` as well as `*medium*` — see *Inline emphasis*. Links carry
no class of their own: a link's colour belongs to the panel it is printed on, so
the use site styles `a` inside its own copy block.

## Partnered Innovations — the panel that closes Products

The third audience, after the two client tiers, and where the circuit run
finishes. Figma `1797:533`. Content is `products.partners` in `content/home.json`.

**The run's floor is the plate, not the foot of the section.** `.flow` is pinned
`top: 0` and given `height: calc(100% - var(--pi-h) - var(--pi-pad-b))` — the
plate's own height and the section's foot padding, which is the distance from the
bottom of the section to the top of the plate at any width. The two consumers
read the same tokens (`.sec` declares `--pi-h`, `--pi-gap`, `--pi-pad-b`), so
they cannot drift. Verified at eight widths from 390 to 1920: the run's floor
lands within a pixel of the plate's top edge at every one.

The tail is authored 130 units *past* that floor and the plate — opaque, later in
the document at the same z-index — is what cuts it. Same contract as CloudLink
(980 in a 900 box): a trace must be cut off by something, never stop inside it.
It also means the pulse runs on under the panel instead of dying at its edge.

**`height: auto` on an `<svg>` is not the box `top` and `bottom` describe.** An
svg carrying a viewBox is a replaced element with an intrinsic aspect ratio, and
`auto` takes that ratio in preference — so `bottom` is silently ignored and the
height comes out at `width x viewBoxH/viewBoxW`. At 1440 that was 1262, exactly
the right answer for the wrong reason; at 1280 it was 88px short and the tail's
overshoot hung in the white above the plate. Set the height outright. (It is also
what beats `FlowLines`' own `height: 100%`, which is at equal specificity and
would otherwise win on source order.)

**The photograph is sized off the plate's height, not its width.** The cut-out is
`121.03%` of the plate tall with `aspect-ratio: 544.949 / 376.297`, pinned to the
plate's foot so the overhang is all at the top — where the subject is — and the
clip falls on the desk. A width share looked equivalent and is not: the plate is
as wide as the page while its height is the comp's, so at 1440 a width share made
the figure 663 against the comp's 545 and clipped 22% of the photograph instead
of 5.5%. How big a person should look here is set by the height of the panel they
are standing in.

**The entrance is one trigger, not five.** The wrapper is a `Reveal` with the new
`variant="none"` — the observer only — and the plate, photograph and four copy
parts all transform off its `data-in`, delays added to `--rd` rather than
replacing it so the stagger survives a fast scroll (see *A fixed delay does not
stagger a list*). One `Reveal` per part would fire each on its own crossing, and
in a panel this wide the copy finishes before the plate it sits on has arrived.

The plate is revealed by a `clip-path` wipe on a `::before`, not on the box
itself: the photograph stands proud of the plate's top edge and a clip on the box
would behead it. Right to left, because that is the side the run comes down
(x=1235 of 1440), so the panel reads as something the circuit switched on. A clip
and not a scale — a scale squashes every child on the way and the type stretches
back into shape as the panel opens.

**It stacks at 1023, where the rows do.** Side-by-side was tried down to 768 and
the photograph ran 113px into the copy at 820: the figure is sized off the
plate's height, which stops shrinking at the `--pi-h` floor, while the plate's
width keeps going. Stacked, `--pi-h` becomes a `min-height` and the plate may
grow past it — which only buries more of the tail, the safe direction.

## The savings drawer and the calculator

**Status: approved and in.** Clicking any link to `/calculate-your-savings`
does not navigate — that route does not exist — it clips the whole site into a
rounded card, recedes it to 90%, drops it and reveals a `#CDD2DB` surface
behind it carrying the seven-step Savings Calculator. Close by the ✕, by
**Esc**, or by clicking the card itself.

**It works on every route, and new pages get it for free.** `SavingsStage`
wraps `{children}` in `app/layout.tsx`, and it binds *one document-level
capture listener* for `a[href="/calculate-your-savings"]`. So any page, any
component, any nav or footer link with that href opens the drawer — there is
nothing to wire per page. Do not add a route for it.

**The drop and the panel height are one number.** `--calc-drop` in
`globals.css` (currently 100px) is added to both the card's rest position
(`translate: 0 calc(75vh + var(--calc-drop))`) and the panel's height
(`calc(80vh + var(--calc-drop))`). The panel is exactly the strip the card
uncovers, so if the two drift you get either an overhang or a band of dead
surface. Tune the one token.

To undo the whole concept: `context/_concept-backups/savings-drawer/REVERT.sh`
restores `layout.tsx` and deletes the original four files — note it predates
the calculator itself, so it reverts further than you may want.

Four things it forced, each of which will bite anyone rebuilding this:

1. **`scale` and `translate` as individual properties, not one `transform`.**
   A single property cannot carry two durations, and the entrance is two beats:
   the frame forms and recedes (560ms), then the drop is held 360ms and takes
   720ms. As individual properties the translate also applies *before* the
   scale, so 75vh means 75vh rather than 75vh of shrunken space. The exit is
   the same in reverse and shorter — 700ms — because a reader closing something
   wants it gone, not performed at them.
2. **The card holds the reader's scroll position.** On open the shell becomes
   `position: fixed; inset: 0; overflow: hidden` and takes over the offset by
   `scrollTop` — `overflow: hidden` boxes still scroll programmatically. A
   transform on an inner wrapper would do the same job and break the next item.
3. **Anything `position: fixed` inside the frozen shell resolves against the
   *scrolled* content.** At a scroll of 8752 the nav bar landed 6842px above
   the card. It now rides its own zero-height fixed layer outside the reel,
   carrying the same `scale`/`translate` with `transform-origin: 50% 50vh` so
   it scales about the same point the card does. Zero-height so the bar inside
   still resolves `top: 0` against the viewport.
4. **`inert` is not a pointer-events substitute, and it is not subtree-only.**
   An inert subtree still answers hit testing — it swallows the event rather
   than passing it through — so the card ate every click meant for the surface
   behind it. And `inert` on the card suppressed the card's *own* click
   handler. It now sits on an inner `display: contents` reel, with
   `.frozen * { pointer-events: none }` for the descendants and the card itself
   left live as the dismiss target.

## CloudLink is a light section now (2026-09-15)

It was the darkest ground on the page and is white. **The circuit traces, the
handset, its `ShapeBlur` glow and the marquee's own drift are untouched** —
everything printed *on* the ground turned over, nothing that draws the ground
did.

**Most of "make it white" was one character.** `.sec` read `background: ffffff`
— no `#`, so the declaration was invalid, silently dropped, and the section
computed to `transparent`. What showed through was `body { background:
var(--black) }`. The stylesheet had claimed this section was white all along;
the page just never got to use it. (The sibling bug in the same rule,
`overflow: show`, is still there and still discarded — left alone because
changing it would change what the render is allowed to spill past, which is not
a colour decision.)

What turned over with it:

| | was | is |
|---|---|---|
| `.sec` | (transparent → body black) | `--white` |
| `Marquee .band` | `--black` | `--white` |
| eyebrow | `--cyan-600` (default) | `--blue-400`, set as `--eyebrow-ink` |
| `.title` | `--white` | `--blue-700` |
| `.copy` | `rgba(255,255,255,.74)` | `--n-700`, `--em-ink` → `--n-900` |
| `.tag` | `rgba(38,48,64,.78)` + 10px blur | `--blue-500`, opaque |
| `.tagChev` | `--cyan-600` | `--white` |
| store badges | `#1B1D1F` plate | `--n-100` plate, `--n-900` ink |

**The tags stopped being glass.** Translucency plus a backdrop blur was doing a
job that only exists over a dark render — reading as glass lifted off the
screenshot. Over white the same treatment is a grey smudge, so they became what
the reference draws: opaque pills in the brand blue, which also puts them in the
same family as the circuit they are attached to.

**`StoreBadge` gained a `tone`.** `dark` is the stores' own near-black lockup and
is still the default; `light` is the same lockup on `--n-100`, the page's
quiet-button plate, so a badge beside a quiet button reads as one family rather
than a third treatment. Both logos are drawn with `fill: currentColor`, so the
mark follows the label and there is no second asset.

**A section that changes ground has to tell the nav bar.** `Nav` reads
`document.querySelectorAll('.on-light, [data-nav-light]')` **once on mount** and
checks whether any of them is under the probe line. Both the band and the
section now carry `data-nav-light` — `Strings`' own flag, and the attribute
rather than the class because `.on-light` would also bring `--cyan-ink` with it
and this ground wants the blue. Without it the bar keeps its dark palette and
puts a white logo on white glass. Verified: `Logo2_onLight.svg` over the band and
over the section.

The page's light run is now continuous from `Strings` to `Stats` — `--n-75`,
white, white, white — with no seam to manage between them.

### The traces leave through the right edge now, and something actually cuts them

All three routes used to end by running *down* to y=980 against a 900 viewBox —
the house move of authoring past the frame and letting the overflow do the
cutting. On white it became obvious that it had never worked: three lines ran
down past the section and stopped dead in the open space above Projects.

**Two faults, compounding.**

*Nothing clipped them.* `FlowLines`' own `.svg` sets `overflow: visible`, which
Products needs to draw its XL legs outside the box, and `.sec` reads
`overflow: show` — not a CSS value, discarded. So the traces drew all 980 units,
274px past the foot of a 950px section. `.flow` now carries `overflow: hidden`,
and that is the fix that makes "cut by the frame" true here rather than
aspirational.

*And under `slice` the floor is not where it looks.* Width always drives the
scale — that is the hand-over contract with the marquee's tails — while the
section's own height caps at 950. So the viewBox's visible height is
`sectionHeight / (width / 1440)`, and it **collapses as the viewport widens**:

| viewport | scale | visible floor, in viewBox units |
|---|---|---|
| 1440 | 1.000 | 900 |
| 1798 | 1.249 | 761 |
| 1920 | 1.333 | 713 |
| 2560 | 1.778 | 534 |

A tail aimed at the floor is therefore aimed at a different floor on every
screen, and at the wide end it is long gone before it reaches one.

**The right edge has none of that.** x maps as `x * (width / 1440)` with no
offset, so **x = 1440 is the right edge at every viewport** — the same property
the marquee hand-over already depends on. Each route now steps down and turns
out to x=1560, so it is cut by one fixed edge instead of a moving one. The three
exits fan down the right-hand side at y = 660 / 712 / 750, below the handset at
every width and inside the 1798 floor.

Verified end by end: at 1440 and 1798 all three exit right; at 1920 two exit and
the third is cut mid-descent; at 2560 all three are cut. `svg.bottom -
section.bottom` is **0 at every width** — nothing paints outside the section any
more. **There is no width at which an end stops in open space**, which is the
only property that actually matters.

(Below 1024 `slice` flips which axis it crops — height drives, and only the left
~277 units are visible — so none of this drawing is on screen at phone widths.
Pre-existing, and the reason the routes have never needed a narrow variant.)

### The weights had to change too, and the pulse was the real culprit

Re-routing the tails was not enough — they still read as unfinished, and the
reason was legibility, not geometry. Measured against the two grounds:

| | on black | on white |
|---|---|---|
| trace @ 0.3 opacity | 1.31:1 | 1.52:1 |
| trace @ 0.5 opacity | 1.81:1 | 2.08:1 |
| **pulse (`--cyan-400`)** | **12.73:1** | **1.65:1** |

The traces barely moved. **The pulse is what broke.** `--cyan-400` was the
brightest mark in the section and became the faintest, so the only part of it
still registering was its 4px `drop-shadow` — a bright smudge with no line
under it. That is what "unfinished" actually was: the eye caught a fragment and
nothing joining it to an edge.

So the charge is `--blue-500` now (6.93:1) and the traces are 0.75 / 0.5 / 0.55
(3.15 / 2.08 / 2.25:1), keeping the same hierarchy. **On a light ground a charge
has to be denser than the trace it runs along, not brighter** — the relationship
inverts with the field, and it is the one thing that does not survive turning a
section over.

Worth knowing how this was pinned down: the geometry was proved first by reading
each path's last point through `getScreenCTM()` (all three land at x=1560
against a 1440 edge) and then by restyling the traces to 4px solid red and
screenshotting. Once red lines visibly ran off the edge while the shipped ones
did not, the question stopped being "where do they end" and became "can you see
them", which is a different fix.

## The contact sheet

`/contact` opens a right-hand sheet on the **same stage** the calculator uses.
Same deal for new pages: any `a[href="/contact"]` anywhere opens it, there is
no route, and nothing needs wiring.

`SavingsStage` holds `mode: null | 'savings' | 'contact'` and the CSS branches
on `data-mode`. **One owner for the shell's transform** — two overlays both
writing `scale`/`translate` on the same element would fight, which is why this
is a mode on the existing stage rather than a second component.

| | savings | contact |
|---|---|---|
| Site | `scale .9`, drops `75vh + --calc-drop` | `scale .94`, **stays put** |
| Frame | `border-radius: 50px` | `32px` |
| Nav | rides the card down | **retracts up** `-9rem` |
| Overlay | `.stage`, a full `#CDD2DB` ground | `.dock`, a `.42` scrim over the site |
| Sheet | — | slides `translate: 100% 0 → 0`, 680ms |

The site only knocks back in contact mode rather than dropping, because the
sheet covers the right-hand third: drop the page 75vh and the reader is left
looking at empty ground for the two thirds the sheet does not use. Receding
plus the dim puts it behind while keeping it readable, which is the point of a
form appearing *over* a page rather than instead of it.

**Four things here will bite anyone touching it**, and three of them already did:

1. **`.dock` must out-rank `.shell`** (`z-index: 2` against the shell's 1). The
   calculator's `.stage` can sit at 0 because that card *moves away*; here the
   site stays put, and at 0 the sheet rendered behind it and the entire form
   was unclickable.
2. **The nav retract needs a length, not a percentage.** `.bar` is a
   deliberately zero-height fixed layer, and percentages in `translate` resolve
   against the element's own size — `-140%` of 0 is 0, so the nav sat exactly
   where it started while every other part of the mode worked.
3. **Mode rules key off `data-mode`, never `data-open`.** Both modes are
   "open". The frame block sits below the contact block with the same
   specificity, so on `[data-open]` it silently won and contact got the
   savings card's 50px radius.
4. **Switching modes needs the previous exit to finish** (~1.1s: a 700ms thaw
   plus a 720ms translate on a 360ms delay). Clicking the other overlay inside
   that window catches the shell mid-unwind. Scroll position is safe either way
   — the shell stays `fixed`, so the document never loses it, verified at 4000px.

### The form

Nine fields in three `fieldset`/`legend` groups — what it is about, the
business, you — because a flat list of nine reads as a wall. Grouping is in the
accessibility tree, not just the type.

Modelled on on.energy's `.panel`, with two deliberate departures: every field
carries a **visible label** (theirs labels by placeholder alone, which vanishes
the moment you type), and the topic radios are **real radios** behind pills, so
arrow keys work and the focus ring lands on the pill. Inputs are `1rem` so iOS
does not zoom on focus, and each carries its `autocomplete` token.

**Validation is `:user-invalid`, not `:invalid`.** The tempting
`:not(:placeholder-shown):invalid` silently depends on every field having a
placeholder — `:placeholder-shown` cannot match where there is none, so
`:not(…)` is always true and every required field is red before it is touched.
That is exactly what happened here.

**There is no endpoint.** `submit` runs the browser's own constraint validation
and then swaps to the success view; the POST is a marked `TODO` in
`ContactPanel.tsx`. **Do not ship a page with this live until it is wired** —
it currently tells the reader their message is with us and sends nothing.

Below 560px the sheet becomes a bottom sheet — full width, `92dvh`, rounded on
the top corners only, paired fields stacked.

### Inside the calculator — the patterns to reuse

Seven steps in one component, and it never scrolls: `.panel` is the strip the
card uncovers, every track below it is `minmax(0, …)` or a fixed budget, and
each step sizes itself to what is left. A step that outgrows its box is clipped
rather than allowed to push a scrollbar into a surface meant to be one view.
Below 900px the step body scrolls instead, and the narrow rules give up
explanatory prose and secondary figures rather than a control.

**Every step is a `.stack`** — rows, not columns: the chooser across the top,
then the control and its read-out, then the chart. The two-column `.split` this
replaced gave a four-row list the same width as everything derived from it, so
the list ran out after 40% of its column while the read-out sat cramped in the
other half. `.optionCards` is `grid-auto-flow: column` with
`grid-auto-columns: minmax(0, 1fr)`, so it makes one equal column per option
whatever the count — 3, 4 or 5.

**Every block is a card on `.plate`, and that is what aligns the page.** One
`--pad-card` token on `.panel` feeds all of them. Before it there were six
near-identical paddings and the results step alone had three different left
edges for three stacked blocks. If you add a block to a step, put it on the
plate.

**The selected state is a blue tile** (`.row[data-sel]`, `.chip[data-sel]`):
`--blue-400 → --blue-500 → --blue-600` at 158°, white type, lifted 2px with a
shadow. The fill lives on a `::before` layer — **a gradient is not an
interpolable value**, so `transition: background` between `none` and a
`linear-gradient` has nothing to animate and cuts. On the pseudo-element it is
opacity (200ms) and a `scaleX` wipe from the left (440ms), matching the
buttons' hover wipe; leaving is 150ms and drops the travel. Nothing changes
size or position, so choosing never reflows the row.

The connection-type cards are the one chooser that does *not* take the tile —
they are two-thirds photograph and a fill would paint over the render. They
keep their traced outline and take the same lift.

**Charts live in `SavingsCharts.tsx`** — a heatmap, an area curve with a
hover/keyboard read-out, and a donut with a legend. Hand-drawn SVG, not a
library: the layout owns the height and a library's own sizing fights that.
Three things to know before touching them:

- **An `<svg>` at `height: 100%` in a box whose height is unresolved falls back
  to its intrinsic ratio.** A 956px-wide plot asked for 956px of height and
  burst the step. The plot's SVG is absolutely positioned so it contributes
  nothing.
- **`figure.heat` / `figure.area`, not `.heat` / `.area`.** These have to
  out-specify whatever the host column sets on its children, and a bare class
  is the same specificity across two CSS modules — which one wins depends on
  the bundler's emit order.
- **Cap the tracks, not the item.** `align-self: center` on a grid item makes
  it content-sized instead of stretched, so it ignores its track and centres
  its overflow — that is how the heat grid came to paint over its own caption.
  `grid-template-rows: minmax(0, cap) …` grows to the cap when there is room
  and gives space up when there is not; `align-content: center` then puts the
  slack outside the rows rather than between them.

The donut stacks on its **own** width via a container query, not the
viewport's — the same donut sits in a 240px column on one step and a 760px card
on another.

---

## The design system — the source of truth for new pages

Everything below is settled on the home page. Match it rather than inventing a
parallel set; where a new page needs something that is not here, add it here
too.

### Tokens, and where they live

`app/globals.css` `:root` carries the lot. **Never hardcode a hex in a
component** — `color-semantic` is the one rule this build has never broken and
it is what makes a restyle possible.

| | |
|---|---|
| Brand blue | `--blue-700` `#0832B4` · `--blue-600` `#123FC7` · `--blue-500` `#1748DF` (buttons) · `--blue-400` `#3164FF` · `--blue-300` `#E1E9FF` · `--blue-200` `#F0F4FF` |
| Accents | `--cyan-600` `#00ABE6` (eyebrows, chevrons) · `--green-500` `#CAD900` — **one loud accent per screen**, reserved for "Get in touch" |
| Neutrals | `--n-900` `#0D1421` → `--n-75` `#F7F7F7`. Calculator ground is `--n-300` `#CDD2DB` |
| Radii | `--r-panel` 24 · `--r-card` 20 · `--r-btn` 10 · `--r-full`. **`--r-panel` and `--r-card` shrink to 18/16 below 767px** — a 20px radius on a phone-width card reads as a pill |
| Easing | `--ease-out` `cubic-bezier(.16, 1, .3, 1)` — expo, front-loaded · `--ease-in-out` `cubic-bezier(.65, 0, .35, 1)` |
| Shadow ink | `rgba(0, 16, 73, …)` — the brand's shadow colour, not black |

**Radius follows a rule:** anything you click takes `--r-btn`; anything that
only holds content takes `--r-card`. `--r-panel` is for full sections.

**Fonts:** Sora for headings (`--font-heading`), Montserrat for body
(`--font-body`), both self-hosted from `Brand Assets/fonts/`. Numbers that sit
in a column, a price or a timer get `font-variant-numeric: tabular-nums` — this
build uses it everywhere figures stack, and it is why nothing jitters.

### Motion contracts

- **150–300ms for micro-interactions**, up to ~450ms for something that
  travels. Past 500ms it reads as lag.
- **`--ease-out` for entrances, and it is an expo curve** — it covers most of
  the distance in the first 100ms. That is usually what you want, and
  occasionally exactly what you do not: see the project card's scrim and the
  calculator's heat read-out, both of which needed a symmetric curve because a
  front-loaded one finished before the thing it was revealing arrived.
- **Exit shorter than enter**, ~60–70%. A reader leaving has already decided.
- **Animate `transform` and `opacity`.** Where a value is not interpolable —
  gradients — move it to a pseudo-element and animate that.
- `prefers-reduced-motion` is honoured globally in `globals.css` (durations to
  `.01ms`). If a rest state only makes sense mid-animation, give it an explicit
  reduced-motion rule — see `.row::before { transform: none }`.

### Cards

Three kinds, and they are not interchangeable:

1. **Content plate** — `--n-75` fill, `1px --n-200` border, `--r-card`. The
   calculator's `.plate`, `.detail`, `.big`. Use for anything holding figures.
2. **Photographic card** — full-bleed render, radius + `overflow: hidden`, a
   gradient scrim where type sits over the image. The connection cards, the
   project cards, the CloudLink banner.
3. **PixelCard** — `components/PixelCard.jsx`, vendored from React Bits and
   adapted five times over (see its header). Brand-coloured pixels scatter
   across the card **on hover or focus**, driven by a canvas. Used by the Stats
   section and the calculator's running total.

   To use it: `<PixelCard variant="hubble" className={s.card}>`. The `hubble`
   variant is `#3164FF,#7FA3FF,#F0F4FF`. Two things it needs from you — the
   card's own content must sit on `position: relative; z-index: 1`, because the
   canvas is absolutely positioned and would otherwise paint over it; and the
   scatter is hover-driven, so it wants a card that invites a pointer.

### Hero — how it is built, and how to reuse it

`SequenceHero.tsx` is the home page's hero and the pattern for others.

- A **scroll-scrubbed image sequence** on a `<canvas>`: frames from
  `public/sequence/desktop/` and `…/mobile/` (two art-directed sets, not one
  reflowed), decoded off the main thread through `public/image-worker.js` and
  drawn on scroll progress via `onScrub` from `lib/motion.ts`. It is the only
  thing that survived from v1, at explicit request.
- The section **pins** while the sequence scrubs, then hands over to the
  Statement section — the hand-off is documented in *The hero hands over to the
  Statement*.
- Copy sits in `.content` over `.tint` and `.scrim` layers; the heading animates
  per word through `RevealText`.

**For a new page that does not need 200 frames**, take the *composition* and
not the canvas: pinned section, `.tint` + `.scrim` over the media, eyebrow →
`t-display` heading → `t-lead` paragraph → actions, and `RevealText` on the
heading. A single image or a short loop drops into the same shell. The scrub
machinery (`onScrub`, the worker, the frame budget) is only worth it for a real
sequence.

### Type and layout utilities

`t-display` `t-h2` `t-h2s` `t-h3` `t-h3s` `t-h4` `t-h5` `t-eyebrow` `t-lead`
`t-body` `t-sm` are global classes in `globals.css`, not per-module — a heading in a new section
takes `t-h2` and then only overrides colour and measure locally, which is how
every section on this page does it. Wrappers are `wrap` / `wrapIn` / `frame` with `--gut` / `--gut-wide`
/ `--maxw` (1440). From 1440 up `globals.css` zeroes every wrapper's inline
padding, so a section that wants to hold the page's line at 1920+ must set its
own `padding-inline: 120px` — several already do, and a new page will need to.

The three added for the solutions pages fill real gaps in the ramp rather than
duplicating it, and each steps the weight down with the size, which is what the
comps do:

| | Size at 1440 | Weight | Used for |
|---|---|---|---|
| `t-h2s` | 56 | Sora Bold 700 | The half-step under `t-h2`. A section title that answers rather than opens |
| `t-h3s` | 32 | Sora SemiBold 600 | Numbered step titles |
| `t-h5` | 24 | Sora SemiBold 600 | Card titles and card numerals |

`--t-lead-lg` (20) is the case-study standfirst — the one place body copy steps
*up* rather than down. **Sora 400 is now loaded** (`Sora-Regular.woff2`, 23KB)
for the comparison bar's labels, which the comp sets in the display face at its
book weight. It is the only Sora 400 on the site; don't reach for it casually.

### Before you ship a new page

- `npm run check` — production build into `.next-check`. **Never `npm run
  build` while `next dev` is live.**
- ESLint is **not configured**; both build scripts pass `--no-lint`. Static
  checks are `tsc --noEmit` plus reading.
- Walk the page at 1440 / 1920 / 2560 and at a *short* window (900px tall) —
  most of the bugs in this build have been vertical, not horizontal.
- Check `prefers-reduced-motion` and tab through the page.

---

## Solutions — Energy Arbitrage

The second route, and the first page built on the home page's system rather than
alongside it. Figma `EhfzMjyCPVx7KwWTcfUVee` node `1693:195`, measured at 1440.

`app/solutions/energy-arbitrage/page.tsx` + `content/solutions-energy-arbitrage.json`.
Every section is new except `Cta`, which is reused unchanged, and `Nav`/`Footer`,
which are in the layout. The ground alternates blue / light / blue / light and
closes on black — the home page's own rhythm, a claim on blue and its evidence
on light.

| Section | What it is |
|---|---|
| `ImageHero` | The standard masthead for pages below the landing page: one photograph, copy over its pale third, parallax, and a 400px fade to `--blue-700` at the foot |
| `CommercialCase` | The inset white plate, same device as the landing page's `Statement`, at 56 rather than 72. Its traces run past the box on both ends — see the `slice` note below |
| `SolutionSplit` | Photograph holding the left 47%, the offer on a pale panel beside it. **A full screen tall**, and the only content on the page not on a gutter |
| `ArbitrageMoves` | The serpentine, and three moves in the bays it leaves |
| `DayOnTheMeter` | The comparison bar — two stacked tracks, band widths driven from the content file |
| `ModelCards` | Four cards butted together, separated by hairlines, each led by its ordinal |
| `CaseFeature` | Full-bleed case study on one wash that ends on solid black, handing over to the CTA |

Section heights land on the comp within a few px at 1440 (hero and case study
exact; the plate −1; the serpentine +7; the bar +15; the cards +17). The two
systematic overshoots are the eyebrow→heading gap, which is the house `--s-5`
(20) against the comp's auto-layout 10, and Sora's real line box against Figma's
reported one.

**`ImageHero`'s parallax is three values, and the shape of them is the design.**
`--reach` is how much taller than the frame the plate is, and it is the only one
that costs anything — it buys the crop. `--head` is how far the photograph rests
above the frame, the resting composition. `--lift` is **derived**, `reach -
head`, and is therefore the travel. Written as one symmetric value it travelled
half either side of centre, which on a masthead — only ever scrolled away from —
meant half of it was unreachable (see `exitProgress` above). At 1440 the reach is
124.5, spent 43 / 81.5: **81.5px over a 919px section, 8.9%**, against ~23px
delivered before.

Deriving the lift rather than declaring it is what keeps a framing decision and
a motion decision from leaking into each other. **The trap it closes: growing the
plate to make room for a bigger head is not a translate.** The plate's height is
also the scale, so it zooms as well as shifts and the two partly cancel. Asked
to lift the resting frame 15px, growing the plate delivers −11.9px in the high
sky, −9.2 and −6.3 at the two ends of the roofline, and −3.0 at the mark — so
"up by 15px" would be true nowhere. Spend inside `--reach` instead and the
photograph translates exactly, at constant scale. (That is why the travel is
81.5 and not the 96 it was first built at: the 15px resting shift came out of
the lift, deliberately, rather than off the edges of the frame.)

The reach is not free, and it is worth knowing where the cost lands. `cover` has
to fill the extra height, and this photograph is far wider than the plate (1.671
against ~1.38), so **height drives the scale and every pixel of plate zooms the
crop**. There is no way around it — the asset's surplus is entirely horizontal,
so vertical room can only come from scale, and no taller original of this
photograph exists. Measured at 1440: the crop's **top edge holds** (source y 41
→ 39 of 1436 — that is what `--head` is for, and it is why the roofline still
cuts the frame where the comp cuts it); the **sides** go from 88.4% of the width
to 82.5%, 58px more off each edge, of sky and the building's far corner — this
is the visible cost; the **bottom** gives up source y 1395 → 1304, which sounds
worse than it is because the section's last 400px are under `.fade` on their way
to solid blue. Mobile sets `--reach` outright at 76 rather than off `vw`, spent
35 / 41, and is deliberately gentler in percentage terms: only ~27% of the
photograph shows at that width, and at that magnification 41px reads about as
strongly as 81px does on a laptop.

One knock-on: `sizes` is `122vw`, not `100vw`. The grown plate makes the element
about 122vw wide wherever the height drives the crop (below ~1780px), so
`100vw` under-requests and the LCP image comes back soft at DPR 1.

**`SolutionSplit` is the one deliberate departure: a full screen tall where the
comp draws it 615.** It declares that with `data-full-vh`, which is also what
gives it soft snapping — see "Full-screen sections" below. Two consequences
worth knowing:

- **The five capability chips (`split.chips`) come from Figma node `1764:4009`.**
  Every value the comp specifies is already a token — the 20px radius is
  `--r-card` (and takes its 16 on a phone for free), the `#3164FF` border is
  `--blue-400`, the `#4D5563` label is `--n-600` — so the only literals are the
  10px gap and the 24px icon. No fill of their own; the panel's `--n-75` shows
  through, as the comp has it. The comp's label is **10px and this ships 13**
  (`--t-xs`): 13 is the smallest step the design system has, it is what every
  eyebrow and chip on the site takes, and 10px of Montserrat Regular is below
  anything worth giving a reader to read. The cards absorb the 4px of extra
  height without moving anything else.
- **The icons are the designer's own exports, referenced not redrawn** — from
  `public/images/icons/solutions/`, each keeping its `#0832B4` fill, exactly as
  `Icons.tsx` treats the two it holds. The content file carries a *key*
  (`installation`, `field-service`, …) rather than a path, so the copy stays free
  of filenames and the one file delivered with a space in its name is handled
  once, in `ICONS`. The space is percent-encoded rather than the file renamed —
  a re-export from Figma will land on the same name again.
- **The chips lay out with no breakpoint of their own, and that took two
  measured bugs to get right.** `flex: 1 1 0` shares the row equally (the comp's
  five equal cards); `min-width: max-content` is the floor that keeps a label
  inside its border; `max-width: 50%` is the ceiling that stops a wrapped chip
  becoming a banner. The bugs each looked like a layout preference and were not:
  five *equal* shares of the panel is 92px at a 1024 tablet against 121px for
  "Commissioning", which hung **14px outside its own chip**; and with only the
  floor in place the labels overran a 1024 row by one pixel, "SLAs" wrapped to a
  line of its own and `flex-grow` took it to the full **494px**. A fraction
  cannot know either of those, and a corrected fraction would only be right for
  these five words — the content file is edited far more often than the CSS.
  Swept at 14 widths from 320 to 1920: five equal from 1320 up, 3 + 2 from a
  tablet down, never less than 16px of slack inside any chip, and nothing
  clipped or overflowing.
- **Each chip's border is drawn, not faded — and it is a `<rect>`, not a
  `border`.** `pathLength="1"` normalises the perimeter to 1, so
  `stroke-dashoffset: 1 → 0` draws the outline clockwise at any chip size, with
  no JS, no measuring and nothing to redo on resize. That is the same idiom
  `FlowLines` uses for the page's traces, and it **is** honoured on a `<rect>`
  in Chrome — verified by rasterising one at three offsets and counting painted
  pixels: 450 at `0`, 226 at `0.5`, 0 at `1`. (`getTotalLength()` does *not*
  tell you this — it reports the geometric length and ignores `pathLength`
  entirely.) The rect's geometry is set in **CSS**, not attributes, which is what
  lets `rx` be `--r-card` and the box be inset by half the stroke so the hairline
  sits inside the SVG viewport instead of being clipped down its middle. The 1px
  the old `border` occupied moved into the padding, so the box is the size it
  always was — the width sweep is byte-identical either side of the change.
- **Two beats a chip, staggered, all off the heading's observer.** The outline
  draws, then the icon and label rise into the box it has just made:
  `120ms + i × 90` for the outline (620ms), `360ms + i × 90` for the contents
  (420ms), where `--i` is the chip's index and the only thing either timing is
  built from. The first outline is under way at 120ms while the heading's 950ms
  wipe is still running, and the last finishes at ~1100ms, so the row reads as
  part of the same gesture as the title. Nothing translates the chip itself — an
  outline that slides while being drawn reads as a smear rather than a line.
  All of it hangs off `.head[data-in] ~ .chips`, the general sibling combinator
  on the same `data-in` the Services numerals use: one trigger driving three
  stages cannot get into the wrong order at some breakpoint, which is exactly
  what the head and foot did before they were measured (see below).
- **The heading is `t-h2s`, the same 56 as the sections either side of it.** The
  comp set it in Montserrat Bold at 32, which suited the long list of services
  it originally held; the copy became a short heading in the 2026-09-09 pass and
  at 32 in the body face it read as a caption between two 56s. `.head` also
  gives up the comp's 629 measure — that is load-bearing, not cosmetic: at 629
  the first line of a 56px title wraps and the authored `\n` becomes a third
  line, at the panel's own 705 it does not. `.foot` keeps the 629 for the body
  copy, which is the normal arrangement of a heading measured wider than its
  copy.
- **The photograph is a portrait source** (1216 × 1521, 0.8) rather than the
  landscape one it started as. A full-height column is roughly that shape, and a
  landscape crop would have had `cover` scale it by *height* — rendering ~1350
  CSS px wide, at which point an honest `sizes` asks for the 3840 candidate and
  next/image upscales a 1600px file into a ~39MB bitmap whose decode never
  finishes (failure mode 13, and it is not hypothetical). `sizes` is a modest
  `600px` for the same reason: it keeps a 2× screen on the 1200 candidate, which
  this source can actually fill. Verified: a 677 × 900 render served from 1200w.
- **The head-top / foot-bottom pinning is dropped below 1024.** `margin-top:
  auto` puts all the spare height into one gap, and on a 394 × 1024 tablet panel
  that is ~380px of hole between the heading and the copy. Centred, the same
  content is one block with balanced space either side. The pinning is right at
  1440, where the panel is wide enough that the foot reads as a foot.
- **The entrance had to be rebuilt around one trigger** — see below.

#### The two entrances, and three attempts to place them

The heading arrives as the reader scrolls *into* the section; the copy and
buttons arrive once the section has fully landed. Measured at 1440 × 900:

| | Fires at a section top of | |
|---|---|---|
| head — house mask wipe | **480** | the reader coming into the section |
| foot — fade + staggered rises | **140** | the section's *bottom* edge clearing the fold |

340px of scroll apart, which is most of the approach plus the snap.

Getting there took three goes, and the wrong two are the instructive part.

**One `Reveal` per part on the house default** fires on each element crossing
the fold — and in a screen-tall panel the parts are a screen apart. The head
sits 40px from the section's top, so it revealed with the section's top still at
~750: animating at the very bottom edge of the glass, finished 700px before the
reader arrived. The foot fired at ~150. With the snap teleporting the last 450px,
both were done before the section landed, which read as no animation at all.

**Collapsing both onto one trigger on the panel** fixed the timing but made the
whole panel arrive as a single event, and the section is tall enough to carry
two.

**Two triggers, each placed rather than inherited** is what is there now. Two
things were needed to make them land:

**`rootMargin` is now a `Reveal` prop**, and this section narrows the root to
the top 12% of the screen so the panel reveals only once the section's top has
essentially arrived. It has to be a *position*, not an area: `amount` cannot
express it, because a high threshold is unreachable the moment the element is
taller than the viewport — 80% of a 1100px section on a 900px screen can never
intersect, and the observer would never fire at all, leaving the content
invisible for good. Pass `amount={0}` with it, or the two interact: a root
shrunk to 12% caps the achievable ratio at 0.12, so the default 0.15 threshold
is unreachable on paper and only fired here by luck of the panel being exactly
a screen tall.

**`Reveal`'s intersection rescue now stands down on a custom `rootMargin`.** The
fallback that catches elements whose ratio is pinned at 0 by a clip measures
against the *viewport*, not the root — so it silently overrode the narrowed
trigger and revealed the panel at 620px down. It is scoped to the default margin
now. A caller who narrows the root is expressing a deliberate position and does
not want rescuing.

Finally, the head's narrow trigger is **scoped to ≥768** — the breakpoint at
which this section is full-height — and the reason is worth knowing because it
is not obvious. Below that the panel is short: 179px between the head and the
foot on a 375. Any fixed share of the viewport applied to the head then lands
*after* the foot's default trigger and **reverses the sequence** — measured on a
375, head at a head top of 487 against the foot at 726, which is the foot
arriving first. On the plain defaults the two are 189px apart in the right order,
so the phone keeps them. Verified after: head at scrollY 1025, foot at 1250.

**A general note on sequencing two `Reveal`s.** Their order is a function of the
distance between the elements and the distance between their triggers, so a pair
that reads correctly at one breakpoint can invert at another. If the order
matters, measure it — `orderCorrect` is two lines of console work and it caught
this.

### `slice` changes which axis it scales by, and a trace end can fall inside

Worth knowing before authoring any trace against a `slice` viewBox. `slice`
takes its scale from whichever axis needs more, so a box's aspect crossing the
viewBox's aspect **silently switches which axis gets cropped**:

| | |
|---|---|
| box aspect > viewBox aspect | width drives; the drawing is scaled up and cropped **vertically** |
| box aspect < viewBox aspect | height drives; **no vertical crop at all**, so the floor is exactly the viewBox height |

The commercial-case plate crosses that line in normal use. Its viewBox is
`1357 × 483` (aspect 2.81) and the plate measures 1440 × 482 at 1440 — aspect
2.99, width driving, 11px of vertical overshoot. Narrower, the plate's aspect
drops below 2.81 and height starts driving, at which point there is no vertical
crop and the comp's tail at y=479.1 landed **4–5px above the plate's floor**: the
blue line visibly stopped just inside the white. The cyan escaped it only by
accident, having been authored to 495.

The rule, and it applies to every trace in this build: **a trace must be cut off
by its frame, never stop inside it.** Author the ends well past the viewBox — the
plate's are now y=560 on a 483 floor and x=1440 on a 1357 edge — and let the
container's `overflow: hidden` do the cutting. Measured after: 64–107px of
clearance past the floor at 1440 / 1200 / 1024 / 820, in both scaling regimes.

### Full-screen sections, and soft snapping

`[data-full-vh]` on a section does two things, and that is the point: it sets
`min-height: 100lvh` (globals.css) **and** it is what `ScrollSnap` looks for.
Declaring a section full-height and giving it a soft snap is one act, so the two
cannot drift apart. `lvh` rather than `vh` because a collapsing browser toolbar
changes `vh` mid-scroll and would resize the section under the reader;
`min-height` rather than `height` so long copy pushes it taller instead of
spilling. To opt out at a breakpoint, out-specify with two selectors —
`.sec[data-full-vh] { min-height: 0 }` — as the phone does.

`ScrollSnap` is mounted once in the layout, after `SmoothScroll` so Lenis exists
by the time its effect runs. Come to rest near a full-screen section's top edge
and the page eases the rest of the way; come to rest anywhere else and nothing
happens.

**The reach is half a screen either side of the line**, which for a section
that *is* a screen tall means "snap to whichever edge is nearer". Measured at
1440 × 900 with real wheel scrolls:

| Reader comes to rest… | Result |
|---|---|
| 200px short of the line, going down | **snaps** — completes the approach |
| 700px short — beyond the reach | left alone |
| 120px past the line, going down | **snaps** — tidies the overshoot |
| 380px past | **snaps** — the top edge is still the nearer one |
| 620px past — over half way | left alone, they are leaving |
| 300px past the top, coming up from below | **snaps** — completes the approach |
| 250px above the top, going up | left alone |
| anywhere, immediately after being snapped | left alone — see the guard below |

- **Complete an approach, tidy an overshoot, never block an exit.** This is the
  bit the first cut got wrong, and it is worth knowing why. It refused to ever
  move the reader backwards, on the theory that a snap should only assist. But a
  wheel flick comes to rest wherever its momentum leaves it and almost never on
  the line, so "never backwards" meant entering a section never snapped at all
  — it just sailed past. An entry snap has to be willing to pull back.
- **A pull-back happens once per visit.** `settledOn` remembers the section the
  reader was last placed on and will not place them there again until they are
  properly clear of it. Without it, scrolling *out* of a freshly tidied section
  is undone on every rest — the classic snap trap, and the reason the pull-back
  can afford to reach as far as it does.
- **Only on rest.** No layout is measured during a scroll — the handler waits
  160ms after the last Lenis scroll event, by which point Lenis has eased out.
- **Verified, not assumed.** A section is only a candidate if it is *actually*
  about a screen tall right now, so the attribute is safe to leave on a section
  a breakpoint has overridden.
- **Pointer only, and no Lenis means no snapping.** A soft snap fights momentum
  scrolling, so coarse pointers are left alone entirely; and under
  `prefers-reduced-motion` `SmoothScroll` never creates Lenis, which is correct
  — an animated snap is exactly the motion that preference is asking us not to
  make. The savings drawer stops Lenis while it is open, and `isStopped` is
  checked before anything moves.

**Why not CSS scroll-snap.** `scroll-snap-type: y proximity` *does* work
alongside Lenis — tested in the page: it completed a 120px approach and left a
deliberate 380px rest alone, so Lenis' per-frame writes and the browser's
snapping do not fight. Three things still rule it out. It would **trap the
reader**, because CSS re-evaluates on every rest and has no way to express "you
have already been placed here once" — which is the guard that lets the reach be
useful. It has **one threshold for both directions** and no notion of which way
anyone is going, so it cannot leave an upward exit alone. And that threshold is
**the browser's, not ours** — untunable and inconsistent between engines.

**Testing this: never set the start position with `window.scrollTo`.** Lenis owns
the scroll offset and animates back to its own target a frame later, so an
instant `window.scrollTo` is overridden. It produced a full set of exactly
inverted results that looked like a sign error and was not. Use
`lenis.scrollTo(y, { immediate: true })` to place the start and
`lenis.scrollTo(y, { duration })` for the move under test — and start far enough
away that the setup jump cannot itself snap, or it arms the guard and blocks the
case you were trying to measure.

### Three things here are reusable

**`RuleLink`** — the secondary link opposite a primary button: a hairline that
eats the slack, then a small-caps label and the pixel arrow. Ink is
`currentColor` throughout, because it is used on the hero's pale sky and over a
photograph. It drops the rule below 768, where there is no slack to eat.

**`FlowLines` now takes `pulseWidth` and `pulseGate`,** both per flow / per
layer and both no-ops unless asked for, so every home-page route is unchanged.

`pulseWidth` defaults to `width`. The solutions comps draw the travelling charge
heavier than the trace it runs along — a 1px route carrying a 3px pulse — which
is the difference between reading as current and reading as a thicker piece of
cable.

`pulseGate` adds `--pulse-gate`, a plain multiplier on the pulse opacity the
scrub already computes, so a use site can hold the charge back until it is
wanted. It is opt-in **because it also scopes the transition that softens the
release**: on an ungated route the opacity *is* the scrubbed value, and putting a
transition on it would make every home-page pulse lag the scroll. On a gated one
the scrubbed term has stopped moving by the time the gate opens, so the only
thing the transition smooths is the gate.

**`PixelCard` can now be driven rather than hovered.** The comp lifts the bar's
two loud bands with a scattered-dot texture, built as a dark plate of light dots
at `mix-blend-mode: screen`. That was the first build and it worked, but it was a
fixed bitmap: it could not take the brand's own pixel animation, and it forced
the green band's ground off-brand to survive the blend (screen lightens, so
`.avoided` had to be `#B5C200` to come out at `--green-500`).

It is the real pixel effect now — the same `PixelCard` canvas as the landing
page's stat cards — which needed a fifth adaptation to the vendored component:
an **`active`** prop. Upstream the effect only exists as a hover/focus response,
which is right for a card; these bands are a chart, and the comp textures them at
rest, so the scatter has to be something the section triggers. The section's own
observer switches it on as the chart arrives, so the pixels come in behind the
bar's wipe. Passing `active` *replaces* the pointer handlers rather than adding
to them, so hovering a driven card cannot re-fire or undo it. Re-initialising on
resize also has to put an already-on card back, or the field vanishes the first
time the window changes size.

Two things came with it:

- **Two new variants, `barBlue` and `barGreen`,** each pitched three steps
  *lighter* than the band it scatters over. `hubble` cannot do this job — its
  darkest colour is Blue/400 itself, so over a Blue/400 ground a third of the
  pixels would be invisible and the field would read half as dense. Verified:
  both bands paint at 11.5% coverage in their intended palettes.
- **`.avoided` is the brand green again** (`--green-500`), since a normally
  composited field needs no compensation. Its label was the comp's `#FEFFE9`, at
  about 1.3:1 on that ground — flagged here, and **the redesign fixed it**: it is
  now `--n-900`, measured at **11.8:1**.

### The bar, redrawn from Figma `1765:4070`

The graphic was restructured, and the change is the *argument*, not the styling:
`COST AVOIDED` moved from the far right of the lower track to sit **immediately
beside** `WITH HUBBLE`, and the pale stretch moved right and gained a line of
copy. So the loud run now ends at 50.05% — exactly where the upper row's blue
ends — and the two rows read as one claim you can check by eye: half the bill on
the grid, and with Hubble a fifth of it paid and the other thirty points avoided.
The comp is ~1px out on that alignment and the content file squares it (20.24 +
29.81 = 50.05), because the alignment *is* the point.

**The pale ground moved from a band to the row.** `.row` is now the plate —
full width, `--bar-r` on all four corners, `overflow: hidden` — and the coloured
bands sit on top of it. Two things follow, and neither is tidiness:

- The avoided band's right corners are rounded **in the middle of the track**,
  so the wedges outside that curve must show the pale ground. Painted by a
  `rest` band sitting beside it, they showed the section's `--n-75` through
  instead — a shade too light, and visible.
- The row's own radius plus `overflow: hidden` rounds every outer corner of
  every band, so the old `:first-child` / `:last-child` radius rules are gone.
  Nothing needs a radius for its position in the array any more.

`.rest` still exists as a band and still carries a width, but paints nothing: its
width is what centres its label in the pale, and "the widths total 100" is the
invariant that keeps the two rows' edges honest. Its label takes
`white-space: pre-line` rather than a `<br>` — the lower one is two lines in the
comp — which breaks the line identically while leaving the newline a text node,
so the accessible name still reads as one sentence.

**Contrast, measured.** `COST AVOIDED` is now 11.8:1 (it was ~1.3). `ON THE GRID`
6.93, `WITH HUBBLE` 4.78. But the comp's `#8798CC` on the two pale grounds is
**2.17:1 and 2.4:1**, well under AA — shipped as designed and flagged. The
minimal fix that keeps the design's character is the same hue a few steps darker:
**`#4C5C93`** measures 4.91 / 5.44 and passes.

The layer is positioned with `.band .pix`, not `.pix`: `PixelCard`'s own
`.pixel-card` sets `position: relative` at the same single-class specificity, and
which one wins should not depend on CSS-module import order.

## Products — High Voltage (Commercial & Industrial)

`app/products/high-voltage/page.tsx` + `content/products-high-voltage.json`, from
Figma `1719:27`. **Partial and deliberately so** — Aldo's design for the page is
still in progress, so the route carries the comp's first two sections and the
reusable `Cta`. The four still to come, in comp order:

| Figma node | y | What it is |
|---|---|---|
| `1719:152` | 1767 | "Not a hardware quote. One integrated system." — photo left, 2x2 capabilities right |
| `1719:225` | 2481 | "Same system. Different stakes." — four industry columns, on a Pixel Fade band |
| `1759:3805` | 3251 | "Two ways to put it on your site." — Indoor / Outdoor cards with spec tables, Pixel Fade |
| `1719:511` | 4446 | The CTA — already built and wired |

Read the page with `use_figma` **one section per call**: `get_metadata` blows the
MCP output cap on this frame (it died at 34,599 chars) and so does a three-section
TSV dump. `get_design_context` on a single section works and is the better first
try — that is how both built sections were measured.

### The hero is the landing page's `SequenceHero`, not a second one

259 frames of the product render instead of 422 of the cube grid, one beat
instead of three, and the comp's label row under the nav. The worker fetch, the
nearest-decoded-frame fallback, the 350lvh pin, the HUD and the reduced-motion
poster are all shared — so a fix to one hero is a fix to both. Two additive
props made that possible:

- **`dir`** — `string | { desktop, mobile }`, defaulting to the landing page's own
  set so its call site is untouched. A *string*, not a path-builder function,
  because the pages that pass it are server components and a function cannot
  cross that boundary.
- **`labels`** — the comp's row under the nav, a section label left and a standing
  line right. Absolute rather than a first child of `.content`, because
  `.content` justifies to the end to hold the copy at the foot of the pin and a
  first child there gets pushed down with it.

The beat's `eyebrow` is now rendered **only when present**. The first build of
this hero showed "High Voltage / Business & industrial energy" twice — once in
the new label row and once above the heading — because the landing page's hero
always renders the eyebrow and this comp puts that string in the row instead.

### The frames: 333 MB of PNG became 15.8 MB of webp

`public/product sequence/` arrived as 259 PNGs at 2200x1237, mean 1.3 MB,
**333 MB total** — seven times the landing hero's whole desktop set. Encoded to
`public/sequence/product/frame_NNN.webp` at q86: **15.8 MB, mean 59 KB, max 125
KB**, which is a third of the landing hero's 47 MB because these renders are a
product on flat blue rather than a lit cube grid. A second set,
`public/sequence/product-mobile/` at 1200px wide and q82, is **6.1 MB** so a
phone does not pull the full-size frames.

Naming is the house convention (`frame_000.webp` upward, zero-based, three-digit,
contiguous) so `dir` is the only thing that changes.

**The source PNGs are still in `public/`, and everything in `public/` is served
and copied into the build.** They should move to `3D Files/Sequence/product/`
alongside the other source sequences — flagged, not done, because they are
Aldo's source assets.

### `BusinessStakes` — the four claims

Built on `Services`' idioms rather than beside them: the numeral is text carrying
`t-h2 num` (the comp outlines its glyphs, which is only what Figma does to type —
the exported SVG is a `<g id="2">` of path data, so there is nothing to import),
the ring is `ArrowRing`, and each row reveals on its own small delay. The row's
shape differs: `Services` runs numeral → title + body → ring, this runs
numeral → label → claim → ring with no body copy.

Measured against the comp at 1440: heading 56 (`t-h2s`), claims 32 (`t-h3s`),
columns `100px 1fr 1fr 44px`, rows 158 against the comp's 159, labels
`--cyan-400`, discs `--blue-500` with `--blue-200` arrows.

Two notes worth keeping:

- **The ring override is `.sec .row .ring`, not `.ring`.** `ArrowRing`'s own
  `.onBlue.arrow` is two classes, so a single-class override would tie with it
  and the winner would depend on CSS-module import order — the same trap
  `DayOnTheMeter`'s `.band .pix` note records.
- **The section is ~960 tall against the comp's 848**, and that difference is
  entirely its block padding. The comp's frame is auto-sized to its content (846
  of content in an 848 section), which would put the eyebrow hard against the
  hero's last frame and leave the fourth claim 17px off the hard colour change
  into the light section below. 56px is the compromise and it is the one value
  on this section not taken from the file.

### The serpentine, and the one place this page breaks the 1920 rule

The route is the composition here, so `ArbitrageMoves` does not use
`.frame`/`.wrap`. Content and svg share one box — capped at 1440, centred, no
inline padding at any width — and every horizontal measure inside it is a
percentage of that box, so the two scale by the same factor and stay locked
together.

Both polylines and the 50px radius are lifted off the comp's own vectors, 13
waypoints each. **The pair is not a uniform translate**: vertically the cyan
sits a flat +20 below the blue, but horizontally the offset alternates (−20,
−50, +40, −40, +30, +40) so the two stay nested through every turn. Offset one
by a constant and half the corners come out concentric and the other half
crossed.

#### Three things happen as you scroll, in this order

Each is tied to a move the reader can see arrive, not to a fraction of a box —
so none of it needs re-tuning when the copy reflows.

1. **Each move fades up as it arrives**, its heading first and its copy 110ms
   behind. `Reveal` runs at `variant="fade"` and the rise lives on the two
   children off `data-in`, because `up`'s 28px is too small a move to register
   with 474px between rows. Both delays inherit `--rd` rather than carrying a
   fixed one, so the pair stays in order when a flick puts a whole row across
   the threshold in a single observer batch.
2. **The route draws as the reader comes down the moves.** It begins with the
   first move rather than the heading — the drawing is what connects them — and
   ends on a zero-height landmark on the section's floor. **Why the floor and
   not the third move is the whole trick; see the pacing note below.** Measured
   at 1440/900: `--draw` is 0.00 as move 1 touches the bottom of the glass, 0.02
   once it is readable, 0.34 at move 2, 0.71 at move 3, ~1 with move 3
   mid-screen.
3. **The charge starts running only once the route is essentially drawn and the
   third move is on screen** — at 1440/900 that is with move 3 mid-screen. The
   route has to exist before anything can travel down it, and holding the glow
   until the argument is complete is what makes it read as the system switching
   on rather than as decoration that was always moving. The section drives
   `--pulse-gate` off a `data-live` attribute set by its own observer on move
   three — `Reveal` cannot do that job, because its `data-in` lands on the move,
   not on the layer the route reads.

   **The gate latches.** Releasing and re-holding it was the first cut and it
   was wrong: the third move leaves the top of the screen ~370px before the
   section does, so the glow visibly switched off while a stretch of lit route
   was still on screen. Latching cannot misfire on the way back up, because the
   draw threshold is the other half of the condition and that unwinds with the
   scroll.

#### Pacing the draw — the arithmetic, because eyeballing it got this wrong once

The route is ~5,690 units long and its **vertical** extent is only ~1,307 of
them: it travels 4.4 units of line for every unit of downward progress. So a
bracket sized to the reader's own travel will always be outrun by the drawing
front.

Bracketing it between the first and third moves — which is where this started —
gave the draw 948px of scroll to lay down all 5,690 units, or 6.0 units per
pixel. The consequence was not subtle: at the halfway point the front was at
section y≈1074 while the viewport ended at y≈772, so **every stretch of route
had already been drawn before it came on screen** and the line read as appearing
rather than as being drawn.

Ending on the floor marker gives it ~1,420px, and `window: [0.12, 1]` holds it
at zero until the first move is genuinely readable instead of peeking in at the
very bottom of the glass. That is ~4.5 units per pixel over ~1,250px, against
the products run's 3.6 over 843 — the same hand. The front now sits on screen
throughout: at 34% drawn it is at y≈862 with the viewport ending at 892.

**The two requirements pull against each other, and this is where the line was
drawn.** The charge cannot be released the instant the third move arrives *and*
have a finished route to run along, because the route continues ~340 units below
that move — released early, a bright dash would travel over line that has not
been drawn yet. It waits for the draw. To trade back the other way, move the
second anchor from `end` to `last`.

**The phone runs no anchors at all**, and it has to be that way. The landmark
bracket spans move one to the floor — ~570px on a 375 phone — against an 812px
viewport, so `vh − from.top` is already larger than the span before the section
is even in view and the rail arrived fully drawn every time. Dropping the
anchors falls back to `scrubProgress` on the svg's own box, which is the whole
section: a span of `viewport + section` (~1,660px), of which `window: [.12, .7]`
takes the middle ~960px. Measured on a 375: 0.01 → 0.22 → 0.43 → 0.64 → 0.84 →
1.00 across the scroll. **A short section on a tall viewport is the general
case to watch for here** — any `betweenProgress` bracket shorter than the
viewport completes before the reader arrives.

#### Both ends depart from the comp, deliberately

**The tails run to x=2200**, not the comp's 1445.9, and that is arithmetic rather
than taste. The svg is capped at 1440 and centred, so on a wider screen its
right edge sits `(viewport − 1440) / 2` short of the glass — 80px at 1600, 240 at
1920, 560 at 2560. The box stays 1440 wide, so one unit is one real pixel and
the tail has to overshoot by that same figure to reach the edge. The comp's own
figure only ever reached the glass at exactly 1440 and was visibly cut off at
every width above it. 2200 clears 2960.

**Both heads start level** at y=257.6, where the comp staggers them by 20. The
pair opens in clear space just under the heading — it cannot run off the top
edge without crossing the type, which is the usual answer to a bare start — so
the two round caps are on show, and staggered they read as a ragged end rather
than a deliberate opening. Level, with the x offset kept, the nesting through
every corner below is unaffected.

The projection is `preserveAspectRatio="none"` on a `0 0 1440 1742` box — 1742
being the section's real height at 1440. The usual price of `none` is elliptical
corners, and at r=50 that would be visible rather than academic. It is avoided
rather than accepted: **every vertical measure in `ArbitrageMoves.module.css` is
`clamp(floor, <n>vw, <1440 value>)`**, so the height tracks the width below 1440
and freezes above it, keeping the two scales equal. Built height is 1749 against
1742 — 0.4% out, so the corners are circular. A fixed px or rem anywhere in that
file breaks this.

**And so this section alone is not released onto the 120px gutter at 1920.** Its
neighbours are; it stays on the 1440 measure, which leaves its heading ~183px
inboard of theirs at 1920. The alternatives were both worse: release it and
scale the box non-uniformly (corners 17% elliptical at 1920, 61% at 2560), or
release it and let the height scale with the box too (corners stay round, but
the vertical rhythm inflates 17% against every neighbouring section). The ground
is full-bleed blue either way, so the band still reads full width — only the
drawing stays on the comp's measure. **Open for a decision.**

### The comp's own snags, reproduced or fixed

Fixed silently, because they are slips rather than choices: a 1px horizontal
drift that made one vertical in each commercial-case trace lean (1311.5 →
1312.5), a redundant collinear waypoint in the cyan route, a double space in
"maintenance  and SLA", a trailing space on "Cerebos Salt ", and the typo "View
Ou product Range".

**Reproduced verbatim and flagged instead:** `split.columns` is placeholder copy
from another brand — "existing financial environments", "how institutions
operate", "regulatory contexts" — carried through in the Figma frame. It is
marked with a `_note` in the content file and needs Hubble copy.

**Left undone:** the four `ModelCards` have no destinations, so none carries an
`href` and the ring is decorative. Add an `href` to a card and the whole card
becomes a link, hover state and all.

---

## Content

Flat JSON in `content/`, read at build time by `lib/content.ts`. `site.json`
holds nav and footer; `home.json` holds the page. The CMS from v1 can be
pointed at these files unchanged.

No *home-page section* has copy baked into it, but the savings drawer does —
about 104 strings in `sections/SavingsCalculator.tsx` and 78 in `lib/savings.ts`
(tariff, profile, battery and location names plus every read-out row label), and
`ContactPanel.tsx` carries the whole contact form. Those still need a code edit;
extracting them into `content/calculator.json` and `content/contact.json` is
outstanding.

Editing a `content/*.json` file takes effect on the **next request** — no
restart and no rebuild, verified against the dev server. Two things to know
before hand-editing:

- **`hero.eyebrow`, `hero.title` and `hero.copy` are dead.** `SequenceHero`
  renders only from `hero.beats[]`; `beats[0]` is the first screen.
- **`statement.title` contains a literal U+2028** line separator, put there to
  force its line break. **It does not work.** Verified in the page: Chrome does
  not treat U+2028 as a forced break — the heading stays on one line under
  `pre-line`, under `pre-wrap` and with `text-wrap: balance` off. That title's
  break actually comes from its `max-width: 12ch`. The character is invisible in
  most editors and prints as a space in a JSON dump, so it is worth deleting
  rather than preserving. Use `\n` instead (below).
  **It keeps coming back** — three more arrived in
  `solutions-energy-arbitrage.json` during the copy pass on 2026-09-09, in
  `split.title` and both of `commercialCase`'s strings. It is what an editor
  inserts for Shift+Return, so assume any newly written copy may carry one and
  grep for it: `python3 -c "print(open(f).read().count(chr(0x2028)))"`.

### The bar's surface, and the dropdown width

The pills and the small dropdowns share one treatment: `--r-nav` (8),
`rgba(0, 0, 0, .4)` and a 6px backdrop blur, so a trigger and the plate it opens
read as one material. The panel's blur came down from 7.5 to 6 for that reason —
it was the one value making it a separate surface.

**Raising a resting state means re-checking its hover.** The pills went from .2
to .4 and `:hover` was .34 — which would have made a hovered pill *paler* than a
resting one. It is .55 now. The panel's own `.sub:hover` is a solid
`--blue-400`, so it was unaffected; the `.bar.light` variants are a separate
palette and were left alone.

**A dropdown is at least as wide as its trigger.** `min-width: 100%` — the
panel's containing block is the trigger's `<li>`, so that is the pill's own
width, and the pills are elastic (`flex: 1 1 0`) so it tracks the viewport.
`width: max-content` still lets a long label push a panel wider than its pill,
and because `min-width` beats `max-width` in CSS when they conflict, a pill wider
than the 320 cap still wins — a panel can never end up narrower than the thing
that opened it.

Not changed: the burger's `rgba(0, 0, 0, .2)`. It is a different control and only
appears below 768.

### The mega panel

`MegaPanel` renders when a top-level nav item has a `mega` object in
`content/site.json`; `Solutions` has one (Figma `1780:6513`). `children` stays
alongside it — the mobile sheet renders that list, and it is the fallback if
`mega` is ever removed.

Three structural decisions, each of which has a wrong version that looks fine
until it doesn't:

- **The panel stays inside the trigger's `<li>`.** The open and close handlers
  are on the `li`, so a panel rendered as its sibling fires `mouseleave` the
  moment the pointer reaches it and shuts itself.
- **…but the `li` gives up being a positioning context.** The comp's panel is
  1358 wide — the bar's measure, not the trigger's — so
  `.item:has(> [data-mega]) { position: static }` lets it anchor to `.inner`
  instead. That is the whole reason for the `data-mega` attribute: a
  `[class*='mega']` substring match would be at the mercy of the CSS-module hash
  and of anything else whose class contains the word.
- **The chip is a sibling of the row's link, not inside it.** An anchor within
  an anchor is invalid HTML and breaks hydration.

#### The layout is the comp's, and its row heights are not uniform

Everything is measured from Figma at 1440: sheet 1358 x 493 with 32 of padding,
columns 286 with 74 between them and a hairline down the middle of that gap,
promo 229 starting 16 *above* the columns, heading 32 Sora SemiBold.

**The comp does not use one row height** — columns 1 and 2 run at 100 and column
3 at 63. The reason is visible once you look: column 2's rows carry a chip and
need 100, and column 1 matches so the two two-row columns line up with each
other; column 3 has four rows and its own tighter rhythm. So the height is
selected on the row *count* (`:has(.list > :nth-child(3))`), not hard-coded per
column. Column 3 also closes with a rule under its last row, which is what lands
its bottom edge level with the other two.

The rule between rows lives in the 8px gap as a pseudo-element rather than on the
row's own edge, so the hover plate is the comp's clean 100 instead of swallowing
the rule. The plate is on the row, not the row's anchor — which is the only way
it can also cover the chip, since the chip has to sit outside that anchor.

**The row hover is `--blue-300` (`#E1E9FF`) and it wipes in from the left.** A
fade across a 286 x 100 plate is a lot of area changing colour with nothing to
read in it; a wipe has a direction and tells you which row you are on. It is
`clip-path`, not `scaleX`, for the same reason the panel's own expansion is — a
scale distorts the corner radius as it grows. 280ms in, 180ms out, since hover is
high-frequency and the exit should not linger. Measured: in 100% → 43% → 18.7% →
~0, out 0% → 72% → 92% → 100%.

The plate is a `::after` at `z-index: -1`, which needs `isolation: isolate` on the
row — without a stacking context there it slides behind the sheet's white
background and is never seen.

**The sheet is a two-row grid, and that is what aligns the promo.** The heading
spans the top; the three text columns and the promo share the row under it, so
the card's top edge lands on the column labels' *structurally* rather than by an
offset that has to be recalculated whenever the heading changes size. The first
build had `.promo` as a sibling of the heading's wrapper, so it began at the
sheet's content top and a hand-computed `-16px` put the card 56px above where it
belonged.

Two more things the comp does that are easy to miss: the columns are each their
own height (281 for the two-row first, 373 for the four-row last), not stretched
to the tallest — and the hairlines between them are **321.7 against a 373 column
area**, so they stop short of the floor rather than closing the columns off.
Grid stretches by default, which made both wrong at once.

Built against the comp, every value checked rather than a sample: sheet 497/493,
col heights 283/374/378 against 281/371/373, columns at x 32/393/754 against
32/392/752, rows 100/100 and 63 x 4, hairline 322 against 321.7, footnote 75
against 74, card top exactly on the "Process" label.

**One trap worth keeping.** The promo heading came out one word per line. With
`box-sizing: border-box`, a `max-width` and a `padding` on the same element
fight: 40px of padding inside a 105px max-width left a **65px** content box, and
"How can" needs 72. The padding moved to the card and the measure stayed on the
heading, which gives the comp's three-line break.

It hides at `max-width: 1279px`, matched to where `Nav.module.css` drops
`.items` — below that the burger sheet *is* the navigation, so the panel has no
trigger row to hang off. Checked at 1280, the narrowest width the pill row
exists at: the panel is 1208 wide, three columns of 295, nothing clipped.

The promo card's gradient is CSS and the person is a cut-out with its own alpha
(`/images/nav/expert.webp`), rather than one flattened bitmap — so the card keeps
its corner radius, the gradient never resamples, and the photograph can be
swapped on its own.

#### The motion

Evaluated with the `motion-design` skill's process. Purpose: responsiveness plus
spatial continuity. Frequency: medium. Pattern: enter/exit.

**The white plate expands first, and the content follows it in.**

| | duration | delay |
|---|---|---|
| plate expands | 380ms | 0 |
| columns + promo in | 300ms | `160ms + i x 60ms` |
| everything out | 200ms | 0 |

All on the house `--ease-out`.

**The expansion is `clip-path`, not `scaleY`, and that is the whole trick.** A
scale was the easy version and the wrong one: it squashes every child on the
way, so the type would stretch back into shape as the panel opened. A clip
transforms nothing — the columns are laid out at full size throughout and
stagger on their own, independently of the plate. `round var(--r-panel)` keeps
the corners correct at every step. The shadow is clipped along with the plate,
which is right: the plate's shadow should grow with the plate.

**The exit has no stagger and no delay.** Opening is an offer and can be
choreographed; closing is the reader saying they are done, and a staggered exit
makes them watch a menu unbuild itself.

Measured in the page by resolving the hashed `open` class from the stylesheet
and driving it: the plate is **97% expanded before the first column moves**
(240ms), the four parts then cascade — at 400ms they read 0.99 / 0.95 / 0.80 /
0.20 — and everything is in by ~640ms. Out: all four at 0.32 together at 100ms,
gone by 250ms.

### Hiding a nav item

`nav[n].hidden: true` in `content/site.json` keeps an entry in the file but out of
the bar and the sheet — for a section that is written but not ready to link to.
`About` carries it now.

`Nav` filters **once, above both renders**. The bar and the mobile sheet map the
same array, so filtering inside either one would hide the item on a desktop and
leave it on a phone — which is the kind of thing nobody notices until it ships.
`openIdx` indexes the filtered array too, so the filter has to come before it.

Prefer this to deleting the entry: `About` has four children in the file, this
repo has no version control, and the item comes back by flipping one word.

**It does not touch the footer**, which is separate content — `/about`,
`/about/our-story` and `/about/careers` are still linked there.

### Hard line breaks in a heading

**`\n` in a content string becomes a real break** in any heading rendered
through `ScrollRevealTitle`.

**The `<br>` is rendered as `<Fragment> <br /></Fragment>`, and the leading
space is load-bearing.** Accessible-name computation concatenates text nodes and
does *not* insert whitespace for a `<br>`, so a bare one had the a11y tree
report the split panel's heading as "One system, built aroundyour business." —
verified in the tree, not assumed. A trailing space at the end of a line
collapses visually, so it costs nothing to render and it puts the word gap back
into the name.

**In body copy a `\n` means a new paragraph, not a `<br>`.** `CommercialCase`
splits its `copy` on `\n` and renders a `<p>` per part, with `.copy + .copy`
carrying the gap. A bare `<br>` would put the second thought hard against the
first with no air, which reads as a wrap rather than as a break. Only
`CommercialCase` does this so far — it is three lines to add to any other
section that needs it.

Reach for it when a comp breaks a heading somewhere a measure cannot put it.
That happens more than it sounds: `.t-h2` and friends carry `text-wrap:
balance`, which only ever distributes lines *evenly*, so an uneven break is
unreachable while it is on — and turning it off leaves you tuning a `max-width`
that holds at exactly one measure and one font size. Sometimes no width works at
all. The commercial-case heading is the clean example: the comp's widest line
("energy that moves.", ~580px) is *wider* than the line a measure would have to
forbid to get the first break ("Your bill doesn't have", ~572px), so there is no
number that produces those three lines.

```json
"title": "Your bill doesn't\nhave to follow\nenergy that moves."
```

Two things follow from using it. The breaks apply at **every** width, so check
the narrowest one — a hard-broken segment that re-wraps reads as a stray extra
line, which is why `CommercialCase` drops its phone font a step. And drop the
`max-width` you were using to force the break; leave only a safety measure if
one is wanted.

### Inline emphasis, and inline links

Copy in the JSON stays plain text — it is what the copy editor edits, and
anything markup-shaped there invites HTML in a string we would then have to
trust. So a phrase wrapped in asterisks steps up to medium weight:

```json
"copy": "We built Cloudlink as the *connective intelligence* that …"
```

`lib/emphasis.tsx` turns each `*…*` run into `<span class="t-med">`, which is
`font-weight: 500` in `globals.css` — a real Montserrat Medium face, not a
synthesised weight. Escape a literal asterisk as `\*`. A component opts in by
rendering `{emphasise(copy)}` instead of `{copy}`; `CloudLink` and `HowWeWork`
do, the rest do not yet. The whole-line form of the same convention already
existed in the footer's `presence.lines`, where `*text*` marks a region heading.

The same helper takes the other shape people already type, for the same reason:

```json
"copy": "You own the hardware; we design and support it.\n(See it in action: [Aspen](/projects))"
```

`[label](href)` becomes a `next/link` — `Link` and not `<a>` so an internal href
prefetches like every other route on the site. It carries **no class of its
own**: a link's colour belongs to the panel it is printed on, not to a helper
that cannot see it, so the use site styles `a` inside its own copy block.
`HowWeWork`'s option cards are the first caller.

---

## Deliberate deviations from the comp

1. **Eyebrow colour on light grounds.** The comp's cyan `#00ABE6` is 2.5:1 on
   white and on the services grey — fine as a graphic mark, short of WCAG AA as
   13px label text. Light sections carry `.on-light`, which swaps in
   `--cyan-ink: #00719A` (5.1:1), the same hue held down. On black (8.0:1) and
   on the brand blue (4.6:1) the comp's own cyan is kept, because it passes
   there. One token, one class — revert by deleting `.on-light`.

2. **Project rail.** The comp shows a staggered row running off-frame. It is
   built as a real horizontal scroller — native overflow, snap points, wheel,
   touch, keyboard, plus drag-to-pan for pointers — rather than a pinned
   scroll-hijack, so it stays operable and does not take the page's scroll away
   from the reader.

3. **Store badges are drawn**, not shipped as raster lockups, so they stay
   crisp and take the page's own radius and type.

4. **`More about High Voltage`**, where Figma `1797:533` has *More about Low
   Voltage* on both rows — a copy-paste slip in the comp, not a label.

5. **Eyebrows are 13px, not the comp's 12.** 13 is the smallest step the type
   scale has and what every other eyebrow and chip on the site takes. Same call
   as the arbitrage page's capability chips.

6. **The partner panel's button keeps the `light` variant's `--blue-500` label
   and blue chevron**, where the comp draws `#0832B4` with a cyan arrow. The
   variant is shared and its arrow rule — *a blue plate takes a white arrow, a
   light plate a blue one* — is deliberate; matching the comp here would make
   this the one light button on the site that differs. Both pass AA on white
   (6.6:1 against 9.4:1).

7. **"Integration", where Figma `1797:618` and the delivered icon filename both
   read "Intergration".** Not a word; shipped corrected. The icon file keeps its
   name — a re-export from Figma would land on it again — and `HowWeWork`'s
   `ICONS` map is where the two are reconciled.

8. **The duplicated closing sentence in *Configured solutions* is dropped.** The
   comp ends the *Funded partnerships* column with "Both approaches allow you to
   benefit from energy arbitrage and where wheeling." and then repeats it, in
   bold and without the stray "where", as the card's own footnote. The footnote
   is kept; the trailing copy in the column is not.

9. **`HowWeWork`'s eyebrow is the comp's `--blue-400`, where every other eyebrow
   on the page is `--cyan-ink`.** Followed because `1797:618` says so outright.
   Note it is **4.46:1** on the `--n-75` ground — a whisker under AA for 13px
   label text; `--blue-500` is the same family at 6.47:1. Either unify the page
   on blue or hold this one section apart, but it is currently the only eyebrow
   that differs.
