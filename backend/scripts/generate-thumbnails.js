// Run from the backend directory: node scripts/generate-thumbnails.js
// Requires the frontend dev server running at http://localhost:5173

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const TEMPLATE_IDS = [
  'classic-traditional', 'classic-academic', 'classic-formal',
  'modern', 'modern-sidebar', 'modern-banner', 'modern-split',
  'minimal', 'minimal-columns', 'minimal-boxed', 'minimal-serif',
  'executive', 'executive-band', 'executive-sidebar',
  'creative', 'creative-star', 'creative-minimal',
]

const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/thumbnails')
const BASE_URL   = 'http://localhost:5173'
const PAGE_W     = Math.round(8.5 * 96)  // 816px
const PAGE_H     = Math.round(11  * 96)  // 1056px

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const browser = await puppeteer.launch({ headless: 'new' })
  const page    = await browser.newPage()
  await page.setViewport({ width: PAGE_W, height: PAGE_H, deviceScaleFactor: 1 })

  for (const id of TEMPLATE_IDS) {
    process.stdout.write(`Generating ${id} ... `)
    await page.goto(`${BASE_URL}/thumbnail/${id}`, { waitUntil: 'networkidle0' })
    // Extra wait for web fonts
    await new Promise(r => setTimeout(r, 600))

    const buf = await page.screenshot({
      type: 'webp',
      quality: 85,
      clip: { x: 0, y: 0, width: PAGE_W, height: PAGE_H },
    })

    fs.writeFileSync(path.join(OUTPUT_DIR, `${id}.webp`), buf)
    console.log('done')
  }

  await browser.close()
  console.log(`\nAll thumbnails saved to ${OUTPUT_DIR}`)
}

main().catch(err => { console.error(err); process.exit(1) })
