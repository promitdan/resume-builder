# Sub-Item Page Splits Design

**Date:** 2026-04-27
**Status:** Approved

## Problem

The current page-split system operates at two levels: section → item. A whole item (e.g. a job entry, a skills block) either fits on a page or moves entirely to the next. This wastes space — a Skills section with 20 tags may all move to page 2 even though 15 tags would have fit on page 1. Similarly, a job entry with 5 bullets may move entirely to page 2 even though 3 bullets fit.

## Goal

Split at the finest meaningful granularity:
- **Experience, Education, Projects**: split at individual bullet level within an entry
- **Skills**: split at individual skill tag level
- Continuation pages show section headers with "(cont.)" suffix
- Entry headers (company, role, dates) are **not** repeated on continuation pages — bullets continue directly

## Architecture Overview

The system stays data-slicing (re-render a fresh React template instance per page with sliced content). DOM slicing (à la BetterCV) was considered and rejected because it bypasses React and breaks inline editing.

The hierarchy expands from 2 levels to 3:

```
data-section="experience"
  data-item="exp-0"              ← job entry container
    data-subitem="bullet-0"      ← individual bullet
    data-subitem="bullet-1"
  data-item="exp-1"
    data-subitem="bullet-0"
```

Skills use flat `data-item` tags (no subitems needed since tags are the leaf unit):

```
data-section="skills"
  data-item="sk-{groupIndex}-{itemIndex}"   ← individual skill tag
```

---

## Section 1: Template Changes

### Bullet-bearing sections (Experience, Education, Projects)

Each bullet `<div>` gets `data-subitem="bullet-{bi}"` where `bi` is the 0-based index within that entry's bullets array. The outer `data-item` container stays unchanged.

```jsx
// before
<div key={bi} style={{ display: 'flex', ... }}>
  <span>•</span>
  <div><RichTextEditor ... /></div>
</div>

// after
<div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', ... }}>
  <span>•</span>
  <div><RichTextEditor ... /></div>
</div>
```

Entries without bullets (e.g. an education entry with no bullet points) have no `data-subitem` children and remain atomic — current behavior unchanged.

### Skills

Each skill tag span gets `data-item="sk-{gi}-{ii}"`:

```jsx
// before
<span key={`${si}-${ii}`} style={{ ... }}>
  <InlineEditor ... />
</span>

// after
<span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ ... }}>
  <InlineEditor ... />
</span>
```

### Continuation rendering

Two independent flags flow into templates, serving different purposes:

**`_isContinuation: true`** on the first entry of a section — signals the section header should show "(cont.)". Set by `sliceContent` when `isContinuation` is true on the page assignment. Only ever set on the first entry of the array.

```jsx
{sectionLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History')}
```

**`_bulletContinuation: true`** on an individual entry — signals this entry starts mid-bullets; suppress the entry header (company, role, dates):

```jsx
{!e._bulletContinuation && (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div>{e.company}</div>
    <div>{e.startDate} – {e.endDate}</div>
  </div>
)}
{!e._bulletContinuation && (e.role || e.location) && (
  <div>{e.role} · {e.location}</div>
)}
{e.bullets?.filter(Boolean).map((b, bi) => (
  <div key={bi} data-subitem={`bullet-${bi}`}>...</div>
))}
```

These are independent and can both be true on the same entry: first entry of a continued section that is also mid-bullets → show "(cont.)" section header AND suppress the entry header.

For skills, `_isContinuation` on the first group signals "(cont.)" in the section label.

**Scope:** All 17 templates need these changes.

---

## Section 2: Measurement (`measureSectionsInEl`)

Items are extended to include subitems and a `headerHeight`:

```js
// current
items: [{ id, top, bottom, height }]

// new
items: [{
  id,
  top, bottom, height,
  headerHeight,   // distance from item.top to first subitem.top (company/role/dates block)
  subitems: [     // empty array if no data-subitem children
    { id: "bullet-0", top, bottom, height },
    { id: "bullet-1", top, bottom, height },
  ]
}]
```

`headerHeight` is computed as `firstSubitem.top - item.top`. If no subitems, `headerHeight` defaults to `item.height` (whole item is the header).

Skills items have no subitems — they are measured as regular items (existing path).

---

## Section 3: Distribution Algorithm (`distributePages`)

### Page assignment data structure change

`items` in a page assignment entry changes from a flat `string[]` to a richer array:

```js
// before
{ sectionId: "experience", items: ["exp-0", "exp-1"], isContinuation: false }

// after
{ sectionId: "experience", isContinuation: false, items: [
  { id: "exp-0", subitems: null },
  // subitems: null → full item included (no split)
  { id: "exp-1", subitems: ["bullet-0", "bullet-1"], isBulletContinuation: false },
  // subitems: [...] → only these bullets included
  // isBulletContinuation: true → sets _bulletContinuation on entry in sliceContent
  //   → template suppresses entry header (company, role, dates)
]}
```

### Distribution loop changes

**Atomic items** (subitems array is empty): unchanged. Place whole item or flush to next page.

**Items with subitems**: iterate subitems one by one.

- The **minimum placement unit** for the first subitem of an entry is `item.headerHeight + firstSubitem.height` — the entry header must never be orphaned without at least one bullet.
- Subsequent subitems are placed individually.
- If a subitem doesn't fit: flush the current page, continue on the next page with `isBulletContinuation: true` on a new entry assignment for the same item.
- Safety: an oversized single item (exceeds full page) stays on the current (empty) page to prevent infinite loops — existing invariant preserved.

```
for each section:
  for each item:
    if item.subitems is empty:
      → atomic item logic (unchanged)
    else:
      for each subitem:
        minHeight = isFirstSubitem ? item.headerHeight + subitem.height : subitem.height
        if wouldFlush:
          flush()
          open new itemEntry with isBulletContinuation: true
        add subitem to current itemEntry
```

---

## Section 4: Content Slicing (`sliceContent`)

### Bullet-level splits

For items with a non-null `subitems` assignment:

```js
const subitemSet = new Set(assignment.subitems)  // e.g. Set(["bullet-2", "bullet-3"])
const slicedEntry = {
  ...fullEntry,
  bullets: fullEntry.bullets.filter((_, bi) => subitemSet.has(`bullet-${bi}`)),
  _bulletContinuation: assignment.isBulletContinuation,
}
```

Items with `subitems: null` are included whole — no reconstruction.

Section-level `isContinuation` still marks `_isContinuation: true` on the first entry of the array (signals section header "(cont.)") — unchanged from current behavior.

Both flags are independent and can be true simultaneously on the first entry: `_isContinuation` (section continues) and `_bulletContinuation` (entry is mid-bullets).

### Skills splits

Skill tag IDs are `sk-{gi}-{ii}`. Parse them to reconstruct the nested group structure:

```js
// assigned: ["sk-0-0", "sk-0-1", "sk-1-0"]
// reconstruct:
// [
//   { ...group0, items: ["TypeScript", "Python"] },
//   { ...group1, items: ["Go"] },
// ]
```

Empty groups after filtering are dropped. The first group in the reconstructed array gets `_isContinuation: true` when `isContinuation` is set on the section assignment.

---

## Section 5: What Does NOT Change

- `measureAndDistribute` orchestration — no changes needed
- Two-column distribution path — no changes needed
- `PAGE_CONTENT_MAX`, `PAGE_GAP`, `CONTENT_HEIGHT` constants — unchanged
- `ResumePreview.jsx` render loop — no changes needed
- The hidden measurement container mechanism — unchanged
- `ResizeObserver` recompute loop — unchanged

---

## Affected Files

| File | Change |
|------|--------|
| `frontend/src/utils/pageLayout.js` | Extend `measureSectionsInEl` for subitems; extend `distributePages` for subitem distribution; extend `sliceContent` for bullet/skills reconstruction |
| All 17 template files | Add `data-subitem` to bullets; add `data-item` to skill tags; add entry-level `_isContinuation` check; add "(cont.)" to section labels |

---

## Out of Scope

- Languages section: currently rendered as plain text or simple lists without bullets in most templates. Not included in this change. Can follow the same pattern later if needed.
- Custom sections: atomic for now.
- Mid-paragraph text splitting (true word-wrap across pages): not addressed. Single bullets that overflow a full page stay intact on one page.
