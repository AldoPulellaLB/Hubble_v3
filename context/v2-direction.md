# Hubble 2026 — v2 direction

Supersedes the visual direction in `design-direction.md` §3 onward. The token
layer in §2 of that file still holds; the composition, section order and motion
language are now taken from the redesigned landing page.

**Source of truth:** Figma `EhfzMjyCPVx7KwWTcfUVee`, node `60:76`
(https://www.figma.com/design/EhfzMjyCPVx7KwWTcfUVee/Hubble2?node-id=60-76).
Comp is 1440 × 8649. Every measurement below was read off a full-resolution
export of that node, not estimated.

`v1/` holds the previous build. `v2/` is the direction going forward.

---

## 1. What changed from v1

v1 read as a quiet instrument-grade site with a few extraordinary moments. v2
is **flatter, louder and more graphic**: hard-edged panels, one very large
type size doing most of the work, and colour used as whole fields rather than
as accents.

The through-line survives — a current runs through the brand, and it is drawn
literally as circuit traces that connect section to section. What changed is
that the traces are now the *only* ornament, and everything else got simpler.

---

## 2. Section order

| # | Section | Ground |
|---|---|---|
| 1 | Hero — scroll-scrubbed sequence | near-black `#050806` |
| 2 | Statement panel, inset 40px, radius 24 | brand blue `#0832B4` on black |
| 3 | **PixelDissolve** | black → `#F7F7F7` |
| 4 | Five services, numbered list, vector fan beneath | `#F7F7F7` |
| 5 | Marquee band | black, blue type |
| 6 | CloudLink — phone render, floating tags | black |
| 7 | **PixelDissolve**, overlapping | eats the plinth → white |
| 8 | Products — two renders joined by one circuit run | white |
| 9 | Stats — 2×2 cards | `#F0F2F5` cards on white |
| 10 | Projects — staggered map cards, horizontal rail | white |
| 11 | **PixelDissolve** | white → black |
| 12 | Closing CTA | black |
| 13 | Footer panel, same inset and radius as §2 | brand blue |

The page opens and closes on the same blue panel shape. That is the frame.

---

## 3. Measured geometry

- Panels (statement, footer): inset **40px**, radius **24px**
- Dissolve bands: **6 rows of 30px** on a **48-column** grid — 180px at 1440
- Nav: inset 40px, pill height **40px**, radius 10px, 6px gaps
- Two content measures: **80px** gutters (type-led) and **120px** (image-led)
- Buttons: radius **10px**, height 44px, label + small cyan wedge
- Cards: stat radius 20px, project radius 24px
- Type at 1440: display 88 · section heading 72 · service numeral 76 ·
  stat numeral 64 · sub-head 40 · card title 28 · body 16 · eyebrow 13

---

## 4. The line language

Every trace in the comp is **orthogonal with generously rounded corners**.
`lib/route.ts` generates them from waypoints so they can be authored and tuned
as coordinates rather than as unreadable path data.

Traces are drawn by scroll and then carry a travelling pulse. The fan under the
services list is generated rather than placed, so it can open outward from its
origin as the reader arrives.

The one raster exception is the burst art inside the stat cards — that is the
designer's own artwork, revealed by a radial mask rather than redrawn.

---

## 5. Open questions for Aldo

1. **Eyebrow contrast.** The comp's cyan is 2.5:1 on the light grounds. v2
   darkens it to `#00719A` (5.1:1) on white and grey only, via `.on-light`.
   Confirm, or say the graphic reading matters more than the AA line.
2. **The fourth project card** is cut off in the comp. v2 fills it with
   Kirkman's Kamp on the Sabi Sands map and the rail scrolls to it —
   confirm the project and the MWh figure.
3. **News** has a caret in the comp's nav but no sub-pages in the sitemap. v2
   renders it as a plain pill. Confirm whether News gets a dropdown.
4. The comp's copy differs in places from the v1 content (e.g. Low Voltage's
   body still references "the same template as the High Voltage page"). v2 uses
   corrected copy — see `v2/site/content/home.json`.
