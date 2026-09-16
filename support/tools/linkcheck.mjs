import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:3210/', { waitUntil: 'domcontentloaded', timeout: 60000 })
const hrefs = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))])
const results = []
for (const h of hrefs) {
  const url = 'http://localhost:3210' + h.split('?')[0]
  const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  results.push(`${r.status()}  ${h}`)
}
console.log(results.sort().join('\n'))
console.log('\nbad:', results.filter((r) => !r.startsWith('200')).length, '/', results.length)
await browser.close()
