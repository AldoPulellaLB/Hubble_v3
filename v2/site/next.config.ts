import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/webp'] },

  /* A production build writes over `.next`. Run one while `next dev` is live
     and the dev server's own chunks vanish — the page then serves HTML that
     404s on main-app.js, so nothing hydrates and the site renders as unstyled,
     inert markup. `npm run check` sets this to build somewhere else. */
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Note: do NOT add gsap/three to experimental.optimizePackageImports —
  // it deadlocks the dev server's RSC render for any route importing them.
}

export default config
