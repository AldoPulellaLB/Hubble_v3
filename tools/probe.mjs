import puppeteer from 'puppeteer-core'
const url = process.argv[2] || 'http://localhost:3210/products/high-voltage'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
})
const page = await browser.newPage()
const logs = []
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`.slice(0, 220)))
page.on('pageerror', (e) => logs.push(`pageerror: ${String(e).slice(0, 220)}`))
page.on('requestfailed', (r) => logs.push(`failed: ${r.url().slice(0, 120)} — ${r.failure()?.errorText}`))
page.on('response', (r) => { if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url().slice(0, 120)}`) })
await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))
await page.evaluate(() => { const l = window.__hubbleLenis; if (l) l.scrollTo(2400, { immediate: true }); else scrollTo(0, 2400) })
await new Promise((r) => setTimeout(r, 6000))
const state = await page.evaluate(() => ({
  canvases: document.querySelectorAll('canvas').length,
  loading: !!document.querySelector('[role=status]'),
  font: getComputedStyle(document.querySelector('h1') || document.body).fontFamily,
}))
console.log(JSON.stringify(state, null, 1))
console.log('--- logs ---')
console.log([...new Set(logs)].join('\n') || '(none)')
await browser.close()
