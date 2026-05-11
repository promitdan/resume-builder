# Sub-Item Page Splits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split experience entries at the bullet level and skills sections at the individual tag level during page layout, so page 1 uses all available space before overflow continues on page 2.

**Architecture:** The page-split system already has a 2-level hierarchy (section → item). This plan extends it to 3 levels (section → item → subitem) for bullets, and adds `data-item` IDs to skill tags. `pageLayout.js` handles all measurement, distribution, and slicing logic; templates only need data attributes and two continuation flags (`_isContinuation` for section header "(cont.)", `_bulletContinuation` to suppress the entry header on mid-bullet continuation pages).

**Tech Stack:** React 18, Vite, Vitest — all changes are in `frontend/src/`.

---

## File Map

| File | Change |
|------|--------|
| `frontend/src/utils/pageLayout.js` | Extend `measureSectionsInEl`, `distributePages`, `sliceContent` |
| All 17 template `.jsx` files | Add `data-subitem` to bullets, `data-item` to skill tags, `(cont.)` labels, `_bulletContinuation` guard |

---

## Task 1: Extend `measureSectionsInEl` to capture subitems

**Files:**
- Modify: `frontend/src/utils/pageLayout.js:6-32`

- [ ] **Step 1: Replace `measureSectionsInEl`**

Replace the entire function (lines 6–32) with:

```js
function measureSectionsInEl(el, containerEl) {
  const ref = containerEl.getBoundingClientRect()
  const sections = []
  for (const sEl of el.querySelectorAll('[data-section]')) {
    const sr   = sEl.getBoundingClientRect()
    const sTop = sr.top - ref.top
    const items = []
    for (const iEl of sEl.querySelectorAll('[data-item]')) {
      const ir      = iEl.getBoundingClientRect()
      const itemTop = ir.top - ref.top
      const subitems = []
      for (const siEl of iEl.querySelectorAll('[data-subitem]')) {
        const sir = siEl.getBoundingClientRect()
        subitems.push({
          id:     siEl.dataset.subitem,
          top:    sir.top    - ref.top,
          bottom: sir.bottom - ref.top,
          height: sir.height,
        })
      }
      items.push({
        id:           iEl.dataset.item,
        top:          itemTop,
        bottom:       ir.bottom - ref.top,
        height:       ir.height,
        headerHeight: subitems.length > 0 ? subitems[0].top - itemTop : ir.height,
        subitems,
      })
    }
    sections.push({
      id:           sEl.dataset.section,
      top:          sTop,
      bottom:       sr.bottom - ref.top,
      height:       sr.height,
      headerHeight: items.length > 0 ? items[0].top - sTop : sr.height,
      items,
    })
  }
  return sections
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/utils/pageLayout.js
git commit -m "feat: measure data-subitem elements and item headerHeight in measureSectionsInEl"
```

---

## Task 2: Extend `distributePages` for subitem-level splits

**Files:**
- Modify: `frontend/src/utils/pageLayout.js:38-90`

- [ ] **Step 1: Replace `distributePages`**

Replace the entire exported function (lines 38–90) with:

```js
export function distributePages(sections, firstPageMaxBottom, subsequentPageAvail) {
  const pages   = []
  let current   = []
  let used      = 0
  let isFirst   = true
  const seen    = new Set()

  const flush = () => {
    current.forEach(e => seen.add(e.sectionId))
    pages.push(current)
    current = []
    used    = 0
    isFirst = false
  }

  for (const sec of sections) {
    if (sec.items.length === 0) {
      // Atomic section — intentional: allow overflow rather than emitting an empty page
      const wouldFlush = isFirst
        ? sec.bottom > firstPageMaxBottom && current.length > 0
        : used > 0 && used + sec.height > subsequentPageAvail
      if (wouldFlush) flush()
      current.push({ sectionId: sec.id, items: null, isContinuation: seen.has(sec.id) })
      if (!isFirst) used += sec.height
      continue
    }

    // Section with distributable items
    let entry = null
    for (const item of sec.items) {
      if (item.subitems.length === 0) {
        // Atomic item — original behavior
        const hdr = entry ? 0 : sec.headerHeight
        const wouldFlush = isFirst
          ? item.bottom > firstPageMaxBottom && current.length > 0
          : used > 0 && used + hdr + item.height > subsequentPageAvail
        if (wouldFlush) {
          flush()
          entry = null
        }
        if (!entry) {
          entry = { sectionId: sec.id, items: [], isContinuation: seen.has(sec.id) }
          current.push(entry)
          if (!isFirst) used += sec.headerHeight
        }
        entry.items.push({ id: item.id, subitems: null, isBulletContinuation: false })
        if (!isFirst) used += item.height
      } else {
        // Item with subitems — split at subitem boundary
        let itemEntry = null
        for (let si = 0; si < item.subitems.length; si++) {
          const subitem      = item.subitems[si]
          const needsSecHdr  = !entry
          const needsItemHdr = !itemEntry && si === 0
          const wouldFlush = isFirst
            ? subitem.bottom > firstPageMaxBottom && current.length > 0
            : used > 0 && used
                + (needsSecHdr  ? sec.headerHeight  : 0)
                + (needsItemHdr ? item.headerHeight : 0)
                + subitem.height > subsequentPageAvail
          if (wouldFlush) {
            flush()
            entry     = null
            itemEntry = null
          }
          if (!entry) {
            entry = { sectionId: sec.id, items: [], isContinuation: seen.has(sec.id) }
            current.push(entry)
            if (!isFirst) used += sec.headerHeight
          }
          if (!itemEntry) {
            const isBulletContinuation = si > 0
            itemEntry = { id: item.id, subitems: [], isBulletContinuation }
            entry.items.push(itemEntry)
            if (!isFirst && !isBulletContinuation) used += item.headerHeight
          }
          itemEntry.subitems.push(subitem.id)
          if (!isFirst) used += subitem.height
        }
      }
    }
  }

  if (current.length > 0) pages.push(current)
  return pages
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/utils/pageLayout.js
git commit -m "feat: split experience entries at bullet level in distributePages"
```

---

## Task 3: Extend `sliceContent` for bullet and skills reconstruction

**Files:**
- Modify: `frontend/src/utils/pageLayout.js:97-127`

- [ ] **Step 1: Replace `sliceContent`**

Replace the entire exported function (lines 97–127) with:

```js
export function sliceContent(fullContent, pageAssignment, pageIndex) {
  const slice       = { ...fullContent }
  const assignedIds = new Set(pageAssignment.map(a => a.sectionId))

  // Zero out all array sections; restore only what's assigned to this page
  ARRAY_SECTIONS.forEach(k => { slice[k] = [] })

  // Hide summary if not on this page
  if (!assignedIds.has('summary')) {
    slice.personal = { ...slice.personal, summary: '' }
  }

  for (const { sectionId, items, isContinuation } of pageAssignment) {
    if (sectionId === 'summary') continue
    if (!ARRAY_SECTIONS.includes(sectionId)) continue

    if (items === null) {
      // Atomic section (no data-item children in template)
      slice[sectionId] = fullContent[sectionId] ?? []
    } else if (sectionId === 'skills') {
      // Skills: reconstruct nested group structure from sk-{gi}-{ii} IDs
      const assignedSkillIds = new Set(items.map(a => a.id))
      const reconstructed = (fullContent.skills ?? []).map((group, gi) => ({
        ...group,
        items: (group.items ?? []).filter((_, ii) => assignedSkillIds.has(`sk-${gi}-${ii}`)),
      })).filter(group => group.items.length > 0)
      if (isContinuation && reconstructed.length > 0) {
        reconstructed[0] = { ...reconstructed[0], _isContinuation: true }
      }
      slice.skills = reconstructed
    } else {
      // Sections with distributable items (experience, education, projects, etc.)
      const itemMap  = new Map(items.map(a => [a.id, a]))
      const fullArr  = fullContent[sectionId] ?? []
      const filtered = fullArr
        .filter(item => itemMap.has(item.id))
        .map(item => {
          const assignment = itemMap.get(item.id)
          if (assignment.subitems === null) return item
          const subitemSet = new Set(assignment.subitems)
          return {
            ...item,
            bullets: (item.bullets ?? []).filter((_, bi) => subitemSet.has(`bullet-${bi}`)),
            _bulletContinuation: assignment.isBulletContinuation,
          }
        })
      slice[sectionId] = isContinuation && filtered.length > 0
        ? [{ ...filtered[0], _isContinuation: true }, ...filtered.slice(1)]
        : filtered
    }
  }

  return slice
}
```

- [ ] **Step 2: Run existing tests to catch regressions**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/utils/pageLayout.js
git commit -m "feat: reconstruct bullet-level and skills slices in sliceContent"
```

---

## Task 4: Update Classic family templates

**Files:**
- Modify: `frontend/src/components/preview/templates/ClassicTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ClassicAcademicTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ClassicFormalTemplate.jsx`

### ClassicTemplate.jsx

- [ ] **Step 1: Add `data-subitem` to experience bullets**

Find (around line 107):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.6', color: '#333', marginBottom: '3px' }}>
```

Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.6', color: '#333', marginBottom: '3px' }}>
```

- [ ] **Step 2: Guard experience entry header with `_bulletContinuation`**

Find (around line 88):
```jsx
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mainText, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```

Replace with:
```jsx
                {!e._bulletContinuation && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                )}
                {!e._bulletContinuation && (e.role || e.location) && (
                  <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mainText, margin: '2px 0 5px' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.role && e.location ? ' · ' : ''}
                    <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                  </div>
                )}
```

- [ ] **Step 3: Add `(cont.)` to experience section label**

Find (around line 87):
```jsx
              {sectionLabel('Work History')}
```

Replace with:
```jsx
              {sectionLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History')}
```

- [ ] **Step 4: Add `data-item` to skill tags and `(cont.)` to skills label**

Find (around line 71):
```jsx
              {sectionLabel('Core Competencies')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((sk, si) =>
                    (sk.items ?? []).map((item, ii) => (
                      <span key={`${si}-${ii}`} style={{ display: 'inline-block', background: '#f2f2f2', border: `1px solid ${c.dividerColor}`, borderRadius: '3px', padding: '4px 12px', fontSize: 'var(--resume-meta)', color: '#333' }}>
```

Replace with:
```jsx
              {sectionLabel(skills[0]?._isContinuation ? 'Core Competencies (cont.)' : 'Core Competencies')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((sk, si) =>
                    (sk.items ?? []).map((item, ii) => (
                      <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ display: 'inline-block', background: '#f2f2f2', border: `1px solid ${c.dividerColor}`, borderRadius: '3px', padding: '4px 12px', fontSize: 'var(--resume-meta)', color: '#333' }}>
```

### ClassicAcademicTemplate.jsx

- [ ] **Step 5: Add `data-subitem` to experience bullets**

Find (around line 125):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ paddingLeft: '18px', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginTop: '3px' }}>
```

Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ paddingLeft: '18px', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginTop: '3px' }}>
```

- [ ] **Step 6: Guard experience entry header and update label**

Find (around line 110):
```jsx
            {band('Experience')}
            <div style={{ padding: `0 ${SP}` }}>
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Diamond />
                    <span style={{ fontWeight: 700, marginRight: '2px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    </span>
                    {e.company && <span style={{ fontWeight: 700 }}>
                      {e.role ? ', ' : ''}<InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </span>}
                    <span style={{ flex: 1, borderBottom: '1px dotted #aaa', margin: '0 8px 3px', minWidth: '16px' }} />
                    <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--resume-meta)', color: c.mutedText }}>{dateStr(e)}</span>
                  </div>
```

Replace with:
```jsx
            {band(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            <div style={{ padding: `0 ${SP}` }}>
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <Diamond />
                      <span style={{ fontWeight: 700, marginRight: '2px' }}>
                        <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      </span>
                      {e.company && <span style={{ fontWeight: 700 }}>
                        {e.role ? ', ' : ''}<InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </span>}
                      <span style={{ flex: 1, borderBottom: '1px dotted #aaa', margin: '0 8px 3px', minWidth: '16px' }} />
                      <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--resume-meta)', color: c.mutedText }}>{dateStr(e)}</span>
                    </div>
                  )}
```

- [ ] **Step 7: Add `data-item` to skills tags and `(cont.)` to skills label**

Find (around line 167):
```jsx
          <div key={key} data-section="skills">
            {band('Skills')}
```
And find the skills item span (around line 173):
```jsx
                      <span key={`${si}-${ii}`} style={{
```

Replace label:
```jsx
          <div key={key} data-section="skills">
            {band(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
```
And add `data-item` to the span:
```jsx
                      <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{
```

### ClassicFormalTemplate.jsx

- [ ] **Step 8: Add `data-subitem` to experience bullets**

Find (around line 98):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginBottom: '2px' }}>
```

Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginBottom: '2px' }}>
```

- [ ] **Step 9: Guard experience entry header and update label**

Find (around line 78):
```jsx
              {sectionHeader('Experience')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ paddingLeft: IND, marginBottom: l.itemSpacing }}>
                  {/* ROLE | date */}
                  <div style={{ fontFamily: ty.bodyFont, fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '2px' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    </span>
                    {e.role && dateStr(e) && (
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> | {dateStr(e)}</span>
                    )}
                  </div>
                  {/* Company */}
                  {e.company && (
                    <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '4px' }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                    </div>
                  )}
```

Replace with:
```jsx
              {sectionHeader(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ paddingLeft: IND, marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                    <div style={{ fontFamily: ty.bodyFont, fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '2px' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      </span>
                      {e.role && dateStr(e) && (
                        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> | {dateStr(e)}</span>
                      )}
                    </div>
                  )}
                  {!e._bulletContinuation && e.company && (
                    <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '4px' }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                    </div>
                  )}
```

- [ ] **Step 10: Add `data-item` to skills tags and `(cont.)` to skills label**

Find (around line 132):
```jsx
            <div key={key} data-section="skills">
              {sectionHeader('Skills')}
```
And find the skills item span:
```jsx
                          <span key={`${si}-${ii}`} style={{
```
(it's inside `skills.filter(...).map((sk, si) => (sk.items ?? []).map((item, ii) => (...))`

Replace label:
```jsx
            <div key={key} data-section="skills">
              {sectionHeader(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
```
Add `data-item` — find the inner span and add the attribute:
```jsx
                          <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{
```

- [ ] **Step 11: Commit**

```bash
git add frontend/src/components/preview/templates/ClassicTemplate.jsx \
        frontend/src/components/preview/templates/ClassicAcademicTemplate.jsx \
        frontend/src/components/preview/templates/ClassicFormalTemplate.jsx
git commit -m "feat: add subitem attrs and continuation guards to Classic family templates"
```

---

## Task 5: Update Minimal family templates

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/MinimalSerifTemplate.jsx`

### MinimalTemplate.jsx

- [ ] **Step 1: Add `data-subitem` to experience bullets**

Find (around line 112):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.7', color: '#444' }}>
```
Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.7', color: '#444' }}>
```

- [ ] **Step 2: Guard entry header and update label**

Find (around line 92):
```jsx
              {sectionLabel('Experience', key === visibleKeys[0])}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: 'var(--resume-meta)', color: '#999' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-body)', color: '#666', marginBottom: '8px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```
Replace with:
```jsx
              {sectionLabel(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience', key === visibleKeys[0])}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: c.headingText }}>
                        <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </div>
                      <div style={{ fontSize: 'var(--resume-meta)', color: '#999' }}>
                        <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                        {e.startDate && (e.current || e.endDate) && ' – '}
                        {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                      </div>
                    </div>
                  )}
                  {!e._bulletContinuation && (e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-body)', color: '#666', marginBottom: '8px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```

- [ ] **Step 3: Add `data-item` to skill tags and `(cont.)` to skills label**

Find (around line 76):
```jsx
              {sectionLabel('Skills', key === visibleKeys[0])}
```
Replace with:
```jsx
              {sectionLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills', key === visibleKeys[0])}
```
Find the skill tag span:
```jsx
                      <span key={`${si}-${ii}`} style={{
```
Add `data-item`:
```jsx
                      <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{
```

### MinimalBoxedTemplate.jsx

- [ ] **Step 4: Add `data-subitem` to experience bullets**

Find (around line 118):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
```

- [ ] **Step 5: Guard entry header and update label**

Find (around line 107):
```jsx
            {sectionHeader('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                  {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, whiteSpace: 'nowrap', marginLeft: '8px' }}>{dateStr(e)}</div>}
                </div>
                {e.location && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}><InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></div>}
```
Replace with:
```jsx
            {sectionHeader(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.company && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                    </div>
                    {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, whiteSpace: 'nowrap', marginLeft: '8px' }}>{dateStr(e)}</div>}
                  </div>
                )}
                {!e._bulletContinuation && e.location && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}><InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></div>}
```

- [ ] **Step 6: Add `data-item` to skill tags and `(cont.)` to skills label**

Find (around line 45):
```jsx
          {sectionHeader('Skills')}
          {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
```
Replace with:
```jsx
          {sectionHeader(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
```
Find the skill tag span inside the map:
```jsx
                    <span key={`${si}-${ii}`} style={{
```
Add `data-item`:
```jsx
                    <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{
```

### MinimalColumnsTemplate.jsx

- [ ] **Step 7: Add `data-subitem` to experience bullets**

Find (around line 108):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```

- [ ] **Step 8: Guard entry header and update label**

Find (around line 99):
```jsx
            {sectionHeader('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                {dateStr(e) && <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '4px' }}>{dateStr(e)}</div>}
                {e.location && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}><InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></div>}
```
Replace with:
```jsx
            {sectionHeader(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                )}
                {!e._bulletContinuation && dateStr(e) && <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '4px' }}>{dateStr(e)}</div>}
                {!e._bulletContinuation && e.location && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}><InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></div>}
```

- [ ] **Step 9: Add `data-item` to skill tags and `(cont.)` to skills label**

Find (around line 51):
```jsx
          {sectionHeader('Skills')}
            {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
```
Replace with:
```jsx
          {sectionHeader(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
            {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
```
Find the skill tag span:
```jsx
                    <span key={`${si}-${ii}`} style={{
```
Add `data-item`:
```jsx
                    <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{
```

### MinimalSerifTemplate.jsx

- [ ] **Step 10: Add `data-subitem` to experience bullets**

Find (around line 90):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
```

- [ ] **Step 11: Guard entry header and update label**

Find (around line 76):
```jsx
            {sectionHeader('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', fontStyle: 'italic' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  </div>
                  {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>{dateStr(e)}</div>}
                </div>
                <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '4px' }}>
                  {e.company && <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>}
                  {e.company && e.location ? ', ' : ''}
                  {e.location && <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>}
                </div>
```
Replace with:
```jsx
            {sectionHeader(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', fontStyle: 'italic' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    </div>
                    {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>{dateStr(e)}</div>}
                  </div>
                )}
                {!e._bulletContinuation && (
                  <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '4px' }}>
                    {e.company && <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>}
                    {e.company && e.location ? ', ' : ''}
                    {e.location && <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>}
                  </div>
                )}
```

- [ ] **Step 12: Add `data-item` to skill tags and `(cont.)` to skills label**

Find (around line 122):
```jsx
            {sectionHeader('Skills')}
```
Replace with:
```jsx
            {sectionHeader(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
```
Find the skill tag span (inside `skills.filter(...).map((sk, si) => (sk.items ?? []).map((item, ii) => (...)))`):
```jsx
                      <span key={`${si}-${ii}`} style={{
```
Add `data-item`:
```jsx
                      <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{
```

- [ ] **Step 13: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalTemplate.jsx \
        frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx \
        frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx \
        frontend/src/components/preview/templates/MinimalSerifTemplate.jsx
git commit -m "feat: add subitem attrs and continuation guards to Minimal family templates"
```

---

## Task 6: Update Executive family templates

**Files:**
- Modify: `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx`

### ExecutiveTemplate.jsx

- [ ] **Step 1: Add `data-subitem` to experience bullets**

Find (around line 113):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
```
Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
```

- [ ] **Step 2: Guard entry header and update label**

Find (around line 93):
```jsx
              {sectionLabel('Work History', key === visibleMainKeys[0] && !personal.summary)}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: 'var(--resume-meta)', color: '#888', fontWeight: '500' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-meta)', fontWeight: '600', color: '#4a5568', margin: '2px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```
Replace with:
```jsx
              {sectionLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History', key === visibleMainKeys[0] && !personal.summary)}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: c.headingText }}>
                        <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </div>
                      <div style={{ fontSize: 'var(--resume-meta)', color: '#888', fontWeight: '500' }}>
                        <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                        {e.startDate && (e.current || e.endDate) && ' – '}
                        {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                      </div>
                    </div>
                  )}
                  {!e._bulletContinuation && (e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-meta)', fontWeight: '600', color: '#4a5568', margin: '2px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```

- [ ] **Step 3: Add `data-item` to skill tags and `(cont.)` to skills label**

ExecutiveTemplate has skills in a separate section outside `sectionOrder`. Find the skills section label and tags. Find:
```jsx
              {sectionLabel('Skills')}
```
(or similar — check the actual skills section in ExecutiveTemplate)
And find the skill item span. Add `data-item={`sk-${si}-${ii}`}` and update label with `(cont.)`.

### ExecutiveBandTemplate.jsx

- [ ] **Step 4: Add `data-subitem` to experience bullets**

Find (around line 104):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```

- [ ] **Step 5: Guard entry header and update label**

Find (around line 95):
```jsx
            <Badge>Experience</Badge>
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  {e.location && <span style={{ fontWeight: 400, color: c.mutedText }}>, <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
                {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.dateMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', margin: '2px 0 4px' }}>{dateStr(e)}</div>}
```
Replace with:
```jsx
            <Badge>{experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience'}</Badge>
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                    {e.location && <span style={{ fontWeight: 400, color: c.mutedText }}>, <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                  </div>
                )}
                {!e._bulletContinuation && dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.dateMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', margin: '2px 0 4px' }}>{dateStr(e)}</div>}
```

- [ ] **Step 6: Add `data-item` to skill tags and `(cont.)` to skills label**

Find (around line 167):
```jsx
            <Badge>Skills</Badge>
```
Replace with:
```jsx
            <Badge>{skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills'}</Badge>
```
Find the skill tag span inside the skills map and add `data-item={`sk-${si}-${ii}`}`.

### ExecutiveSidebarTemplate.jsx

- [ ] **Step 7: Add `data-subitem` to experience bullets**

Find (around line 109):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```

- [ ] **Step 8: Guard entry header and update label**

Find (around line 101):
```jsx
            <SectionHeader>Experience</SectionHeader>
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}>{dateStr(e)}</div>}
```
Replace with:
```jsx
            <SectionHeader>{experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience'}</SectionHeader>
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                )}
                {!e._bulletContinuation && dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}>{dateStr(e)}</div>}
```

- [ ] **Step 9: Update skills in sidebar — replace flat `allSkillItems` with indexed rendering and add `(cont.)`**

`ExecutiveSidebarTemplate` uses `allSkillItems` (a flat array without group indices). Change the skills rendering to use group+item indices so `data-item` IDs are correct.

Find (around line 53):
```jsx
      {hasSkills && (
        <div data-section="skills">
          <div style={{ height: '1px', background: c.dividerColor, margin: '16px 0' }} />
          {sidebarLabel('Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {allSkillItems.map((item, ii) => (
              <li key={ii} style={{ paddingLeft: '14px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
```
Replace with:
```jsx
      {hasSkills && (
        <div data-section="skills">
          <div style={{ height: '1px', background: c.dividerColor, margin: '16px 0' }} />
          {sidebarLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {skills.flatMap((sk, gi) => (sk.items ?? []).map((item, ii) => (
              <li key={`${gi}-${ii}`} data-item={`sk-${gi}-${ii}`} style={{ paddingLeft: '14px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                {item}
              </li>
            )))}
          </ul>
        </div>
      )}
```

Also remove the `allSkillItems` const declaration if it exists at the top of the component (it's no longer needed).

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/preview/templates/ExecutiveTemplate.jsx \
        frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx \
        frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx
git commit -m "feat: add subitem attrs and continuation guards to Executive family templates"
```

---

## Task 7: Update Modern family templates

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ModernSidebarTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ModernSplitTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ModernBannerTemplate.jsx`

### ModernTemplate.jsx

- [ ] **Step 1: Add `data-subitem` to experience bullets**

Find (around line 144):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#333', marginBottom: '2px' }}>
```
Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#333', marginBottom: '2px' }}>
```

- [ ] **Step 2: Guard entry header and update label**

Find (around line 124):
```jsx
              {mainLabel('Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: 'var(--resume-meta)', color: '#888' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```
Replace with:
```jsx
              {mainLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                        <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </div>
                      <div style={{ fontSize: 'var(--resume-meta)', color: '#888' }}>
                        <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                        {e.startDate && (e.current || e.endDate) && ' – '}
                        {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                      </div>
                    </div>
                  )}
                  {!e._bulletContinuation && (e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
```

- [ ] **Step 3: Add `data-item` to skill tags (sidebar) and `(cont.)` to skills label**

Find (around line 77):
```jsx
          {sidebarLabel('Skills')}
          <ul ...>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} ...>
```
Replace label and add `data-item`:
```jsx
          {sidebarLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          <ul ...>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} ...>
```

### ModernSidebarTemplate.jsx

- [ ] **Step 4: Add `data-subitem` to experience bullets**

Find (around line 156):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```

- [ ] **Step 5: Guard entry header and update label**

Find (around line 143):
```jsx
            {mainLabel('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontSize: 'var(--resume-label)', color: c.mutedText, marginBottom: '2px' }}>{dateStr(e)}</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                </div>
                {e.company && (
                  <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '5px' }}>
                    <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                  </div>
                )}
```
Replace with:
```jsx
            {mainLabel(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && <div style={{ fontSize: 'var(--resume-label)', color: c.mutedText, marginBottom: '2px' }}>{dateStr(e)}</div>}
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  </div>
                )}
                {!e._bulletContinuation && e.company && (
                  <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '5px' }}>
                    <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                  </div>
                )}
```

- [ ] **Step 6: Add `data-item` to skill tags (sidebar) and `(cont.)` to skills label**

Find (around line 78):
```jsx
          {sidebarLabel('Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative', color: c.sidebarText }}>
```
Replace with:
```jsx
          {sidebarLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative', color: c.sidebarText }}>
```

### ModernSplitTemplate.jsx

- [ ] **Step 7: Add `data-subitem` to experience bullets**

Find (around line 158):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```

- [ ] **Step 8: Guard entry header and update label**

Find (around line 147):
```jsx
            {mainLabel('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span style={{ fontWeight: 700 }}>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                <div style={{ fontSize: '12px', color: c.accentColor, fontStyle: 'italic', marginBottom: '5px' }}>
                  {dateStr(e)}
                  {e.location && <span style={{ color: c.mutedText, fontStyle: 'normal' }}> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
```
Replace with:
```jsx
            {mainLabel(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span style={{ fontWeight: 700 }}>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                )}
                {!e._bulletContinuation && (
                  <div style={{ fontSize: '12px', color: c.accentColor, fontStyle: 'italic', marginBottom: '5px' }}>
                    {dateStr(e)}
                    {e.location && <span style={{ color: c.mutedText, fontStyle: 'normal' }}> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                  </div>
                )}
```

- [ ] **Step 9: Add `data-item` to skill tags (sidebar) and `(cont.)` to skills label**

Find (around line 37):
```jsx
          {sidebarLabel('Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative' }}>
```
Replace with:
```jsx
          {sidebarLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative' }}>
```

### ModernBannerTemplate.jsx

- [ ] **Step 10: Add `data-subitem` to experience bullets**

Find (around line 187):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
```

- [ ] **Step 11: Guard entry header and update label**

Find (around line 176):
```jsx
            {rightLabel('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span style={{ fontWeight: 400 }}> - <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                <div style={{ fontSize: '12px', color: c.accentColor, fontStyle: 'italic', marginBottom: '4px' }}>
                  {dateStr(e)}
                  {e.location && <span style={{ color: c.mutedText, fontStyle: 'normal' }}> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
```
Replace with:
```jsx
            {rightLabel(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span style={{ fontWeight: 400 }}> - <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                )}
                {!e._bulletContinuation && (
                  <div style={{ fontSize: '12px', color: c.accentColor, fontStyle: 'italic', marginBottom: '4px' }}>
                    {dateStr(e)}
                    {e.location && <span style={{ color: c.mutedText, fontStyle: 'normal' }}> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                  </div>
                )}
```

- [ ] **Step 12: Add `data-item` to skill tags (left column) and `(cont.)` to skills label**

Find (around line 112):
```jsx
            {leftLabel('Skills')}
```
And find the skill item span (inside `skills.filter(...).flatMap((sk, si) => sk.items.map((item, ii) => ...))`):
```jsx
                    <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
```
The span wrapping it should get `data-item`. Find the span with `key={`${si}-${ii}`}` and add `data-item={`sk-${si}-${ii}`}`.

Replace label:
```jsx
            {leftLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
```

- [ ] **Step 13: Commit**

```bash
git add frontend/src/components/preview/templates/ModernTemplate.jsx \
        frontend/src/components/preview/templates/ModernSidebarTemplate.jsx \
        frontend/src/components/preview/templates/ModernSplitTemplate.jsx \
        frontend/src/components/preview/templates/ModernBannerTemplate.jsx
git commit -m "feat: add subitem attrs and continuation guards to Modern family templates"
```

---

## Task 8: Update Creative family templates

**Files:**
- Modify: `frontend/src/components/preview/templates/CreativeTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/CreativeMinimalTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/CreativeStarTemplate.jsx`

### CreativeTemplate.jsx

- [ ] **Step 1: Add `data-subitem` to experience bullets**

Find (around line 125):
```jsx
                    {e.bullets?.filter(Boolean).map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
```
Replace with:
```jsx
                    {e.bullets?.filter(Boolean).map((b, bi) => (
                      <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
```

- [ ] **Step 2: Guard entry header and update label**

Find (around line 103):
```jsx
              {sectionLabel('Experience')}
              {experience.map((e, i) => {
                const bc = borderColors[i % 2]
                return (
                  <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing, paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                        <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </div>
                      <div style={{ fontSize: 'var(--resume-meta)', color: '#888' }}>
                        <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                        {e.startDate && (e.current || e.endDate) && ' – '}
                        {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                      </div>
                    </div>
                    {(e.role || e.location) && (
                      <div style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: bc, margin: '2px 0 6px' }}>
                        <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                        {e.role && e.location ? ' · ' : ''}
                        <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                      </div>
                    )}
```
Replace with:
```jsx
              {sectionLabel(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
              {experience.map((e, i) => {
                const bc = borderColors[i % 2]
                return (
                  <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing, paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                    {!e._bulletContinuation && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                          <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                        </div>
                        <div style={{ fontSize: 'var(--resume-meta)', color: '#888' }}>
                          <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                          {e.startDate && (e.current || e.endDate) && ' – '}
                          {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                        </div>
                      </div>
                    )}
                    {!e._bulletContinuation && (e.role || e.location) && (
                      <div style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: bc, margin: '2px 0 6px' }}>
                        <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                        {e.role && e.location ? ' · ' : ''}
                        <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                      </div>
                    )}
```

- [ ] **Step 3: Add `data-item` to skill tags and `(cont.)` to skills label**

Find the skills section label and the skill tag span. Add `data-item={`sk-${si}-${ii}`}` to each tag span and update the label.

### CreativeMinimalTemplate.jsx

- [ ] **Step 4: Add `data-subitem` to experience bullets**

Find (around line 84):
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
```
Replace with:
```jsx
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
```

- [ ] **Step 5: Guard entry header and update label**

Find (around line 76):
```jsx
          <div key={key} data-section="experience">
            <Row label="Experience">
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                  {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}>{dateStr(e)}</div>}
```
Replace with:
```jsx
          <div key={key} data-section="experience">
            <Row label={experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience'}>
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                    <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                    </div>
                  )}
                  {!e._bulletContinuation && dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}>{dateStr(e)}</div>}
```

- [ ] **Step 6: Update skills — replace flat `allSkillItems` with indexed rendering and update label**

`CreativeMinimalTemplate` uses `allSkillItems` (a flat array without group indices). Change to group+item indexed rendering.

Find (around line 113):
```jsx
        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            <Row label="Skills">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                {allSkillItems.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 'var(--resume-body)', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span>•</span><span>{item}</span>
                  </div>
                ))}
              </div>
            </Row>
          </div>
        )
```
Replace with:
```jsx
        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            <Row label={skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills'}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                {skills.flatMap((sk, gi) => (sk.items ?? []).map((item, ii) => (
                  <div key={`${gi}-${ii}`} data-item={`sk-${gi}-${ii}`} style={{ fontSize: 'var(--resume-body)', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span>•</span><span>{item}</span>
                  </div>
                )))}
              </div>
            </Row>
          </div>
        )
```

Also remove the `allSkillItems` const if it's no longer used.

### CreativeStarTemplate.jsx

- [ ] **Step 7: Add `data-subitem` to experience bullets**

Find (around line 120):
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '4px' }}>
```
Replace with:
```jsx
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '4px' }}>
```

- [ ] **Step 8: Guard entry header and update label**

Find (around line 108):
```jsx
            <SectionHeader>Experience</SectionHeader>
            <Divider />
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                {dateStr(e) && <div style={{ fontSize: '12px', color: c.mutedText, marginBottom: '2px' }}>{dateStr(e)}</div>}
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                </div>
                {e.role && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.location && <span>, <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>}
```
Replace with:
```jsx
            <SectionHeader>{experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience'}</SectionHeader>
            <Divider />
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                {!e._bulletContinuation && dateStr(e) && <div style={{ fontSize: '12px', color: c.mutedText, marginBottom: '2px' }}>{dateStr(e)}</div>}
                {!e._bulletContinuation && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                  </div>
                )}
                {!e._bulletContinuation && e.role && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.location && <span>, <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>}
```

- [ ] **Step 9: Update skills — replace flat `allSkillItems` with indexed rendering and update label**

`CreativeStarTemplate` uses `allSkillItems`. Change to group+item indexed rendering.

Find (around line 150):
```jsx
        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            <SectionHeader>Skills</SectionHeader>
            <Divider />
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
              {allSkillItems.map((item, ii) => (
                <span key={ii}>{item}{ii < allSkillItems.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
        )
```
Replace with:
```jsx
        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            <SectionHeader>{skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills'}</SectionHeader>
            <Divider />
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
              {skills.flatMap((sk, gi) => (sk.items ?? []).map((item, ii) => ({ item, gi, ii }))).map(({ item, gi, ii }, flatIdx, arr) => (
                <span key={`${gi}-${ii}`} data-item={`sk-${gi}-${ii}`}>{item}{flatIdx < arr.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
        )
```

Also remove the `allSkillItems` const if it's no longer used.

- [ ] **Step 10: Run tests**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/components/preview/templates/CreativeTemplate.jsx \
        frontend/src/components/preview/templates/CreativeMinimalTemplate.jsx \
        frontend/src/components/preview/templates/CreativeStarTemplate.jsx
git commit -m "feat: add subitem attrs and continuation guards to Creative family templates"
```
