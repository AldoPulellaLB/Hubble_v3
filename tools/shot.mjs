/**
 * Deterministic screenshots of the local dev site.
 *   node tools/shot.mjs <name> <url> [scrollY] [width] [height]
 */
import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'

const [, , name = 'shot', url = 'http://localhost:3210/', y = '0', w = '1440', h = '900'] = process.argv
const OUT = '/private/tmp/claude-501/-Users-aldo-Documents-Claude-Hubble-2026/a1b4f983-be0c-4a97-833e-c5f278da3e58/scratchpad/shots'
await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2500))

if (+y > 0) {
  await page.evaluate((yy) => {
    const l = window.__hubbleLenis
    if (l) l.scrollTo(yy, { immediate: true })
    else window.scrollTo(0, yy)
  }, +y)
  await new Promise((r) => setTimeout(r, 2200))
}

const file = `${OUT}/${name}.png`
await page.screenshot({ path: file })
console.log(file)
await browser.close()
