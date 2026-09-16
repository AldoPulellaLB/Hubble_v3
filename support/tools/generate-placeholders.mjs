/**
 * Hubble 2026 — placeholder image generator
 * ------------------------------------------------------------------
 * Renders on-brand placeholder imagery for every image slot in the site.
 * Three visual families, drawn from the project references:
 *
 *   studio  — near-black product plate, floor pool of light   (on.energy)
 *   field   — flat brand-blue field with flow lines + pulse   (cantor8.io)
 *   data    — dark data surface, CloudLink UI                 (Hubble CloudLink)
 *
 * Output: WebP into ../Placeholder Images/
 * Run:    node tools/generate-placeholders.mjs
 */

import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'Placeholder Images')

/* ── Brand tokens ─────────────────────────────────────────────── */
const C = {
  blue700: '#0832B4', blue500: '#1748DF', blue400: '#3164FF', blue300: '#E1E9FF',
  cyan700: '#00ABE6', cyan500: '#66D7FF', cyan400: '#CEF2FF',
  green700: '#CAD900',
  n900: '#0D1421', n800: '#1A2232', n700: '#2D3748', n600: '#4D5563',
  n500: '#717B8A', n400: '#A0A8B4', n300: '#CDD2DB', n100: '#F0F2F5', white: '#FFFFFF',
}

/* ── Shared defs ──────────────────────────────────────────────── */
const defs = (w, h, seed = 3) => `
<defs>
  <radialGradient id="pool" cx="50%" cy="72%" r="62%">
    <stop offset="0"   stop-color="${C.n300}" stop-opacity=".26"/>
    <stop offset=".45" stop-color="${C.n600}" stop-opacity=".10"/>
    <stop offset="1"   stop-color="${C.n900}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="rim" cx="50%" cy="18%" r="70%">
    <stop offset="0" stop-color="${C.cyan500}" stop-opacity=".13"/>
    <stop offset="1" stop-color="${C.n900}"    stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="face" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0"   stop-color="#8E97A6"/>
    <stop offset=".42" stop-color="#5E6877"/>
    <stop offset="1"   stop-color="#333B49"/>
  </linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0"   stop-color="#B7BEC9"/>
    <stop offset="1"   stop-color="#77808F"/>
  </linearGradient>
  <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0"   stop-color="#3B4453"/>
    <stop offset="1"   stop-color="#1E2632"/>
  </linearGradient>
  <linearGradient id="led" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0"   stop-color="${C.blue400}"/>
    <stop offset=".55" stop-color="${C.cyan500}"/>
    <stop offset="1"   stop-color="${C.cyan400}"/>
  </linearGradient>
  <linearGradient id="fieldFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".05"/>
    <stop offset="1" stop-color="#000000" stop-opacity=".18"/>
  </linearGradient>
  <linearGradient id="pulse" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0"   stop-color="${C.cyan500}" stop-opacity="0"/>
    <stop offset=".5"  stop-color="${C.cyan400}" stop-opacity=".95"/>
    <stop offset="1"   stop-color="${C.cyan500}" stop-opacity="0"/>
  </linearGradient>
  <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="${Math.round(w / 90)}"/>
  </filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="${Math.round(w / 220)}"/>
  </filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
</defs>`

const grain = (w, h, o = 0.05) =>
  `<rect width="${w}" height="${h}" filter="url(#grain)" opacity="${o}" style="mix-blend-mode:overlay"/>`

/* Mono caption, bottom-left — makes it unmistakably a placeholder */
const caption = (w, h, label, sub, ink = C.n400) => {
  const p = Math.round(w * 0.045)
  const fs = Math.max(11, Math.round(w * 0.0125))
  return `
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="${ink}">
    <text x="${p}" y="${h - p - fs * 1.5}" font-size="${fs}" letter-spacing="${fs * 0.09}" opacity=".9">${esc(label)}</text>
    <text x="${p}" y="${h - p}"            font-size="${fs}" letter-spacing="${fs * 0.09}" opacity=".45">${esc(sub)}</text>
  </g>`
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* ── Isometric product form ───────────────────────────────────── */
/**
 * shape: brick | wall | blade | rack | tower | cabinet | container
 * Returns an SVG group drawn into a box centred on (cx, cy) with scale s.
 */
// proportions per archetype: [width, height, depth] in arbitrary units
const PROPS = {
  brick:     [1.55, 1.00, 0.95],
  wall:      [1.10, 1.45, 0.50],
  blade:     [2.35, 0.62, 0.42],
  rack:      [2.20, 0.55, 1.15],
  tower:     [1.05, 2.05, 0.62],
  cabinet:   [1.35, 1.90, 1.05],
  container: [4.20, 1.05, 0.95],
}

/** y of the object's footprint — where it meets the floor */
const footY = (shape, cy, s) => {
  const [, uh, ud] = PROPS[shape] || PROPS.wall
  return cy + (uh * s + ud * s * 0.30) / 2
}

function form(shape, cx, cy, s) {
  const [uw, uh, ud] = PROPS[shape] || PROPS.wall
  const w = uw * s, h = uh * s
  const dx = ud * s * 0.52, dy = ud * s * 0.30

  const x = cx - (w + dx) / 2
  const y = cy - (h - dy) / 2

  const top = `${x},${y} ${x + w},${y} ${x + w + dx},${y - dy} ${x + dx},${y - dy}`
  const sideP = `${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y + h - dy} ${x + w},${y + h}`

  // face detailing per archetype
  const det = []
  const line = (x1, y1, x2, y2, o = 0.35, sw = 1) =>
    det.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0C1119" stroke-opacity="${o}" stroke-width="${sw}"/>`)

  if (shape === 'container' || shape === 'rack') {
    const n = shape === 'container' ? 7 : 5
    for (let i = 1; i < n; i++) line(x + (w * i) / n, y + h * 0.06, x + (w * i) / n, y + h * 0.94, 0.4, Math.max(1, s * 0.006))
  }
  if (shape === 'tower' || shape === 'cabinet') {
    for (let i = 1; i < 4; i++) line(x + w * 0.08, y + (h * i) / 4, x + w * 0.92, y + (h * i) / 4, 0.32, Math.max(1, s * 0.005))
  }
  if (shape === 'wall' || shape === 'brick') {
    line(x + w * 0.1, y + h * 0.72, x + w * 0.9, y + h * 0.72, 0.3, Math.max(1, s * 0.005))
  }

  // corner fixings — small specular dots that sell the scale
  for (const [fx, fy] of [[0.045, 0.06], [0.955, 0.06], [0.045, 0.94], [0.955, 0.94]]) {
    det.push(`<circle cx="${x + w * fx}" cy="${y + h * fy}" r="${Math.max(1, s * 0.008)}" fill="#D7DDE6" opacity=".28"/>`)
  }

  // vent louvres
  const vents = []
  const vn = shape === 'blade' ? 0 : 9
  const vertical = shape === 'container' || shape === 'rack'
  const vx = vertical ? x + w * 0.035 : x + w * 0.09
  const vw = vertical ? w * 0.055 : w * 0.16
  const vy = y + h * 0.14, vh = h * 0.66
  for (let i = 0; i < vn; i++) {
    const yy = vy + (vh * i) / vn
    vents.push(`<rect x="${vx}" y="${yy}" width="${vw}" height="${Math.max(1, (vh / vn) * 0.42)}" fill="#0B1018" opacity=".55" rx="${s * 0.004}"/>`)
  }

  // LED status strip — the Hubble signal
  const ledW = shape === 'blade' ? w * 0.74 : w * 0.5
  const ledH = Math.max(2, h * 0.035)
  const ledX = x + (w - ledW) / 2
  const ledY = shape === 'blade' ? y + h * 0.42 : y + h * 0.82

  return `
  <g>
    <ellipse cx="${cx}" cy="${y + h + s * 0.03}" rx="${w * 0.78}" ry="${s * 0.075}" fill="#000" opacity=".45" filter="url(#glow)"/>
    <polygon points="${sideP}" fill="url(#side)"/>
    <polygon points="${top}"   fill="url(#top)" opacity=".92"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#face)" rx="${s * 0.018}"/>
    ${vents.join('')}
    ${det.join('')}
    <rect x="${ledX}" y="${ledY}" width="${ledW}" height="${ledH}" rx="${ledH / 2}" fill="url(#led)" opacity=".95"/>
    <rect x="${ledX}" y="${ledY}" width="${ledW}" height="${ledH}" rx="${ledH / 2}" fill="url(#led)" filter="url(#glow)" opacity=".55"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" rx="${s * 0.018}"
          stroke="#C6CEDA" stroke-opacity=".30" stroke-width="${Math.max(1, s * 0.004)}"/>
    <line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y - dy}" stroke="#C6CEDA" stroke-opacity=".22" stroke-width="${Math.max(1, s * 0.004)}"/>
  </g>`
}

/* ── Family A — studio product plate ──────────────────────────── */
function studio({ w, h, shape, label, sub, seed = 3 }) {
  const s = Math.min(w, h) * (shape === 'container' ? 0.26 : shape === 'rack' ? 0.34 : 0.42)
  const cy = h * 0.50
  const floor = footY(shape, cy, s)
  const body = form(shape, w / 2, cy, s)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(w, h, seed)}
  <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0"   stop-color="#fff" stop-opacity=".40"/>
    <stop offset=".55" stop-color="#fff" stop-opacity=".08"/>
    <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="reflMask">
    <rect x="0" y="${floor}" width="${w}" height="${h - floor}" fill="url(#reflFade)"/>
  </mask>
  <rect width="${w}" height="${h}" fill="${C.n900}"/>
  <rect width="${w}" height="${h}" fill="url(#rim)"/>
  <ellipse cx="${w / 2}" cy="${floor + h * 0.10}" rx="${w * 0.66}" ry="${h * 0.30}" fill="url(#pool)"/>
  <g mask="url(#reflMask)" opacity=".30" transform="translate(0 ${(2 * floor).toFixed(2)}) scale(1 -1)"
     filter="url(#soft)">${body}</g>
  ${body}
  <rect width="${w}" height="${h}" fill="url(#fieldFade)"/>
  ${grain(w, h, 0.06)}
  ${caption(w, h, label, sub, C.n400)}
</svg>`
}

/* ── Family B — brand-blue field with flow lines ──────────────── */
/**
 * Orthogonal circuit routing that bleeds off both edges — cantor8's `c8-flow-line`.
 * Returns { d, joints } so callers can drop node dots on real corners.
 */
function flowPath(w, h, yStart, rnd) {
  const r = Math.round(w * 0.014)
  const n = 3 + Math.floor(rnd() * 3)
  const joints = []
  let d = `M ${-w * 0.08} ${yStart}`
  let cy = yStart
  let x = w * (0.08 + rnd() * 0.10)

  for (let i = 0; i < n; i++) {
    const rise = h * (0.06 + rnd() * 0.13) * (rnd() > 0.45 ? -1 : 1)
    let ny = cy + rise
    ny = Math.max(h * 0.06, Math.min(h * 0.94, ny))
    if (Math.abs(ny - cy) < r * 2.4) ny = cy + (rise > 0 ? r * 2.4 : -r * 2.4)
    const dir = ny > cy ? 1 : -1
    d += ` H ${(x - r).toFixed(1)} Q ${x.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${(cy + dir * r).toFixed(1)}` +
         ` V ${(ny - dir * r).toFixed(1)} Q ${x.toFixed(1)} ${ny.toFixed(1)} ${(x + r).toFixed(1)} ${ny.toFixed(1)}`
    joints.push([x, ny])
    cy = ny
    x += w * (0.13 + rnd() * 0.16)
    if (x > w * 0.94) break
  }
  d += ` H ${w * 1.08}`
  return { d, joints }
}

function field({ w, h, label, sub, seed = 5, ink = C.blue700 }) {
  const rnd = mulberry(seed * 977 + 13)
  const sw = Math.max(1, w * 0.0009)
  const offset = Math.round(h * 0.019)
  const allJoints = []

  const lines = [0.20, 0.46, 0.72].map((base, i) => {
    const { d, joints } = flowPath(w, h, h * (base + (rnd() - 0.5) * 0.06), rnd)
    allJoints.push(...joints.filter(() => rnd() > 0.45))
    return `
    <path d="${d}" fill="none" stroke="${C.white}" stroke-opacity=".32" stroke-width="${sw}"/>
    <path d="${d}" fill="none" stroke="${C.white}" stroke-opacity=".13" stroke-width="${sw}"
          transform="translate(0 ${offset})"/>
    <path d="${d}" fill="none" stroke="url(#pulse)" stroke-width="${sw * 2.6}"
          stroke-dasharray="${w * 0.13} ${w * 4}" stroke-dashoffset="${-w * (0.10 + i * 0.26)}" filter="url(#soft)"/>`
  }).join('')

  const nodes = allJoints.slice(0, 4).map(([nx, ny]) =>
    `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${w * 0.0045}" fill="${C.cyan400}" opacity=".92"/>
     <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${w * 0.015}" fill="${C.cyan500}" opacity=".24" filter="url(#soft)"/>`
  ).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(w, h, seed)}
  <rect width="${w}" height="${h}" fill="${ink}"/>
  ${lines}
  ${nodes}
  <rect width="${w}" height="${h}" fill="url(#fieldFade)"/>
  ${grain(w, h, 0.045)}
  ${caption(w, h, label, sub, C.blue300)}
</svg>`
}

/* ── Family C — CloudLink data surface ────────────────────────── */
function data({ w, h, label, sub, seed = 7, device = false }) {
  const pad = w * 0.09
  const cw = w - pad * 2
  const gy = h * 0.30
  const gh = h * 0.34

  // grid
  let grid = ''
  for (let i = 0; i <= 6; i++) {
    const yy = gy + (gh * i) / 6
    grid += `<line x1="${pad}" y1="${yy}" x2="${pad + cw}" y2="${yy}" stroke="${C.n700}" stroke-opacity=".7" stroke-width="1"/>`
  }
  for (let i = 0; i <= 8; i++) {
    const xx = pad + (cw * i) / 8
    grid += `<line x1="${xx}" y1="${gy}" x2="${xx}" y2="${gy + gh}" stroke="${C.n700}" stroke-opacity=".45" stroke-width="1"/>`
  }

  // two series — a smooth "generation" curve and a stepped "load" curve
  const rnd = mulberry(seed)
  const pts = 26
  const seriesA = [], seriesB = []
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1)
    const bell = Math.exp(-Math.pow((t - 0.52) * 2.7, 2))
    seriesA.push([pad + cw * t, gy + gh - gh * (bell * 0.86 + rnd() * 0.05)])
    seriesB.push([pad + cw * t, gy + gh - gh * (0.28 + Math.sin(t * 7) * 0.09 + rnd() * 0.07)])
  }
  const dA = seriesA.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const dB = seriesB.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const areaA = `${dA} L ${pad + cw} ${gy + gh} L ${pad} ${gy + gh} Z`

  // stat tiles
  const tiles = ['STATE OF CHARGE', 'LOAD', 'SOLAR YIELD', 'SITES ONLINE']
  const vals = ['86%', '12.4 kW', '41.2 kWh', '128']
  const tw = cw / 4
  const ty = h * 0.74
  const tileFs = Math.max(9, w * 0.0105)
  const valFs = Math.max(14, w * 0.021)
  const tileSvg = tiles.map((t, i) => `
    <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace">
      <line x1="${pad + tw * i}" y1="${ty - h * 0.045}" x2="${pad + tw * i}" y2="${ty + h * 0.03}" stroke="${C.n700}" stroke-width="1"/>
      <text x="${pad + tw * i + w * 0.016}" y="${ty - h * 0.018}" font-size="${tileFs}" fill="${C.n500}" letter-spacing="${tileFs * 0.12}">${t}</text>
      <text x="${pad + tw * i + w * 0.016}" y="${ty + h * 0.022}" font-size="${valFs}" fill="${C.white}">${vals[i]}</text>
    </g>`).join('')

  const frame = device ? `
    <rect x="${w * 0.055}" y="${h * 0.04}" width="${w * 0.89}" height="${h * 0.92}" rx="${w * 0.06}"
          fill="none" stroke="${C.n700}" stroke-width="${Math.max(2, w * 0.004)}"/>
    <rect x="${w * 0.40}" y="${h * 0.062}" width="${w * 0.20}" height="${h * 0.012}" rx="${h * 0.006}" fill="${C.n700}"/>` : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(w, h, seed)}
  <rect width="${w}" height="${h}" fill="${C.n900}"/>
  <rect width="${w}" height="${h}" fill="url(#rim)"/>
  ${frame}
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace">
    <text x="${pad}" y="${h * 0.16}" font-size="${Math.max(10, w * 0.012)}" fill="${C.cyan500}" letter-spacing="${w * 0.0016}">CLOUDLINK</text>
    <text x="${pad}" y="${h * 0.225}" font-size="${Math.max(16, w * 0.028)}" fill="${C.white}">Power flow</text>
  </g>
  ${grid}
  <path d="${areaA}" fill="${C.blue500}" opacity=".22"/>
  <path d="${dA}" fill="none" stroke="${C.cyan500}" stroke-width="${Math.max(2, w * 0.0035)}" stroke-linejoin="round"/>
  <path d="${dB}" fill="none" stroke="${C.green700}" stroke-width="${Math.max(1.5, w * 0.0022)}" stroke-dasharray="${w * 0.012} ${w * 0.010}"/>
  ${tileSvg}
  ${grain(w, h, 0.05)}
  ${caption(w, h, label, sub, C.n500)}
</svg>`
}

function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── Manifest ─────────────────────────────────────────────────── */
const LV = [
  ['s-100a',  'S-100A',  'brick', '1.2 kWh · 12.8V'],
  ['x-101',   'X-101',   'rack',  '5.5 kWh · 48V'],
  ['am2-plus','AM2+',    'wall',  '5.5 kWh · 48V'],
  ['am4',     'AM4',     'wall',  '2.56 kWh · 25.6V'],
  ['am5-plus','AM5+',    'wall',  '5.12 kWh · 51.2V'],
  ['am10-plus','AM10+',  'wall',  '10 kWh · 51.2V'],
  ['am16-plus','AM16+',  'tower', '16.1 kWh · 51.2V'],
  ['blade',   'Blade',   'blade', '7 kWh / 10 kW · 51.2V'],
]

const HV = [
  ['hv100ah-rack',  'HV100Ah Rack',  'rack',      '20.4–76.8 kWh · 204–768V'],
  ['hv100ah-stack', 'HV100Ah Stack', 'tower',     '30.7–81.9 kWh · 307–819V'],
  ['hv280ah-rack',  'HV280Ah Rack',  'rack',      'High Voltage'],
  ['hv314ah-rack',  'HV-768-241',    'cabinet',   '241 kWh · 768V'],
  ['energy-cube',   'Energy Cube',   'cabinet',   '50–125 kW · 143–261 kWh'],
  ['energy-block',  'Energy Block',  'container', '150–1000 kW · 241–2410 kWh'],
  ['energy-container','Energy Container','container','500 kW · 482 kWh–6.25 MWh'],
]

const PROJECTS = [
  ['cerebos-salt',    'Cerebos Salt',        '2.211 MWh · Manufacturing'],
  ['malamala',        'MalaMala Game Reserve','860 kWh · Hospitality'],
  ['the-outpost',     'The Outpost, Kruger', '256 kWh · Off-grid lodge'],
  ['rattrays',        "Rattray's on MalaMala",'204 kWh · Hospitality'],
  ['kirkmans-kamp',   "Kirkman's Kamp",      '860 kWh · Hospitality'],
  ['mpumalanga-lodge','Mpumalanga Lodge',    '860 kWh · Backup + savings'],
]

const INDUSTRIES = [
  ['commercial-industrial', 'Commercial & Industrial'],
  ['agriculture',           'Agriculture'],
  ['lodges',                'Lodges & Hospitality'],
  ['manufacturing',         'Manufacturing'],
  ['telecom',               'Telecom'],
  ['microgrid',             'Microgrid'],
]

/* ── Render ───────────────────────────────────────────────────── */
async function emit(rel, svg, { width }) {
  const abs = join(OUT, rel)
  await mkdir(dirname(abs), { recursive: true })
  await sharp(Buffer.from(svg), { density: 96 })
    .resize({ width, withoutEnlargement: false })
    .webp({ quality: 82 })
    .toFile(abs)
  return rel
}

const made = []
const push = async (rel, svg, w) => { made.push(await emit(rel, svg, { width: w })) }

async function run() {
  let seed = 2

  /* Product plates — 4:3 detail + 1:1 card */
  for (const [slug, name, shape, spec] of LV) {
    await push(`products/low-voltage/${slug}.webp`,
      studio({ w: 1600, h: 1200, shape, label: `LOW VOLTAGE / ${name.toUpperCase()}`, sub: `${spec} — placeholder`, seed: seed++ }), 1600)
    await push(`products/low-voltage/${slug}-card.webp`,
      studio({ w: 1200, h: 1200, shape, label: name.toUpperCase(), sub: 'placeholder', seed: seed++ }), 1200)
  }
  for (const [slug, name, shape, spec] of HV) {
    await push(`products/high-voltage/${slug}.webp`,
      studio({ w: 1600, h: 1200, shape, label: `HIGH VOLTAGE / ${name.toUpperCase()}`, sub: `${spec} — placeholder`, seed: seed++ }), 1600)
    await push(`products/high-voltage/${slug}-card.webp`,
      studio({ w: 1200, h: 1200, shape, label: name.toUpperCase(), sub: 'placeholder', seed: seed++ }), 1200)
  }

  /* Category + hero wides */
  await push('hero/home-hero.webp',
    studio({ w: 2400, h: 1350, shape: 'container', label: 'HOME / HERO', sub: 'Power keeps life in motion — placeholder', seed: seed++ }), 2400)
  await push('hero/low-voltage.webp',
    studio({ w: 2400, h: 1350, shape: 'blade', label: 'LOW VOLTAGE / HERO', sub: 'Intelligent energy for everyday life — placeholder', seed: seed++ }), 2400)
  await push('hero/high-voltage.webp',
    studio({ w: 2400, h: 1350, shape: 'cabinet', label: 'HIGH VOLTAGE / HERO', sub: 'Intelligent energy for sustained performance — placeholder', seed: seed++ }), 2400)
  await push('hero/solutions.webp',
    field({ w: 2400, h: 1350, label: 'SOLUTIONS / HERO', sub: 'Five ways we put intelligent energy to work — placeholder', seed: seed++ }), 2400)
  await push('hero/about.webp',
    field({ w: 2400, h: 1350, label: 'ABOUT / HERO', sub: 'Intelligent energy, always at work — placeholder', seed: seed++, ink: C.n900 }), 2400)
  await push('hero/partners.webp',
    field({ w: 2400, h: 1350, label: 'PARTNERS / HERO', sub: 'placeholder', seed: seed++ }), 2400)

  /* Solution offers 01–05 */
  const OFFERS = [
    ['01-energy-solutions', 'Energy Solutions', 'Built around your business'],
    ['02-energy-arbitrage', 'Energy Arbitrage', 'Make timing work harder'],
    ['03-wheeling',         'Wheeling',         'Power where business happens'],
    ['04-ppa',              'Power Purchase Agreements', 'Secure energy. Preserve capital'],
    ['05-sla',              'Service Level Agreements',  'Performance that keeps delivering'],
  ]
  for (const [slug, name, line] of OFFERS) {
    await push(`solutions/${slug}.webp`,
      field({ w: 1600, h: 1066, label: name.toUpperCase(), sub: `${line} — placeholder`, seed: seed++ }), 1600)
  }

  /* Case studies */
  for (const [slug, name, meta] of PROJECTS) {
    await push(`projects/${slug}.webp`,
      studio({ w: 1600, h: 1066, shape: 'container', label: name.toUpperCase(), sub: `${meta} — placeholder`, seed: seed++ }), 1600)
  }

  /* Industries */
  for (const [slug, name] of INDUSTRIES) {
    await push(`industries/${slug}.webp`,
      field({ w: 1400, h: 1050, label: name.toUpperCase(), sub: 'placeholder', seed: seed++, ink: seed % 2 ? C.blue700 : C.n900 }), 1400)
  }

  /* CloudLink */
  await push('cloudlink/dashboard.webp',
    data({ w: 2400, h: 1350, label: 'CLOUDLINK / DASHBOARD', sub: 'placeholder', seed: seed++ }), 2400)
  await push('cloudlink/app-owner.webp',
    data({ w: 1200, h: 1600, label: 'CLOUDLINK APP / OWNER', sub: 'placeholder', seed: seed++, device: true }), 1200)
  await push('cloudlink/app-installer.webp',
    data({ w: 1200, h: 1600, label: 'CLOUDLINK APP / INSTALLER', sub: 'placeholder', seed: seed++, device: true }), 1200)
  await push('cloudlink/fleet.webp',
    data({ w: 1600, h: 1066, label: 'CLOUDLINK / FLEET', sub: 'Multi-site, any brand, any age — placeholder', seed: seed++ }), 1600)
  await push('cloudlink/device.webp',
    studio({ w: 1600, h: 1200, shape: 'brick', label: 'CLOUDLINK / DEVICE', sub: 'placeholder', seed: seed++ }), 1600)

  /* Open Graph */
  const OG = [
    ['home', 'Hubble Energy'], ['solutions', 'Solutions'], ['products', 'Products'],
    ['cloudlink', 'CloudLink'], ['projects', 'Projects'], ['about', 'About'],
  ]
  for (const [slug, name] of OG) {
    await push(`og/${slug}.webp`,
      field({ w: 1200, h: 630, label: `OG / ${name.toUpperCase()}`, sub: 'We put intelligent energy to work — placeholder', seed: seed++ }), 1200)
  }

  /* Manifest */
  await writeFile(join(OUT, 'manifest.json'), JSON.stringify({
    generated: 'run `node tools/generate-placeholders.mjs` to regenerate',
    count: made.length,
    files: made.sort(),
  }, null, 2))

  console.log(`✓ ${made.length} placeholder images → Placeholder Images/`)
}

run().catch((e) => { console.error(e); process.exit(1) })
