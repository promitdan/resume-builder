# Data-Level Page Splitting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CSS translateY-clip pagination with BetterCV-style data-level splitting — measure section/item positions in a hidden render, distribute content across pages with item-level splits, then render N fresh template instances each receiving only its page's content slice.

**Architecture:** A new `pageLayout.js` utility handles three concerns: measuring `[data-section]`/`[data-item]` element positions from a hidden render; a greedy distribution algorithm that assigns items to pages with mid-section splits; and a content slicer that produces per-page content objects. `ResumePreview` drives this pipeline and renders one `<Template>` per page with sliced content and `pageIndex` prop. Templates gain `data-page-header`, `data-section`, `data-item`, and `data-col` attributes plus a `pageIndex` prop to suppress repeated headers.

**Tech Stack:** React, `getBoundingClientRect`, `ResizeObserver`, CSS custom properties

---

## Template classification

**Two-column (8):** `modern`, `modern-sidebar`, `modern-banner`, `modern-split`, `minimal-columns`, `minimal-boxed`, `executive-band`, `executive-sidebar`

**Single-column (9):** `classic-traditional`, `classic-academic`, `classic-formal`, `minimal`, `minimal-serif`, `executive`, `creative`, `creative-star`, `creative-minimal`

---

## Key design rules (read before implementing any template task)

**`data-page-header`** — marks the name/contact block that always lives on page 1. Its height is subtracted from firstPageAvail so the distribution algorithm doesn't overlap sections with it. Gate its render with `{pageIndex === 0 && ...}`. Never put `data-page-header` inside a `[data-col]` element — it must be a direct descendant of the template root so the measurement finds it via `containerEl.querySelector('[data-page-header]')`.

**`data-col="left"` / `data-col="right"`** — marks the two column roots in two-column templates. The measurement algorithm queries these to run independent distributions for each column.

**`data-section="sectionKey"`** — marks each distributable section root. Sections without `[data-item]` children are atomic (move as a whole). Sections with `[data-item]` children support item-level splitting.

**`data-item={id}`** — marks each repeating item within a section (each job, each school, each project, etc.). Must be unique within the section.

**Contact details are NOT distributable.** `personal.email`, `personal.phone`, `personal.location`, etc. live in the `personal` object which `sliceContent` does not filter. Gate contact rendering with `{pageIndex === 0 && ...}` in the template — do not add `data-section` to contact blocks.

**Custom sections are atomic.** Wrap the entire custom block with a single `data-section="custom"` — do not add per-entry `data-section` or `data-item`. The whole block moves together.

**Skills and languages are atomic in left sidebars.** Add `data-section="skills"` and `data-section="languages"` but no `data-item` — they move as whole blocks. Their arrays are zeroed/restored by `sliceContent` so they can flow to page 2 if they overflow.

---

## Task 1: Create `frontend/src/utils/pageLayout.js`

**Files:**
- Create: `frontend/src/utils/pageLayout.js`

- [ ] **Step 1: Create the file**

```js
// frontend/src/utils/pageLayout.js

export const CONTENT_HEIGHT   = 11 * 96            // 1056px — letter page at 96 dpi
export const PAGE_CONTENT_MAX = CONTENT_HEIGHT - 48 // 1008px — 48px bottom buffer
export const PAGE_GAP         = 24                  // px gap between page cards

// ─── Measurement ─────────────────────────────────────────────────────────────

// Queries [data-section] elements within `el` and their [data-item] descendants.
// All positions are relative to `containerEl`'s top-left corner.
function measureSectionsInEl(el, containerEl) {
  const ref      = containerEl.getBoundingClientRect()
  const sections = []

  for (const sEl of el.querySelectorAll('[data-section]')) {
    const sr   = sEl.getBoundingClientRect()
    const sTop = sr.top - ref.top
    const items = []

    for (const iEl of sEl.querySelectorAll('[data-item]')) {
      const ir = iEl.getBoundingClientRect()
      items.push({
        id:     iEl.dataset.item,
        top:    ir.top    - ref.top,
        bottom: ir.bottom - ref.top,
        height: ir.height,
      })
    }

    sections.push({
      id:           sEl.dataset.section,
      top:          sTop,
      bottom:       sr.bottom - ref.top,
      height:       sr.height,
      // headerHeight = gap between section top and first item top (label + spacing)
      headerHeight: items.length > 0 ? items[0].top - sTop : sr.height,
      items,
    })
  }

  return sections
}

// ─── Distribution ─────────────────────────────────────────────────────────────

// Greedily assigns sections (and their items) to pages, splitting at item boundaries.
// Returns an array of pages; each page is an array of assignment objects:
//   { sectionId: string, items: string[] | null, isContinuation: boolean }
//   items === null  →  atomic section, show in full
//   isContinuation  →  section started on a previous page; template should suppress header
export function distributePages(sections, firstPageAvail, subsequentPageAvail) {
  const pages  = []
  let current  = []
  let used     = 0
  let isFirst  = true
  const seen   = new Set()  // sectionIds that appeared on prior pages

  const avail = () => isFirst ? firstPageAvail : subsequentPageAvail

  const flush = () => {
    current.forEach(e => seen.add(e.sectionId))
    pages.push(current)
    current = []
    used    = 0
    isFirst = false
  }

  for (const sec of sections) {
    if (sec.items.length === 0) {
      // Atomic section — move whole thing to next page if it doesn't fit
      if (used > 0 && used + sec.height > avail()) flush()
      current.push({ sectionId: sec.id, items: null, isContinuation: seen.has(sec.id) })
      used += sec.height
      continue
    }

    let entry = null  // current page's assignment entry for this section

    for (const item of sec.items) {
      const hdr    = entry ? 0 : sec.headerHeight
      const needed = hdr + item.height

      // Flush only when page has content — prevents infinite loop for oversized items
      if (used > 0 && used + needed > avail()) {
        flush()
        entry = null
      }

      if (!entry) {
        entry = { sectionId: sec.id, items: [], isContinuation: seen.has(sec.id) }
        current.push(entry)
        used += sec.headerHeight
      }

      entry.items.push(item.id)
      used += item.height
    }
  }

  if (current.length > 0) pages.push(current)
  return pages
}

// ─── Content slicing ──────────────────────────────────────────────────────────

// Array keys in content that are distributable across pages.
// personal is NOT here — contact info is gated by pageIndex in templates, not sliced.
const ARRAY_SECTIONS = [
  'experience', 'education', 'skills', 'projects',
  'certifications', 'languages', 'awards', 'custom',
]

// Produces a content object for one page given a page assignment array.
// pageAssignment: one element from the array returned by distributePages().
// pageIndex: 0-based page number.
export function sliceContent(fullContent, pageAssignment, pageIndex) {
  const slice       = { ...fullContent }
  const assignedIds = new Set(pageAssignment.map(a => a.sectionId))

  // Zero all distributable array sections; the loop below refills assigned ones
  ARRAY_SECTIONS.forEach(k => { slice[k] = [] })

  // summary lives in personal.summary but is a distributable section keyed 'summary'
  if (!assignedIds.has('summary')) {
    slice.personal = { ...slice.personal, summary: '' }
  }

  for (const { sectionId, items, isContinuation } of pageAssignment) {
    if (sectionId === 'summary') continue  // handled above via personal.summary

    if (items === null) {
      // Atomic: restore full array
      slice[sectionId] = fullContent[sectionId] ?? []
    } else {
      const idSet    = new Set(items)
      const filtered = (fullContent[sectionId] ?? []).filter(item => idSet.has(item.id))
      // First item flagged _isContinuation so the template can suppress the section header
      slice[sectionId] = isContinuation && filtered.length > 0
        ? [{ ...filtered[0], _isContinuation: true }, ...filtered.slice(1)]
        : filtered
    }
  }

  return slice
}

// ─── Top-level orchestration ──────────────────────────────────────────────────

// Runs measurement + distribution on a rendered hidden container.
// isTwoColumn: true for templates with [data-col="left"] / [data-col="right"].
// Returns:
//   { type: 'single',     pages: Assignment[][] }
//   { type: 'two-column', leftPages: Assignment[][], rightPages: Assignment[][], totalPages: number }
export function measureAndDistribute(containerEl, isTwoColumn) {
  // [data-page-header] is the name/contact block always on page 1.
  // Its height is deducted from firstPageAvail so sections don't overlap it.
  const hdrEl        = containerEl.querySelector('[data-page-header]')
  const headerHeight = hdrEl ? hdrEl.getBoundingClientRect().height : 0

  const firstPageAvail      = PAGE_CONTENT_MAX - headerHeight
  const subsequentPageAvail = PAGE_CONTENT_MAX

  if (!isTwoColumn) {
    const sections = measureSectionsInEl(containerEl, containerEl)
    const pages    = distributePages(sections, firstPageAvail, subsequentPageAvail)
    return { type: 'single', pages }
  }

  // Two-column: each column distributes independently
  const colEls     = containerEl.querySelectorAll('[data-col]')
  const colSections = { left: [], right: [] }
  for (const colEl of colEls) {
    const side = colEl.dataset.col
    if (side === 'left' || side === 'right') {
      colSections[side] = measureSectionsInEl(colEl, containerEl)
    }
  }

  const leftPages  = distributePages(colSections.left,  firstPageAvail, subsequentPageAvail)
  const rightPages = distributePages(colSections.right, firstPageAvail, subsequentPageAvail)
  const totalPages = Math.max(leftPages.length, rightPages.length, 1)

  return { type: 'two-column', leftPages, rightPages, totalPages }
}
```

- [ ] **Step 2: Verify no syntax errors**

```bash
cd frontend && node --input-type=module --eval "import './src/utils/pageLayout.js'; console.log('ok')"
```

Expected output: `ok`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/utils/pageLayout.js
git commit -m "feat: add pageLayout utility — measure, distribute, slice"
```

---

## Task 2: Rewrite `frontend/src/components/preview/ResumePreview.jsx`

**Files:**
- Modify: `frontend/src/components/preview/ResumePreview.jsx`

Replaces the translateY-clip approach. Page cards have no padding; full-bleed colored sidebars extend to page edges.

- [ ] **Step 1: Replace the entire file**

```jsx
import { useRef, useEffect, useState } from 'react'
import ClassicTemplate          from './templates/ClassicTemplate'
import ClassicAcademicTemplate  from './templates/ClassicAcademicTemplate'
import ClassicFormalTemplate    from './templates/ClassicFormalTemplate'
import ModernTemplate           from './templates/ModernTemplate'
import ModernSidebarTemplate    from './templates/ModernSidebarTemplate'
import ModernBannerTemplate     from './templates/ModernBannerTemplate'
import ModernSplitTemplate      from './templates/ModernSplitTemplate'
import MinimalTemplate          from './templates/MinimalTemplate'
import MinimalColumnsTemplate   from './templates/MinimalColumnsTemplate'
import MinimalBoxedTemplate     from './templates/MinimalBoxedTemplate'
import MinimalSerifTemplate     from './templates/MinimalSerifTemplate'
import ExecutiveTemplate        from './templates/ExecutiveTemplate'
import ExecutiveBandTemplate    from './templates/ExecutiveBandTemplate'
import ExecutiveSidebarTemplate from './templates/ExecutiveSidebarTemplate'
import CreativeTemplate         from './templates/CreativeTemplate'
import CreativeStarTemplate     from './templates/CreativeStarTemplate'
import CreativeMinimalTemplate  from './templates/CreativeMinimalTemplate'
import { TEMPLATE_CONFIGS }     from '../../registry/templateRegistry'
import {
  measureAndDistribute, sliceContent,
  CONTENT_HEIGHT, PAGE_GAP,
} from '../../utils/pageLayout'

const COMPONENT_MAP = {
  'classic':             ClassicTemplate,
  'classic-traditional': ClassicTemplate,
  'classic-academic':    ClassicAcademicTemplate,
  'classic-formal':      ClassicFormalTemplate,
  'modern':              ModernTemplate,
  'modern-sidebar':      ModernSidebarTemplate,
  'modern-banner':       ModernBannerTemplate,
  'modern-split':        ModernSplitTemplate,
  'minimal':             MinimalTemplate,
  'minimal-columns':     MinimalColumnsTemplate,
  'minimal-boxed':       MinimalBoxedTemplate,
  'minimal-serif':       MinimalSerifTemplate,
  'executive':           ExecutiveTemplate,
  'executive-band':      ExecutiveBandTemplate,
  'executive-sidebar':   ExecutiveSidebarTemplate,
  'creative':            CreativeTemplate,
  'creative-star':       CreativeStarTemplate,
  'creative-minimal':    CreativeMinimalTemplate,
}

const FONT_SIZE_VARS = {
  small:  { '--resume-body': '12px', '--resume-meta': '11px', '--resume-label': '10px', '--resume-sub': '13px' },
  medium: { '--resume-body': '14px', '--resume-meta': '13px', '--resume-label': '11px', '--resume-sub': '15px' },
  large:  { '--resume-body': '16px', '--resume-meta': '15px', '--resume-label': '12px', '--resume-sub': '17px' },
}

export { CONTENT_HEIGHT, PAGE_GAP }

export default function ResumePreview({ content, templateId, paletteIndex = 0, fontSize = 'medium', onBreaksChange }) {
  const Template      = COMPONENT_MAP[templateId]
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const measureRef    = useRef()
  const [pageSlices, setPageSlices] = useState([{ slicedContent: content, pageIndex: 0 }])

  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}
  const fontVars      = FONT_SIZE_VARS[fontSize] ?? FONT_SIZE_VARS.medium
  const isTwoColumn   = tpl?.layoutType === 'two-column'

  useEffect(() => {
    if (!measureRef.current) return
    const el = measureRef.current

    const compute = () => {
      const result = measureAndDistribute(el, isTwoColumn)
      let slices

      if (result.type === 'single') {
        slices = result.pages.map((assignment, i) => ({
          slicedContent: sliceContent(content, assignment, i),
          pageIndex:     i,
        }))
      } else {
        slices = []
        for (let i = 0; i < result.totalPages; i++) {
          const combined = [
            ...(result.leftPages[i]  ?? []),
            ...(result.rightPages[i] ?? []),
          ]
          slices.push({
            slicedContent: sliceContent(content, combined, i),
            pageIndex:     i,
          })
        }
      }

      if (slices.length === 0) slices = [{ slicedContent: content, pageIndex: 0 }]
      setPageSlices(slices)
      onBreaksChange?.(slices.length)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [content, templateId, fontSize, isTwoColumn])

  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>

  return (
    <div style={{ width: '8.5in', margin: '0 auto' }}>
      {/* Hidden full render for measurement — always pageIndex=0 so all content is present */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute', left: '-9999px', top: 0,
          width: '8.5in', visibility: 'hidden', pointerEvents: 'none',
          ...fontVars,
        }}
      >
        <Template content={content} paletteColors={paletteColors} pageIndex={0} />
      </div>

      {/* N page cards — each is a fresh template render with its content slice */}
      {pageSlices.map(({ slicedContent, pageIndex }, i) => (
        <div
          key={i}
          className="page"
          style={{
            width:        '8.5in',
            height:       `${CONTENT_HEIGHT}px`,
            background:   '#fff',
            boxShadow:    '0 2px 16px rgba(0,0,0,0.15)',
            overflow:     'hidden',
            marginBottom: i < pageSlices.length - 1 ? `${PAGE_GAP}px` : 0,
          }}
        >
          <div style={{ ...fontVars }}>
            <Template
              content={slicedContent}
              paletteColors={paletteColors}
              pageIndex={pageIndex}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/preview/ResumePreview.jsx
git commit -m "refactor: data-level page splitting in ResumePreview"
```

---

## Task 3: Add `layoutType` to two-column template JSON configs

**Files (8 files):**
- `frontend/src/templates/modern.json`
- `frontend/src/templates/modern-sidebar.json`
- `frontend/src/templates/modern-banner.json`
- `frontend/src/templates/modern-split.json`
- `frontend/src/templates/minimal-columns.json`
- `frontend/src/templates/minimal-boxed.json`
- `frontend/src/templates/executive-band.json`
- `frontend/src/templates/executive-sidebar.json`

- [ ] **Step 1: Add `"layoutType": "two-column"` as the first key in each of the 8 JSON files**

Open each file. The root JSON object currently starts with `"colors"` or similar. Add the field before it:

```json
{
  "layoutType": "two-column",
  "colors": { ... },
  "typography": { ... },
  "layout": { ... }
}
```

Repeat for all 8 files. The 9 single-column template JSONs need no change — absence of `layoutType` means single-column.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/templates/modern.json \
        frontend/src/templates/modern-sidebar.json \
        frontend/src/templates/modern-banner.json \
        frontend/src/templates/modern-split.json \
        frontend/src/templates/minimal-columns.json \
        frontend/src/templates/minimal-boxed.json \
        frontend/src/templates/executive-band.json \
        frontend/src/templates/executive-sidebar.json
git commit -m "feat: mark two-column templates with layoutType metadata"
```

---

## Task 4: Add data attributes to `ClassicTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/ClassicTemplate.jsx`

ClassicTemplate: centered header (name + contact), then a padded body with summary + sectionOrder loop.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
// Before
export default function ClassicTemplate({ content = {}, paletteColors = {} }) {

// After
export default function ClassicTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the header div with `data-page-header` and gate with `pageIndex === 0`**

The header is the first div inside the return — the centered block with name, title, and contact row.

```jsx
// Before
<div style={{ textAlign: 'center', padding: '36px 56px 18px', borderBottom: `2px solid ${c.dividerColor}` }}>
  ...name / title / contact...
</div>

// After
{pageIndex === 0 && (
  <div data-page-header style={{ textAlign: 'center', padding: '36px 56px 18px', borderBottom: `2px solid ${c.dividerColor}` }}>
    ...name / title / contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-section="summary"` to the summary block**

```jsx
// Before
{personal.summary && (
  <div>
    {sectionLabel('Professional Summary')}

// After
{personal.summary && (
  <div data-section="summary">
    {sectionLabel('Professional Summary')}
```

- [ ] **Step 4: Add `data-section` and `data-item` to each section in the sectionOrder map**

In the `sectionOrder.filter(...).map(key => { ... })` block, apply these changes:

```jsx
// skills — atomic (no data-item)
// Before: <div key={key}>
<div key={key} data-section="skills">

// experience
// Before: <div key={key}>
<div key={key} data-section="experience">
// Before: <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
<div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>

// education
// Before: <div key={key}>
<div key={key} data-section="education">
// Before: <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
<div key={e.id ?? i} data-item={e.id ?? `edu-${i}`} style={{ marginBottom: l.itemSpacing }}>

// certifications
// Before: <div key={key}>
<div key={key} data-section="certifications">
// Before: <div key={cert.id ?? i} style={{ marginBottom: '8px', ...
<div key={cert.id ?? i} data-item={cert.id ?? `cert-${i}`} style={{ marginBottom: '8px', ...

// languages — atomic (no data-item)
// Before: <div key={key}>
<div key={key} data-section="languages">

// awards
// Before: <div key={key}>
<div key={key} data-section="awards">
// Before: <div key={aw.id ?? i} style={{ marginBottom: '8px', ...
<div key={aw.id ?? i} data-item={aw.id ?? `award-${i}`} style={{ marginBottom: '8px', ...

// projects
// Before: <div key={key}>
<div key={key} data-section="projects">
// Before: <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
<div key={proj.id ?? i} data-item={proj.id ?? `proj-${i}`} style={{ marginBottom: l.itemSpacing }}>

// custom — single atomic wrapper for all custom entries
// Before: <div key={key}>
<div key={key} data-section="custom">
// The inner custom.map() divs need no data-item — custom is atomic
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ClassicTemplate.jsx
git commit -m "feat: add page-split data attributes to ClassicTemplate"
```

---

## Task 5: Add data attributes to `ClassicAcademicTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/ClassicAcademicTemplate.jsx`

Same structure as ClassicTemplate: centered header, then sectionOrder body.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ClassicAcademicTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the header div with `data-page-header` and gate**

Find the outermost header div (centered name + contact block). Wrap it:

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ ...existing styles... }}>
    ...name / title / contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-section="summary"` to summary block**

```jsx
{personal.summary && (
  <div data-section="summary">
```

- [ ] **Step 4: Add `data-section` and `data-item` to sectionOrder sections**

Apply these attributes (same as Task 4 Step 4):
- `data-section="skills"` — skills wrapper div (atomic)
- `data-section="experience"`, `data-item={e.id ?? \`exp-${i}\`}` — each experience entry div
- `data-section="education"`, `data-item={e.id ?? \`edu-${i}\`}` — each education entry div
- `data-section="certifications"`, `data-item={cert.id ?? \`cert-${i}\`}` — each cert div
- `data-section="languages"` — languages wrapper div (atomic)
- `data-section="awards"`, `data-item={aw.id ?? \`award-${i}\`}` — each award div
- `data-section="projects"`, `data-item={proj.id ?? \`proj-${i}\`}` — each project div
- `data-section="custom"` — outer custom wrapper div (atomic, no data-item on inner entries)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ClassicAcademicTemplate.jsx
git commit -m "feat: add page-split data attributes to ClassicAcademicTemplate"
```

---

## Task 6: Add data attributes to `ClassicFormalTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/ClassicFormalTemplate.jsx`

Same structure as ClassicTemplate: centered header, then sectionOrder body.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ClassicFormalTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the header div with `data-page-header` and gate**

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ ...existing styles... }}>
    ...name / title / contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-section="summary"` to summary block**

```jsx
{personal.summary && (
  <div data-section="summary">
```

- [ ] **Step 4: Add `data-section` and `data-item` to sectionOrder sections**

- `data-section="skills"` — skills wrapper (atomic)
- `data-section="experience"`, `data-item={e.id ?? \`exp-${i}\`}` — each experience entry
- `data-section="education"`, `data-item={e.id ?? \`edu-${i}\`}` — each education entry
- `data-section="certifications"`, `data-item={cert.id ?? \`cert-${i}\`}` — each cert
- `data-section="languages"` — languages wrapper (atomic)
- `data-section="awards"`, `data-item={aw.id ?? \`award-${i}\`}` — each award
- `data-section="projects"`, `data-item={proj.id ?? \`proj-${i}\`}` — each project
- `data-section="custom"` — outer custom wrapper (atomic)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ClassicFormalTemplate.jsx
git commit -m "feat: add page-split data attributes to ClassicFormalTemplate"
```

---

## Task 7: Add data attributes to `MinimalTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalTemplate.jsx`

Single-column: top header (name + contact), then sectionOrder body.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function MinimalTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the top header with `data-page-header` and gate**

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ ...existing header styles... }}>
    ...name / title / contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-section="summary"` to summary block**

```jsx
{personal.summary && (
  <div data-section="summary">
```

- [ ] **Step 4: Add `data-section` and `data-item` to sectionOrder sections**

- `data-section="skills"` — atomic
- `data-section="experience"`, `data-item={e.id ?? \`exp-${i}\`}`
- `data-section="education"`, `data-item={e.id ?? \`edu-${i}\`}`
- `data-section="certifications"`, `data-item={cert.id ?? \`cert-${i}\`}`
- `data-section="languages"` — atomic
- `data-section="awards"`, `data-item={aw.id ?? \`award-${i}\`}`
- `data-section="projects"`, `data-item={proj.id ?? \`proj-${i}\`}`
- `data-section="custom"` — atomic wrapper

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalTemplate.jsx
git commit -m "feat: add page-split data attributes to MinimalTemplate"
```

---

## Task 8: Add data attributes to `MinimalSerifTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalSerifTemplate.jsx`

Single-column: top header, then sectionOrder body.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function MinimalSerifTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap top header with `data-page-header` and gate**

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ ...existing header styles... }}>
    ...name / title / contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-section="summary"` to summary block**

- [ ] **Step 4: Add `data-section` and `data-item` to sectionOrder sections**

Same attribute list as Task 7 Step 4.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalSerifTemplate.jsx
git commit -m "feat: add page-split data attributes to MinimalSerifTemplate"
```

---

## Task 9: Add data attributes to `ExecutiveTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`

Single-column: top header, then sectionOrder body.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ExecutiveTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap top header with `data-page-header` and gate**

- [ ] **Step 3: Add `data-section="summary"` to summary block**

- [ ] **Step 4: Add `data-section` and `data-item` to sectionOrder sections**

Same attribute list as Task 7 Step 4.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ExecutiveTemplate.jsx
git commit -m "feat: add page-split data attributes to ExecutiveTemplate"
```

---

## Task 10: Add data attributes to `CreativeTemplate`, `CreativeStarTemplate`, `CreativeMinimalTemplate`

**Files:**
- Modify: `frontend/src/components/preview/templates/CreativeTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/CreativeStarTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/CreativeMinimalTemplate.jsx`

All three are single-column. CreativeStar has a two-part header row (name left, details table right) but the body flows as a single column.

- [ ] **Step 1: Apply to `CreativeTemplate`**

  - Add `pageIndex = 0` to props
  - Wrap top header with `{pageIndex === 0 && <div data-page-header ...>...</div>}`
  - `data-section="summary"` on summary block
  - Same `data-section` / `data-item` pattern as Task 7 Step 4

- [ ] **Step 2: Apply to `CreativeStarTemplate`**

  The header is a flex row: name block on the left, details table on the right. Wrap the entire row:

  ```jsx
  // Before
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
    ...name block...
    ...details table...
  </div>

  // After
  {pageIndex === 0 && (
    <div data-page-header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
      ...name block...
      ...details table...
    </div>
  )}
  ```

  Then apply the same `data-section` / `data-item` pattern to all sectionOrder sections.

- [ ] **Step 3: Apply to `CreativeMinimalTemplate`**

  Same as Step 1 (top header + sectionOrder sections).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/preview/templates/CreativeTemplate.jsx \
        frontend/src/components/preview/templates/CreativeStarTemplate.jsx \
        frontend/src/components/preview/templates/CreativeMinimalTemplate.jsx
git commit -m "feat: add page-split data attributes to Creative family templates"
```

---

## Task 11: Add data attributes to `ModernTemplate` (two-column)

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernTemplate.jsx`

ModernTemplate: colored left sidebar (avatar, name, title, contact, skills) + right main column (summary + sectionOrder). Name lives inside the sidebar — no separate top banner.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ModernTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Add `data-col="left"` to the left sidebar div**

```jsx
// Before
<div style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, ...

// After
<div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, ...
```

- [ ] **Step 3: Gate name/avatar/title/contact in the sidebar with `pageIndex === 0`**

Inside the sidebar, find the avatar circle, name div, title div, and contact fields. Wrap them all:

```jsx
{pageIndex === 0 && (
  <>
    {/* avatar circle */}
    {/* name */}
    {/* title */}
    {/* contact rows (email, phone, location, linkedin, website) */}
  </>
)}
```

- [ ] **Step 4: Add `data-section` to skills and languages in the left sidebar**

These are the only distributable array sections in the left column:

```jsx
{/* skills block */}
{hasSkills && (
  <div data-section="skills">
    ...skill items...
  </div>
)}

{/* languages block */}
{languages.length > 0 && (
  <div data-section="languages">
    ...language items...
  </div>
)}
```

No `data-item` on individual skills or language entries — skills and languages are atomic sections.

- [ ] **Step 5: Add `data-col="right"` to the right main column div**

```jsx
// Before
<div style={{ flex: 1, padding: ...

// After
<div data-col="right" style={{ flex: 1, padding: ...
```

- [ ] **Step 6: Add `data-section="summary"` and sectionOrder attributes in right column**

```jsx
{personal.summary && (
  <div data-section="summary">...summary...
)}

// experience
<div key={key} data-section="experience">
  {experience.map((e, i) => (
    <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={...}>

// education
<div key={key} data-section="education">
  {education.map((e, i) => (
    <div key={e.id ?? i} data-item={e.id ?? `edu-${i}`} style={...}>

// certifications
<div key={key} data-section="certifications">
  {certifications.map((cert, i) => (
    <div key={cert.id ?? i} data-item={cert.id ?? `cert-${i}`} style={...}>

// awards
<div key={key} data-section="awards">
  {awards.map((aw, i) => (
    <div key={aw.id ?? i} data-item={aw.id ?? `award-${i}`} style={...}>

// projects
<div key={key} data-section="projects">
  {projects.map((proj, i) => (
    <div key={proj.id ?? i} data-item={proj.id ?? `proj-${i}`} style={...}>

// custom — atomic wrapper
<div key={key} data-section="custom">
  {custom.map(...)}
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/preview/templates/ModernTemplate.jsx
git commit -m "feat: add page-split data attributes to ModernTemplate"
```

---

## Task 12: Add data attributes to `ModernSidebarTemplate` (two-column)

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernSidebarTemplate.jsx`

Same structure as ModernTemplate: colored left sidebar (name, contact, skills, languages) + right main column. Name lives in the sidebar.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ModernSidebarTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Add `data-col="left"` to sidebar div, gate name/contact with `pageIndex === 0`**

```jsx
<div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, ... }}>
  {pageIndex === 0 && (
    <>
      {/* name div */}
      {/* title div */}
      {/* contact section (email, phone, location, linkedin, website) */}
    </>
  )}
  {hasSkills && (
    <div data-section="skills">...skills...</div>
  )}
  {hasSocial && (
    <div data-section="links">...social links...</div>
  )}
  {languages.length > 0 && (
    <div data-section="languages">...languages...</div>
  )}
</div>
```

- [ ] **Step 3: Add `data-col="right"` to main column and sectionOrder attributes**

```jsx
<div data-col="right" style={{ flex: 1, ... }}>
  {personal.summary && <div data-section="summary">...}
  // experience: data-section="experience", data-item={e.id ?? `exp-${i}`} on each entry
  // education:  data-section="education",  data-item={e.id ?? `edu-${i}`} on each entry
  // certifications: data-section="certifications", data-item on each
  // awards: data-section="awards", data-item on each
  // projects: data-section="projects", data-item on each
  // custom: data-section="custom" (atomic wrapper)
</div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/preview/templates/ModernSidebarTemplate.jsx
git commit -m "feat: add page-split data attributes to ModernSidebarTemplate"
```

---

## Task 13: Add data attributes to `ModernBannerTemplate` (two-column, banner header)

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernBannerTemplate.jsx`

ModernBannerTemplate: full-width colored banner at the top (name + contact), then leftCol (skills, languages) + rightCol (summary + sectionOrder).

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ModernBannerTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the banner with `data-page-header` and gate**

Find the full-width colored banner div at the top of the render (contains name on left, contact list on right).

```jsx
// Before
<div style={{ background: c.bannerBg, color: c.bannerText, padding: '28px 32px', display: 'flex', ... }}>
  ...name + contact...
</div>

// After
{pageIndex === 0 && (
  <div data-page-header style={{ background: c.bannerBg, color: c.bannerText, padding: '28px 32px', display: 'flex', ... }}>
    ...name + contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-col="left"` to the leftCol variable, add section attributes**

```jsx
const leftCol = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, ... }}>
    {hasSkills && <div data-section="skills">...skills...</div>}
    {languages.length > 0 && <div data-section="languages">...languages...</div>}
  </div>
)
```

- [ ] **Step 4: Add `data-col="right"` to the rightCol variable and sectionOrder attributes**

```jsx
const rightCol = (
  <div data-col="right" style={{ flex: 1, ... }}>
    {personal.summary && <div data-section="summary">...</div>}
    // experience: data-section + data-item on each entry
    // education:  data-section + data-item on each entry
    // certifications: data-section + data-item on each
    // awards: data-section + data-item on each
    // projects: data-section + data-item on each
    // custom: data-section="custom" atomic wrapper
  </div>
)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ModernBannerTemplate.jsx
git commit -m "feat: add page-split data attributes to ModernBannerTemplate"
```

---

## Task 14: Add data attributes to `ModernSplitTemplate` (two-column)

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernSplitTemplate.jsx`

ModernSplitTemplate: top header block (name, title, contact row), then left sidebar (skills, languages, social links) + right main column (summary + sectionOrder).

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ModernSplitTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the top header block with `data-page-header` and gate**

Find the top div containing name, title, and contact (above the two-column layout). Wrap it:

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ ...existing header styles... }}>
    ...name / title / contact...
  </div>
)}
```

- [ ] **Step 3: Add `data-col="left"` to sidebar variable and section attributes**

```jsx
const sidebar = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, ... }}>
    {hasSkills && <div data-section="skills">...skills...</div>}
    {languages.length > 0 && <div data-section="languages">...languages...</div>}
    {hasSocial && <div data-section="links">...social links...</div>}
  </div>
)
```

- [ ] **Step 4: Add `data-col="right"` to right column variable and sectionOrder attributes**

Find the right column variable (the one with experience, education, etc.) and add:

```jsx
const mainCol = (
  <div data-col="right" style={{ flex: 1, ... }}>
    {personal.summary && <div data-section="summary">...</div>}
    // experience: data-section="experience", data-item={e.id ?? `exp-${i}`} on each entry
    // education:  data-section="education",  data-item={e.id ?? `edu-${i}`} on each entry
    // certifications: data-section + data-item on each
    // awards: data-section + data-item on each
    // projects: data-section + data-item on each
    // custom: data-section="custom" atomic wrapper
  </div>
)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ModernSplitTemplate.jsx
git commit -m "feat: add page-split data attributes to ModernSplitTemplate"
```

---

## Task 15: Add data attributes to `MinimalColumnsTemplate` (two-column)

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx`

MinimalColumnsTemplate: name and contact live in the left column header area. Left column has contact + skills. Right column has experience + education + etc. There is no separate full-width banner — the name is embedded in the left column.

Because `[data-page-header]` must be outside any `[data-col]` element, the name/contact block must be extracted from the left column and placed as a sibling above the two-column flex container.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function MinimalColumnsTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Restructure — move name/contact out of leftCol into a top-level `data-page-header`**

Currently the leftCol variable starts with the name/contact. Move that block to the main return, outside the two-column flex:

```jsx
return (
  <div style={{ fontFamily: ty.bodyFont, ... }}>
    {pageIndex === 0 && (
      <div data-page-header style={{ padding: '28px 32px 0' }}>
        {/* name */}
        {/* title */}
        {/* contact row */}
      </div>
    )}
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {leftCol}
      {rightCol}
    </div>
  </div>
)
```

The `leftCol` variable then starts with skills, languages, etc. — no name/contact.

- [ ] **Step 3: Update leftCol — add `data-col="left"` and section attributes**

```jsx
const leftCol = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, ... }}>
    {hasSkills && <div data-section="skills">...skills...</div>}
    {languages.length > 0 && <div data-section="languages">...languages...</div>}
  </div>
)
```

- [ ] **Step 4: Add `data-col="right"` to rightCol and sectionOrder attributes**

```jsx
const rightCol = (
  <div data-col="right" style={{ flex: 1, ... }}>
    {personal.summary && <div data-section="summary">...</div>}
    // experience: data-section="experience", data-item={e.id ?? `exp-${i}`}
    // education:  data-section="education",  data-item={e.id ?? `edu-${i}`}
    // certifications: data-section + data-item
    // awards: data-section + data-item
    // projects: data-section + data-item
    // custom: data-section="custom" atomic
  </div>
)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx
git commit -m "feat: add page-split data attributes to MinimalColumnsTemplate"
```

---

## Task 16: Add data attributes to `MinimalBoxedTemplate` (two-column)

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx`

Same layout pattern as MinimalColumnsTemplate: name and contact are in the left column, so they must be extracted into a top-level `data-page-header` outside the columns.

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function MinimalBoxedTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Extract name/contact from leftCol into top-level `data-page-header`**

Move the name/contact rendering (currently inside the leftCol variable) to the main return, wrapped with `{pageIndex === 0 && <div data-page-header>...</div>}`. The leftCol variable is updated to start at skills/languages.

```jsx
return (
  <div style={{ fontFamily: ty.bodyFont, ... }}>
    {pageIndex === 0 && (
      <div data-page-header style={{ padding: '28px 32px 0' }}>
        {/* name */}
        {/* title */}
        {/* contact */}
      </div>
    )}
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {leftCol}
      {rightCol}
    </div>
  </div>
)
```

- [ ] **Step 3: Add `data-col="left"` to leftCol and section attributes**

```jsx
const leftCol = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, ... }}>
    {hasSkills && <div data-section="skills">...skills...</div>}
    {languages.length > 0 && <div data-section="languages">...languages...</div>}
  </div>
)
```

- [ ] **Step 4: Add `data-col="right"` to rightCol and sectionOrder attributes**

```jsx
const rightCol = (
  <div data-col="right" style={{ flex: 1, ... }}>
    {personal.summary && <div data-section="summary">...</div>}
    // experience: data-section + data-item on each entry
    // education:  data-section + data-item on each entry
    // certifications: data-section + data-item
    // awards: data-section + data-item
    // projects: data-section + data-item
    // custom: data-section="custom" atomic
  </div>
)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx
git commit -m "feat: add page-split data attributes to MinimalBoxedTemplate"
```

---

## Task 17: Add data attributes to `ExecutiveBandTemplate` (two-column, banner header)

**Files:**
- Modify: `frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx`

ExecutiveBandTemplate: full-width dark banner (name + title), then leftCol (contact, social links, skills, languages) + rightCol (summary + sectionOrder).

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ExecutiveBandTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the banner with `data-page-header` and gate**

Find the full-width dark banner at the top of the return. It contains name and title.

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ background: c.bannerBg, ... }}>
    ...name / title...
  </div>
)}
```

- [ ] **Step 3: Add `data-col="left"` to leftCol variable and section attributes**

Contact and social links in the left column are rendered from `personal.*` — gate them with `{pageIndex === 0 && ...}`. Skills and languages are distributable:

```jsx
const leftCol = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, ... }}>
    {pageIndex === 0 && (
      <>
        {/* Details block: location, phone, email */}
        {/* Websites & Social Links block */}
      </>
    )}
    {hasSkills && <div data-section="skills">...skills...</div>}
    {languages.length > 0 && <div data-section="languages">...languages...</div>}
  </div>
)
```

- [ ] **Step 4: Add `data-col="right"` to rightCol and sectionOrder attributes**

```jsx
const rightCol = (
  <div data-col="right" style={{ flex: 1, ... }}>
    {personal.summary && <div data-section="summary">...</div>}
    // experience: data-section="experience", data-item={e.id ?? `exp-${i}`}
    // education:  data-section="education",  data-item={e.id ?? `edu-${i}`}
    // certifications: data-section + data-item
    // awards: data-section + data-item
    // projects: data-section + data-item
    // custom: data-section="custom" atomic
  </div>
)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx
git commit -m "feat: add page-split data attributes to ExecutiveBandTemplate"
```

---

## Task 18: Add data attributes to `ExecutiveSidebarTemplate` (two-column, banner header)

**Files:**
- Modify: `frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx`

ExecutiveSidebarTemplate: full-width dark banner (name + title), then left sidebar (contact icons, skills, languages) + right main column (summary + sectionOrder).

- [ ] **Step 1: Add `pageIndex = 0` to props**

```jsx
export default function ExecutiveSidebarTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
```

- [ ] **Step 2: Wrap the dark banner with `data-page-header` and gate**

```jsx
{pageIndex === 0 && (
  <div data-page-header style={{ background: c.bannerBg, padding: '22px 24px 18px' }}>
    ...name / title...
  </div>
)}
```

- [ ] **Step 3: Add `data-col="left"` to leftCol variable, gate contact with `pageIndex === 0`**

Contact details (email, location, phone, linkedin, website) are rendered as icon rows from `personal.*` — gate them. Skills and languages are distributable:

```jsx
const leftCol = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, ... }}>
    {pageIndex === 0 && (
      <div>
        {/* iconRow for email, location, phone, linkedin, website */}
      </div>
    )}
    {hasSkills && <div data-section="skills">...skill items list...</div>}
    {languages.length > 0 && <div data-section="languages">...language items...</div>}
  </div>
)
```

- [ ] **Step 4: Add `data-col="right"` to rightCol and sectionOrder attributes**

```jsx
const rightCol = (
  <div data-col="right" style={{ flex: 1, ... }}>
    {personal.summary && <div data-section="summary">...</div>}
    // experience: data-section="experience", data-item={e.id ?? `exp-${i}`}
    // education:  data-section="education",  data-item={e.id ?? `edu-${i}`}
    // certifications: data-section + data-item
    // awards: data-section + data-item
    // projects: data-section + data-item
    // custom: data-section="custom" atomic
  </div>
)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx
git commit -m "feat: add page-split data attributes to ExecutiveSidebarTemplate"
```

---

## Task 19: Update `TemplateThumbnailPage.jsx`

**Files:**
- Modify: `frontend/src/pages/TemplateThumbnailPage.jsx`

The thumbnail page renders a bare template for Puppeteer screenshot generation. It must pass `pageIndex={0}` now that all templates expect the prop.

- [ ] **Step 1: Add `pageIndex={0}` to the Template render**

```jsx
// Before
<Template content={SAMPLE} paletteColors={paletteColors} />

// After
<Template content={SAMPLE} paletteColors={paletteColors} pageIndex={0} />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/TemplateThumbnailPage.jsx
git commit -m "fix: pass pageIndex={0} to templates in TemplateThumbnailPage"
```

---

## Task 20: Smoke-test all 17 templates in the browser

- [ ] **Step 1: Start the dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Navigate to `/build`, paste a dense resume (3+ experience entries with 3+ bullets each), then open `/preview` and cycle through all 17 templates**

For each template check:
- Page 1 shows the name and header
- Page 2+ does NOT show the name/header again
- Page breaks happen cleanly — no mid-line cuts
- Two-column templates: colored sidebar background fills the full left column on page 2+, even if the sidebar has no content
- Single-column templates: page 2 content starts with natural top padding from the template's own styles, not from the page card

- [ ] **Step 3: Check browser console for errors during template cycling**

Expected: no React warnings about keys, no undefined errors from `sliceContent`, no infinite `ResizeObserver` loops.

- [ ] **Step 4: Fix any issues found and commit**

```bash
git add -p
git commit -m "fix: <describe the issue>"
```

---

## Task 21: Push

- [ ] **Step 1: Verify clean state**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2: Push**

```bash
git push
```
