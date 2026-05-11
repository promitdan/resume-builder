# PDF Capture Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the exported PDF match the browser preview exactly by serializing the already-rendered preview pages from the DOM and sending that HTML to Puppeteer instead of re-rendering server-side.

**Architecture:** The frontend queries `[data-page-card]` elements after page-splitting is complete, clones them into a self-contained HTML document (fonts + print CSS + page-break directives), and POSTs that HTML to the backend. The backend feeds it directly to Puppeteer which converts it to PDF — no page-splitting logic runs server-side.

**Tech Stack:** React (frontend), Puppeteer (backend), Express, Node.js

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `frontend/src/components/preview/ResumePreview.jsx` | Add `data-page-card` attribute to page card divs |
| Create | `frontend/src/utils/capturePreview.js` | Serialize rendered page cards into a print-ready HTML string |
| Modify | `frontend/src/components/shared/DownloadButtons.jsx` | Use `capturePreviewHtml()` for PDF downloads |
| Modify | `backend/src/services/exporter/pdfExporter.js` | Add `exportHtmlToPdf(html)` function |
| Modify | `backend/src/routes/export.js` | Branch `/pdf` route on `html` vs legacy `content+templateId` |

---

## Task 1: Add `data-page-card` to page cards in ResumePreview

**Files:**
- Modify: `frontend/src/components/preview/ResumePreview.jsx`

- [ ] **Step 1: Open `ResumePreview.jsx` and add the data attribute**

  Find the page card div at line 120. Change it from:

  ```jsx
  <div
    key={`page-${pageIndex}`}
    className="page"
    style={{
  ```

  To:

  ```jsx
  <div
    key={`page-${pageIndex}`}
    data-page-card
    className="page"
    style={{
  ```

- [ ] **Step 2: Verify in browser**

  Run the dev server (`npm run dev` from root). Open the app, inspect any page card in DevTools — it should have the `data-page-card` attribute. The preview should look identical to before.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/preview/ResumePreview.jsx
  git commit -m "feat: add data-page-card attribute to preview page cards"
  ```

---

## Task 2: Create `capturePreview.js`

**Files:**
- Create: `frontend/src/utils/capturePreview.js`

- [ ] **Step 1: Create the file**

  Create `frontend/src/utils/capturePreview.js` with the following content:

  ```javascript
  const FONT_LINK = [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">',
  ].join('\n')

  export function capturePreviewHtml() {
    const cards = Array.from(document.querySelectorAll('[data-page-card]'))
    if (!cards.length) throw new Error('No page cards found — preview may not be rendered yet')

    const pageHtml = cards.map((card, i) => {
      const clone = card.cloneNode(true)
      clone.style.boxShadow = 'none'
      clone.style.marginBottom = '0'
      if (i < cards.length - 1) {
        clone.style.breakAfter = 'page'
        clone.style.pageBreakAfter = 'always'
      }
      return clone.outerHTML
    }).join('\n')

    return `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  ${FONT_LINK}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    @page { size: 745px 1054px; margin: 0; }
  </style>
  </head>
  <body>
  ${pageHtml}
  </body>
  </html>`
  }
  ```

- [ ] **Step 2: Verify the function manually in browser console**

  With the dev server running, open DevTools console and run:

  ```javascript
  // Paste this to test (after importing is not needed in console)
  const cards = Array.from(document.querySelectorAll('[data-page-card]'))
  console.log('Cards found:', cards.length)
  console.log('First card outerHTML length:', cards[0]?.outerHTML.length)
  ```

  Expected: `Cards found: 1` (or more for multi-page resumes), and a non-zero HTML length.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/utils/capturePreview.js
  git commit -m "feat: add capturePreviewHtml utility to serialize preview pages"
  ```

---

## Task 3: Update `DownloadButtons.jsx` to use capture for PDF

**Files:**
- Modify: `frontend/src/components/shared/DownloadButtons.jsx`

- [ ] **Step 1: Replace the file contents**

  Open `frontend/src/components/shared/DownloadButtons.jsx`. Replace it entirely with:

  ```jsx
  import { useState } from 'react'
  import axios from 'axios'
  import { useResumeStore } from '../../store/useResumeStore'
  import { capturePreviewHtml } from '../../utils/capturePreview'

  export default function DownloadButtons() {
    const content    = useResumeStore(s => s.content)
    const templateId = useResumeStore(s => s.templateId)
    const [loading, setLoading] = useState(null)
    const [error, setError]     = useState('')

    async function download(type) {
      setLoading(type)
      setError('')
      try {
        const postBody = type === 'pdf'
          ? { html: capturePreviewHtml() }
          : { content, templateId }
        const { data } = await axios.post(`/api/export/${type}`, postBody, { responseType: 'blob' })
        const url = URL.createObjectURL(data)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `resume.${type}`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        setError(`Failed to export ${type.toUpperCase()}. Please try again.`)
      } finally {
        setLoading(null)
      }
    }

    const btn = (type, label, bg, hover) => (
      <button type="button" onClick={() => download(type)} disabled={!!loading}
        style={{ width: '100%', background: loading === type ? '#94a3b8' : bg, color: '#fff', fontWeight: 600, fontSize: '13px', padding: '10px', borderRadius: '6px', border: 'none', cursor: loading ? 'wait' : 'pointer', marginBottom: '8px', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = hover }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading === type ? '#94a3b8' : bg }}>
        {loading === type ? 'Generating…' : label}
      </button>
    )

    return (
      <div>
        {btn('pdf',  '⬇ Download PDF',  '#3b82f6', '#2563eb')}
        {btn('docx', '⬇ Download DOCX', '#0369a1', '#075985')}
        {error && <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '12px' }}>{error}</p>}
      </div>
    )
  }
  ```

- [ ] **Step 2: Verify no visual change**

  With the dev server running, confirm the Download PDF and Download DOCX buttons render and are clickable. No UI change should be visible. (The PDF download will 500 until Task 5 is complete — that's expected.)

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/shared/DownloadButtons.jsx
  git commit -m "feat: use capturePreviewHtml for PDF download"
  ```

---

## Task 4: Add `exportHtmlToPdf` to `pdfExporter.js`

**Files:**
- Modify: `backend/src/services/exporter/pdfExporter.js`

- [ ] **Step 1: Replace the file contents**

  Open `backend/src/services/exporter/pdfExporter.js`. Replace it entirely with:

  ```javascript
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

  async function exportHtmlToPdf(html) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      await page.evaluateHandle('document.fonts.ready')
      const pdf = await page.pdf({
        width: '745px',
        height: '1054px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })
      return pdf
    } finally {
      await browser.close()
    }
  }

  module.exports = { exportToPdf, exportHtmlToPdf }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add backend/src/services/exporter/pdfExporter.js
  git commit -m "feat: add exportHtmlToPdf function to pdfExporter"
  ```

---

## Task 5: Update the `/pdf` route to branch on `html`

**Files:**
- Modify: `backend/src/routes/export.js`

- [ ] **Step 1: Replace the file contents**

  Open `backend/src/routes/export.js`. Replace it entirely with:

  ```javascript
  const express = require('express')
  const { exportToPdf, exportHtmlToPdf } = require('../services/exporter/pdfExporter')
  const { exportToDocx } = require('../services/exporter/docxExporter')

  const router = express.Router()

  const VALID_TEMPLATES = ['classic', 'modern', 'minimal', 'executive', 'creative']

  function validateBody(req, res) {
    if (!req.body.content)    { res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' }); return false }
    if (!req.body.templateId) { res.status(400).json({ error: 'templateId is required', code: 'MISSING_TEMPLATE' }); return false }
    if (!VALID_TEMPLATES.includes(req.body.templateId)) {
      res.status(400).json({ error: `Unknown template: ${req.body.templateId}`, code: 'INVALID_TEMPLATE' })
      return false
    }
    return true
  }

  router.post('/pdf', async (req, res) => {
    const { html, content, templateId } = req.body

    if (html !== undefined) {
      if (typeof html !== 'string' || !html.trim()) {
        return res.status(400).json({ error: 'html must be a non-empty string', code: 'INVALID_HTML' })
      }
      try {
        const pdf = await exportHtmlToPdf(html)
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
          'Content-Length': pdf.length
        })
        return res.end(pdf)
      } catch (err) {
        console.error('PDF export error:', err)
        return res.status(500).json({ error: 'PDF generation failed', code: 'PDF_ERROR' })
      }
    }

    if (!validateBody(req, res)) return
    try {
      const pdf = await exportToPdf(content, templateId)
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdf.length
      })
      res.end(pdf)
    } catch (err) {
      console.error('PDF export error:', err)
      res.status(500).json({ error: 'PDF generation failed', code: 'PDF_ERROR' })
    }
  })

  router.post('/docx', async (req, res) => {
    if (!validateBody(req, res)) return
    try {
      const { content, templateId } = req.body
      const buf = await exportToDocx(content, templateId)
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="resume.docx"',
        'Content-Length': buf.length
      })
      res.end(buf)
    } catch (err) {
      console.error('DOCX export error:', err)
      res.status(500).json({ error: 'DOCX generation failed', code: 'DOCX_ERROR' })
    }
  })

  module.exports = router
  ```

- [ ] **Step 2: Test the full PDF download flow**

  With both servers running (`npm run dev` from root):
  1. Open the app in the browser
  2. Fill in or load a resume with at least one experience entry
  3. Click "Download PDF"
  4. Verify:
     - The button shows "Generating…" while loading
     - A PDF file downloads named `resume.pdf`
     - Open the PDF — pages should break exactly where the preview shows them breaking
     - Continuation labels ("Experience (cont.)") in the PDF should match the preview
     - Fonts should render correctly (Inter / Playfair / Lora depending on template)

- [ ] **Step 3: Test DOCX still works**

  Click "Download DOCX" — verify it still downloads a valid `.docx` file. This exercises the unchanged DOCX path.

- [ ] **Step 4: Commit**

  ```bash
  git add backend/src/routes/export.js
  git commit -m "feat: route pdf export through capturePreviewHtml path"
  ```
