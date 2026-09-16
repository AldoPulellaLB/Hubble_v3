# Product 3D Models

Drop-in replaceable GLB files for the interactive product viewer.
Each product page loads the file matching its slug. Replace the file, keep the name.

| File | Used on | Status |
|---|---|---|
| `hubble-residential.glb` | `/products/residential` | **Placeholder** — copy of `../Placeholder.glb` |
| `hubble-commercial.glb`  | `/products/commercial`  | **Placeholder** — copy of `../Placeholder.glb` |
| `hubble-cloudlink.glb`   | `/products/cloudlink`   | **Placeholder** — copy of `../Placeholder.glb` |

## Replacing a model

1. Export from your DCC as **glTF Binary (.glb)**, +Y up, metres, origin at the base centre.
2. Apply Draco or meshopt compression — target **under 8 MB** per model.
3. Bake or embed PBR textures at 2K max; single material set where possible.
4. Overwrite the file above with the same filename. No code change needed.
5. The viewer auto-fits the camera to the model bounds, so exact scale is forgiving —
   but keep the model centred on its own origin.

## Adding a new product

Add `hubble-<slug>.glb` here and set the matching slug in the CMS product entry.
