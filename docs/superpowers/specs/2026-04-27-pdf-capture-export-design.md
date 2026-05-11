# PDF Capture Export — Design Spec

**Date:** 2026-04-27  
**Status:** Approved

## Problem

The browser preview and the PDF export are two independent rendering pipelines with no shared logic:

- **Preview** uses `measureAndDistribute()` + `sliceContent()` (in `pageLayout.js`) to split content into pages by measuring real DOM element heights, then re-renders N React template instances with sliced content and continuation flags.
- **PDF export** (`pdfExporter.js`) renders the full resume as a single flat HTML document via `htmlRenderer.js` (a separate, server-side renderer) and lets Puppeteer/Chromium auto-paginate.

This means page breaks, continuation headers, and page counts can and do diverge between what the user sees and what they download.

## Goal

Make the exported PDF match the browser preview exactly — same page breaks, same continuation labels, same content on every page.

## Approach: Frontend HTML Capture

The frontend already has the correctly-split pages rendered in the DOM at the moment the user clicks "Download PDF". The solution is to serialize that rendered output into a self-contained HTML document and POST it to the backend. Puppeteer receives pre-split HTML and converts it to PDF — no page-splitting logic runs on the backend, no second renderer to maintain.

**Why not port page-splitting to the backend?**  
The splitting algorithm depends on `getBoundingClientRect()` (a browser DOM API unavailable in Node.js). Running it in Puppeteer would require a two-pass render and full parity between `htmlRenderer.js` and all 17 React templates — ongoing duplication that would drift.

**Why not have Puppeteer navigate to the frontend URL?**  
Same-repo does not mean same-machine when deployed. This approach breaks in any split-deployment setup (frontend on CDN/Vercel, backend on a server).

## Architecture

```
User clicks "Download PDF"
        │
        ▼
capturePreviewHtml()          ← new frontend utility
  query [data-page-card] elements
  clone each, strip preview styles (shadow, gap)
  add break-after: page between cards
  wrap in full HTML doc (fonts + print CSS)
        │
        ▼
POST /api/export/pdf  { html: "<!DOCTYPE html>..." }
        │
        ▼
exportHtmlToPdf(html)         ← new backend function
  puppeteer.setContent(html, { waitUntil: 'networkidle0' })
  document.fonts.ready
  page.pdf({ width: '745px', height: '1054px', margin: 0 })
        │
        ▼
PDF blob returned to browser → downloaded as resume.pdf
```

## Changes

### 1. `frontend/src/components/preview/ResumePreview.jsx`

Add `data-page-card` attribute to each page card div (currently line 122). This replaces `className="page"` as the serialization selector — explicit, unambiguous, won't accidentally match other elements.

```jsx
<div
  key={`page-${pageIndex}`}
  data-page-card
  className="page"
  style={{ ... }}
>
```

### 2. New: `frontend/src/utils/capturePreview.js`

Single exported function `capturePreviewHtml()`.

**Responsibilities:**
- Query all `[data-page-card]` elements (throws if none found)
- Clone each card node (deep clone)
- On each clone: remove `boxShadow`, set `marginBottom` to `0`
- On all but the last clone: add `break-after: page` (and `page-break-after: always` for compat)
- Build a wrapper HTML document containing:
  - `<meta charset="UTF-8">`
  - Google Fonts preconnect + stylesheet link (same URL as `frontend/index.html`)
  - `<style>` with `* { box-sizing: border-box }`, `body { margin: 0; padding: 0 }`, and `@page { size: 745px 1054px; margin: 0 }`
  - All cloned page `outerHTML` joined

**CSS custom properties:** React serializes `style={{ '--resume-body': '14px', ... }}` as real inline style properties, so they are captured correctly in `outerHTML` — no extra handling needed.

**Font availability in Puppeteer:** Fonts are referenced by `font-family` in inline styles already set on the elements. The Google Fonts `<link>` in the captured HTML causes Puppeteer to download them. `waitUntil: 'networkidle0'` ensures the download completes before PDF generation.

### 3. `frontend/src/components/shared/DownloadButtons.jsx`

Modify the `download('pdf')` branch:
- Call `capturePreviewHtml()` to get the serialized HTML string
- POST `{ html }` to `/api/export/pdf` instead of `{ content, templateId }`
- All other logic (blob handling, `<a>` click, error state, loading state) unchanged

The DOCX path is unaffected.

### 4. `backend/src/services/exporter/pdfExporter.js`

Add `exportHtmlToPdf(html)` alongside the existing `exportToPdf(content, templateId)`.

```javascript
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
```

**Page dimensions:** 745×1054px matches the preview card size exactly. `break-after: page` in the HTML handles pagination. The resulting PDF pages are 7.76"×10.98" — close to Letter, PDF viewers scale to fit when printing.

Export `exportHtmlToPdf` alongside existing `exportToPdf`.

### 5. `backend/src/routes/export.js`

Modify the `/pdf` route to branch on the presence of `html` in the request body:

- **`html` present:** validate it is a non-empty string, call `exportHtmlToPdf(html)`, return PDF blob
- **`html` absent:** fall through to existing `validateBody(content, templateId)` + `exportToPdf` path (unchanged, backwards compatible)

Remove `templateId` from validation when `html` is present — it is not needed and the backend's `VALID_TEMPLATES` list (which only has 5 entries) would incorrectly reject the 17-template frontend.

### 6. `backend/src/index.js` (body-parser limit)

A serialized 2-page resume with all inline styles is ~200–400KB. Express's default `express.json()` limit is 100KB. Raise it to `2mb`:

```javascript
app.use(express.json({ limit: '2mb' }))
```

## What stays the same

- DOCX export is entirely unchanged
- The legacy `exportToPdf(content, templateId)` path is preserved (backend still works standalone if needed)
- `htmlRenderer.js` is untouched
- All 17 React template components are untouched
- `pageLayout.js` is untouched

## Out of scope

- Offline font embedding (base64) — Puppeteer has network access; Google Fonts CDN is sufficient
- Scaling content to exact Letter paper dimensions — 745×1054px is visually equivalent and PDF viewers handle scaling
