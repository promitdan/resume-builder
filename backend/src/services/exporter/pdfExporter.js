const puppeteer = require('puppeteer')
const { renderToHtml } = require('../renderer/htmlRenderer')

async function exportToPdf(content, templateId) {
  const html = renderToHtml(content, templateId)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.25in', right: '0', bottom: '0.25in', left: '0' }
    })
    return pdf
  } finally {
    await browser.close()
  }
}

module.exports = { exportToPdf }
