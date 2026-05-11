# Sections Widget Design

## Overview

A drag-and-drop Sections panel that lets users reorder resume sections and, for two-column templates, assign sections to left or right columns. The panel lives inside the existing Controls card on the Preview page, below the Download buttons.

---

## Placement

The Controls card in `PreviewPage.jsx` currently contains Color → Typography → Downloads (with a spacer flex-div between Typography and Downloads). The Sections panel is appended below Downloads, separated by a horizontal divider.

No new cards. No tabs. The Controls card grows vertically to accommodate it; the card is already `overflowY: auto`.

---

## Operations

- **Reorder**: drag a section row up or down within its list (single-column) or within its column (two-column)
- **Column assignment** (two-column templates only): drag a section from the Left column list into the Right column list, or vice versa
- **Locked sections**: `personal` is always locked at the top — no drag handle, lock icon shown, not draggable

Show/hide is out of scope.

---

## Store Changes (`useResumeStore.js`)

Two new top-level fields (alongside `templateId`, `fontSize`) — not inside `content`:

```js
leftColumnOrder: [],   // section IDs in left column, in order
rightColumnOrder: [],  // section IDs in right column, in order
```

These only carry meaning when the active template has `layoutType === 'two-column'`. They are empty by default and initialized on first two-column template selection.

**New actions:**

```js
// Replace current leftColumnOrder
setLeftColumnOrder: (order) => set({ leftColumnOrder: order }),

// Replace current rightColumnOrder  
setRightColumnOrder: (order) => set({ rightColumnOrder: order }),
```

**Updated `setTemplateId`:**

```js
setTemplateId: (templateId) => {
  set((s) => {
    const tpl = TEMPLATE_CONFIGS[templateId]
    const base = { templateId, paletteIndex: 0 }
    if (tpl?.layoutType !== 'two-column') return base
    // Initialize column orders from defaults only on first two-column template load.
    // Switching between two two-column templates reuses the existing column orders
    // (user may have customized them). Acceptable for v1.
    if (s.leftColumnOrder.length > 0 || s.rightColumnOrder.length > 0) return base
    return { ...base, leftColumnOrder: tpl.defaultColumns.left, rightColumnOrder: tpl.defaultColumns.right }
  })
},
```

**Updated `toggleOptionalSection`**: when adding a section while a two-column template is active, append to `rightColumnOrder`. When removing, filter from whichever column contains it:

```js
toggleOptionalSection: (key, enabled) =>
  set((s) => {
    const order = s.content.sectionOrder.filter((k) => k !== key)
    if (enabled) order.push(key)
    const isTwoCol = TEMPLATE_CONFIGS[s.templateId]?.layoutType === 'two-column'
    if (!isTwoCol) return { content: { ...s.content, sectionOrder: order } }
    const left  = enabled ? s.leftColumnOrder  : s.leftColumnOrder.filter(k => k !== key)
    const right = enabled ? [...s.rightColumnOrder, key] : s.rightColumnOrder.filter(k => k !== key)
    return { content: { ...s.content, sectionOrder: order }, leftColumnOrder: left, rightColumnOrder: right }
  }),
```

---

## Template JSON Config Changes

Add `defaultColumns` to the two two-column template JSON files.

**`modern-split.json`** and **`modern-sidebar.json`** — add:

```json
"defaultColumns": {
  "left": ["skills", "languages"],
  "right": ["summary", "experience", "education", "projects", "certifications", "awards", "custom"]
}
```

(`personal` is excluded — it is always locked and rendered outside the column system.)

---

## Two-Column Template Changes

Both `ModernSplitTemplate.jsx` and `ModernSidebarTemplate.jsx` currently hardcode which sections go in each column via exclusion lists (`!['personal', 'skills', 'languages'].includes(k)`). Replace this logic with store-driven lists.

**Pattern for both templates:**

```jsx
import { useResumeStore } from '../../../store/useResumeStore'

// Inside the component:
const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder)
const rightColumnOrder = useResumeStore(s => s.rightColumnOrder)
```

Then replace all hardcoded sidebar section rendering with a map over `leftColumnOrder`, and all hardcoded main-column rendering with a map over `rightColumnOrder`.

Each template's sidebar (left column) and main area (right column) already have their own distinct styles — those visual styles are unchanged. Only the source of which sections appear where changes from hardcoded to `leftColumnOrder`/`rightColumnOrder`.

`personal` contact info stays as a fixed block rendered before the column system in both templates.

---

## `SectionsPanel` Component

**File:** `frontend/src/components/preview/SectionsPanel.jsx`

Reads from store: `templateId`, `sectionOrder` (from `content`), `leftColumnOrder`, `rightColumnOrder`, `setLeftColumnOrder`, `setRightColumnOrder`.

Determines `isTwoColumn = TEMPLATE_CONFIGS[templateId]?.layoutType === 'two-column'`.

**Draggable sections list** (sections excluding `personal`):
- For single-column: one list using `sectionOrder` (excluding `personal`)
- For two-column: two labeled lists — "Left column" and "Right column" — using `leftColumnOrder` and `rightColumnOrder`

**Each section row:**
```
[drag-handle ⠿] [section name]
```
Lock row for `personal`:
```
[🔒] Personal
```

**HTML5 drag implementation:**
- `dragStart`: store `{ id, sourceCol }` in component state ref (not React state — no re-render needed)
- `dragOver`: `e.preventDefault()` on valid drop targets; highlight drop target row
- `drop` on a row in the same column: reorder within that column's array
- `drop` on a row in the other column (two-column only): remove from source array, insert at drop position in target array

**Display names for section IDs:**
```js
const SECTION_LABELS = {
  summary: 'Summary', experience: 'Experience', education: 'Education',
  skills: 'Skills', projects: 'Projects', certifications: 'Certifications',
  languages: 'Languages', awards: 'Awards', custom: 'Custom',
}
```

---

## PreviewPage Wiring

In `PreviewPage.jsx`, inside the Controls card, after `<DownloadButtons />`:

```jsx
import SectionsPanel from '../components/preview/SectionsPanel'

{/* after DownloadButtons */}
<div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
<SectionsPanel />
```

---

## What Is NOT In Scope

- Show/hide toggles
- Edit/delete icons per section row
- Wizard step integration
- Persistence to localStorage/backend (Zustand in-memory only, same as current)
