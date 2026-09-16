# Asset Inventory

Audited 2026-08-17.

## ✅ Have

### Brand
| Asset | Location | Notes |
|---|---|---|
| 10 logo SVGs | `Brand Assets/Logo/` | Logo Brand Dark/Light/blue, Brand Mark Dark/Light, App Icon Brand/Dark/Light, Logo Contracted, Logo Expanded. **Do not redraw.** |
| Sora | `Brand Assets/fonts/Sora/Sora/*.woff2` | Thin → ExtraBold, woff2 ready. Headings. |
| Montserrat | `Brand Assets/fonts/Montserrat/woff/*.woff2` | Thin → Black + italics, woff2 ready. Body. |
| Design system | `Brand Assets/Figma/Hubble.fig` + live Figma node `7:558` | Colour, type, buttons, shape, elevation, spacing, grid, motion — all read and transcribed into `design-direction.md` |

### Strategy
| Asset | Location |
|---|---|
| Brand strategy (66pp) | `Docs/Hubble Brand strategy.pdf` → distilled in `brand-strategy.md` |
| Site map | `Docs/Hubble Energy Site Map.pdf` → expanded in `sitemap.md` |

### 3D / sequence
| Asset | Location | Notes |
|---|---|---|
| Generic 3D placeholder | `3D Files/Placeholder.glb` | 1.7 MB |
| Product placeholders ×3 | `3D Files/Products/hubble-{residential,commercial,cloudlink}.glb` | Created from Placeholder.glb — drop-in replaceable, see README there |
| Hero sequence | `3D Files/Sequence/desktop/` + `mobile/` | 351 + 351 WebP frames, 19 MB total. **Placeholder — ON.energy artwork, must be replaced before launch** |

### Imagery
| Asset | Location | Notes |
|---|---|---|
| 64 placeholder images | `Placeholder Images/` | Procedurally generated in the Hubble design system — products, heroes, solutions, projects, industries, CloudLink, OG. Regenerate with `node tools/generate-placeholders.mjs`. All captioned as placeholders. |
| Generator | `tools/generate-placeholders.mjs` | SVG → WebP via sharp. Edit the manifest arrays to add slots. |

---

## ❌ Missing / blocked

| Gap | Impact | What's needed |
|---|---|---|
| ~~Product documentation~~ | **RESOLVED 2026-08-17.** `Docs/Products/` supplied (AM+ Series, AM16+, Energy Cube brochures + Lodge Showcase) and the live site scraped. Full catalogue, specs, copy, app-store links and 6 case studies captured in [`products.md`](products.md). | — |
| **Design brief** | Medium. `Docs/~$ble Energy Design Brief.docx` is a 162-byte Word **lock file** — the actual `.docx` isn't in the folder. | The real `Hubble Energy Design Brief.docx` |
| **Site map page 1** | Low. The supplied PDF is labelled "Page 2 of 2"; page 1 wasn't included. | Page 1, if it contains anything beyond a cover |
| **Photography / imagery** | **Placeholders generated 2026-08-17.** 64 on-brand procedural placeholders now cover every image slot — see `Placeholder Images/`. Real photography still needed for launch: product shots for all 15 models, installation photography for the 6 case studies, team and site imagery, CloudLink app screenshots. | An image library — drop files at the same paths to replace |
| ~~Case studies~~ | **RESOLVED.** 6 captured from the Lodge Showcase and the C&I page: Cerebos Salt, MalaMala, The Outpost, Rattray's, Kirkman's Kamp, Mpumalanga lodge. | Hero imagery for each |
| **CloudLink app assets** | Medium. **Store URLs found** (owner app + installer app, iOS + Android — see `products.md` §3.3). Still needs app screenshots and store badge SVGs. | |
| **HV280Ah (Rack) spec** | Low. The one indoor HV model with no captured data. | Data sheet |
| **CloudLink compatibility matrix** | Low. The live-site table is partially collapsed — Phocos/Kodak/Synapse/Mecer/Sunsynk/Deye rows incomplete. | Current CloudLink brochure |
| **Real 3D product models** | Expected. Placeholders in place; the brief says these arrive later. | GLB per product — see `3D Files/Products/README.md` |
| **Hubble hero sequence render** | Expected. Placeholder in place. | See `3D Files/Sequence/README.md` for specs |
| **ROI calculator logic** | Medium. Nav-level item; needs tariff assumptions, system sizing model, payback formula. | The commercial model behind "Calculate your savings" |

---

## ⚠️ Discrepancies found in the design system

Documented in `design-direction.md` §2.4. Summary:

1. Type page CSS stacks say **Inter / Segoe UI**; the variables and shipped fonts are **Sora /
   Montserrat**. Treated as stale placeholder text.
2. An **orange** accent (`--brand-orange`, `--logo-accent-dot: #F58B1D`) is referenced by the
   button system and logo rules, but **no orange exists in the palette and no supplied logo
   contains an orange dot**. Several descriptions on the page still say "Unisure Group". Treated
   as leftovers; **Green `#CAD900`** takes the accent role.
3. Logo page gives `--brand-blue: #2163E5`, not present in the variable set. Using **`#0832B4`**
   (Blue/700 — the value in the logo SVGs).

---

## Legal note on the placeholder sequence

The 702 frames in `3D Files/Sequence/` are ON.energy's rendered artwork, downloaded at the client's
explicit instruction as a development placeholder so the scroll mechanic could be built against
real cinematic material. They are **not licensed for Hubble's use** and must be swapped for
Hubble's own render before the site is deployed to any public URL. A README in that folder repeats
this warning.
