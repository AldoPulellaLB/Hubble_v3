# Retired: the "five ways" services list

The home page's `services` block, as it stood until 2026-09-14. It rendered
through `src/components/sections/Services.tsx` — five rows, each a link to a
`/solutions/*` route — and was replaced by `HowWeWork.tsx` ("How we put
intelligent energy to work": *Our process* + *Your options*, Figma `1797:618`
and `1797:684`) at Aldo's request.

`services.json` here is the exact block that was removed from
`v2/site/content/home.json`. Nothing reads it; it is kept only because the repo
has no version control, so this file is the only copy of that copy.

The five solutions it linked are still reachable from the Solutions mega-panel
in the nav and from the `/solutions/*` routes themselves.

`Services.tsx` and `Services.module.css` are still in the tree and nothing
imports them — dead code, kept for the same reason. Safe to delete on request.
