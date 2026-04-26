# Paginated Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scrollable resume preview with a paginated view that shows one page at a time, navigated via prev/next pill buttons.

**Architecture:** The full template renders once in the DOM. A fixed-height `overflow: hidden` container clips the view to one page. A CSS `translateY` on the inner resume element shifts the correct page into the window. `currentPage` state lives in `PreviewPage` and is passed as a prop to `ResumePreview`.

**Tech Stack:** React, inline styles (existing pattern)

---

## File Map

| File | Action | Change |
|------|--------|--------|
| `frontend/src/components/preview/ResumePreview.jsx` | Modify | Accept `currentPage` prop, clip container, translateY, remove page break lines |
| `frontend/src/pages/PreviewPage.jsx` | Modify | Remove scroll logic, pass `currentPage` to `ResumePreview`, simplify `goToPage` |

---

### Task 1: Update ResumePreview to clip and translate by page

**Files:**
- Modify: `frontend/src/components/preview/ResumePreview.jsx`

- [ ] **Step 1: Add `currentPage` prop and define constants**

Replace the component signature and add constants at the top of the file:

```jsx
const PAGE_HEIGHT_PX = 10.5 * 96   // already exists — no change needed
const PAGE_INSET = 48
```

Change the function signature from:
```jsx
export default function ResumePreview({ content, templateId, paletteIndex = 0, fontScale = 1.0, onBreaksChange }) {
```
to:
```jsx
export default function ResumePreview({ content, templateId, paletteIndex = 0, fontScale = 1.0, onBreaksChange, currentPage = 1 }) {
```

- [ ] **Step 2: Compute the translateY offset**

Add this derived value inside the component body, after the existing state/effect declarations:

```jsx
const translateY = -(currentPage - 1) * PAGE_HEIGHT_PX + (currentPage > 1 ? PAGE_INSET : 0)
```

- [ ] **Step 3: Replace the outer wrapper div**

The current outer wrapper is:
```jsx
<div
  ref={paperRef}
  style={{ width: '8.5in', minHeight: '11in', background: '#fff', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', position: 'relative', overflow: 'visible' }}
>
```

Replace it with a clip container wrapping an inner positioned div:
```jsx
<div style={{ width: '8.5in', height: `${PAGE_HEIGHT_PX}px`, overflow: 'hidden', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
  <div
    ref={paperRef}
    style={{ width: '8.5in', minHeight: '11in', background: '#fff', position: 'relative', transform: `translateY(${translateY}px)`, transition: 'transform 200ms ease' }}
  >
```

Close both divs at the end of the return — the inner content div and the new clip wrapper:
```jsx
      </div>   {/* inner resume div */}
    </div>     {/* clip container */}
```

- [ ] **Step 4: Remove page break line divs**

Delete this block entirely:
```jsx
{breaks.map((y) => (
  <div
    key={y}
    style={{ position: 'absolute', left: 0, right: 0, top: y, height: '1px', background: '#cbd5e1', pointerEvents: 'none', zIndex: 10 }}
  />
))}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/ResumePreview.jsx
git commit -m "feat: paginate preview — clip to one page via translateY"
```

---

### Task 2: Simplify PreviewPage to button-only page navigation

**Files:**
- Modify: `frontend/src/pages/PreviewPage.jsx`

- [ ] **Step 1: Remove scroll-related state and refs**

Remove these lines from the top of `PreviewPage`:
```jsx
const scrollRef    = useRef()
```
and the import of `useRef` if it's only used for `scrollRef` (check if `useRef` is used elsewhere — if not, remove it from the import).

Also remove `CONTAINER_PAD`:
```jsx
const CONTAINER_PAD = 24
```

- [ ] **Step 2: Remove `handleScroll`**

Delete this function entirely:
```jsx
const handleScroll = useCallback(() => {
  const el = scrollRef.current
  if (!el || breaks.length === 0) return
  const scrollTop = el.scrollTop - CONTAINER_PAD
  let page = 1
  for (let i = 0; i < breaks.length; i++) {
    if (scrollTop + (10.5 * 96) / 2 > breaks[i]) page = i + 2
  }
  setCurrentPage(page)
}, [breaks])
```

- [ ] **Step 3: Simplify `goToPage`**

Replace:
```jsx
const goToPage = useCallback((page) => {
  const el = scrollRef.current
  if (!el) return
  const target = page <= 1 ? 0 : breaks[page - 2] + CONTAINER_PAD
  el.scrollTo({ top: target, behavior: 'smooth' })
  setCurrentPage(page)
}, [breaks])
```

With:
```jsx
const goToPage = useCallback((page) => {
  setCurrentPage(page)
}, [])
```

- [ ] **Step 4: Update the scrollable area JSX**

The current scrollable area:
```jsx
<div
  ref={scrollRef}
  onScroll={handleScroll}
  style={{ overflow: 'auto', height: '100%', background: '#e2e8f0', padding: `${CONTAINER_PAD}px`, boxSizing: 'border-box' }}
>
  <ResumePreview
    content={content}
    templateId={templateId}
    paletteIndex={paletteIndex}
    fontScale={fontScale}
    onBreaksChange={handleBreaksChange}
  />
</div>
```

Replace with (no ref, no onScroll, no scroll overflow, fixed padding, pass `currentPage`):
```jsx
<div style={{ background: '#e2e8f0', padding: '24px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
  <ResumePreview
    content={content}
    templateId={templateId}
    paletteIndex={paletteIndex}
    fontScale={fontScale}
    onBreaksChange={handleBreaksChange}
    currentPage={currentPage}
  />
</div>
```

- [ ] **Step 5: Clean up unused imports**

Check the import line:
```jsx
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
```

If `useRef` is no longer used, change to:
```jsx
import { useState, useCallback } from 'react'
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/PreviewPage.jsx
git commit -m "feat: remove scroll navigation, drive preview pagination via currentPage prop"
```
