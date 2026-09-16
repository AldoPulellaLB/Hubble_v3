# Project Decisions

Locked 2026-08-17.

| # | Decision | Choice |
|---|---|---|
| 01 | **Stack** | **Next.js** (App Router) + GSAP 3 + ScrollTrigger + Lenis. Three.js / R3F for the product viewer. |
| 02 | **CMS** | **Self-hosted `/admin`** with password login, writing to **flat JSON/MD content files** in the repo. Images to a managed uploads folder. No third-party service. Admin UI built in the Hubble design system. |
| 03 | **First delivery** | **Vertical slice** — design system + nav + footer + full home page (scrubbed sequence hero, flow lines, pixel dissolves, CloudLink app block) + one product page with the 3D viewer. Every signature mechanic proven before scaling to the full route map. |
| 04 | **Navigation** | **5 segments + utility.** Bar: `Solutions · Products · Projects · Partners · About`. Right-hand accent CTA: **"Calculate your savings"**. Learn and News move under About and into the footer. |

## Consequences

- **Next.js + flat-file CMS** → content read at build/request time from `content/*.json`; `/admin`
  is a route group with server actions writing back to disk. Needs a Node runtime at deploy
  (not static export). Revalidation on save.
- **Vertical slice** → the home page and one product page are the acceptance surface. Remaining
  routes get stubbed so the nav resolves.
- **Nav consolidation** → `sitemap.md`'s full IA is preserved; only the *primary bar* is
  consolidated. Every sitemap node still has a route.

## Build notes (added 2026-08-17, after the slice was built)

Two Next.js traps cost real time — both documented in `site/README.md`:

1. **Never add `gsap` / `three` to `experimental.optimizePackageImports`.** Removed.
2. **`Footer` must be a client component.** Rendered as a Server Component from the
   `(site)` layout it deadlocks the dev server's RSC render — every route hangs with
   zero bytes for 60s while `next build` and `next start` work perfectly. Making it
   a client component fixes it at no cost.
3. **Components import content types from `@/lib/types`, never `@/lib/content`** —
   the latter pulls `node:fs` into the component graph.
4. Stop the dev server before `next build`; the build wipes `.next` and leaves a
   running dev server serving 404s for its own chunks.

## Carried forward from the design system

- Brand blue = **`#0832B4`** (not the `#2163E5` on the Figma logo page).
- Accent role = **Green `#CAD900`** (the orange Accent variant is a leftover from another brand).
- Fonts = **Sora / Montserrat** (Inter / Segoe UI in the Figma stack strings are stale).
- Default easing = `cubic-bezier(0.16, 1, 0.3, 1)`.
