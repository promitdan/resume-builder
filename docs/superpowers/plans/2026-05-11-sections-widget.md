# Sections Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a drag-and-drop Sections panel to the Preview page Controls card that lets users reorder resume sections and, for two-column templates, assign sections to left or right columns.

**Architecture:** Two new top-level store fields (`leftColumnOrder`, `rightColumnOrder`) drive column assignment for two-column templates. All 8 two-column templates read these from the store instead of hardcoding section-to-column mapping via a `renderSection(key, col)` helper. A new `SectionsPanel` component renders draggable rows using native HTML5 drag events and is appended to the Controls card in `PreviewPage`.

**Tech Stack:** React 18, Zustand, native HTML5 drag-and-drop, no new dependencies.

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `frontend/src/store/useResumeStore.js` | Modify | Add `leftColumnOrder`, `rightColumnOrder` state + `setLeftColumnOrder`, `setRightColumnOrder` actions; update `setTemplateId` and `toggleOptionalSection` |
| `frontend/src/templates/modern-split.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/modern-sidebar.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/modern.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/modern-banner.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/minimal-columns.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/minimal-boxed.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/executive-band.json` | Modify | Add `defaultColumns` |
| `frontend/src/templates/executive-sidebar.json` | Modify | Add `defaultColumns` |
| `frontend/src/components/preview/templates/ModernSplitTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/ModernSidebarTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/ModernTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/ModernBannerTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx` | Modify | Replace hardcoded column arrays with store-driven `renderSection(key, col)` |
| `frontend/src/components/preview/SectionsPanel.jsx` | Create | New drag-and-drop sections panel |
| `frontend/src/pages/PreviewPage.jsx` | Modify | Import and render `SectionsPanel` below `DownloadButtons` |

---

### Task 1: Store — column order state and actions

**Files:**
- Modify: `frontend/src/store/useResumeStore.js`

- [ ] **Step 1: Add import for TEMPLATE_CONFIGS at the top of the store**

Add after the existing imports:

```js
import { TEMPLATE_CONFIGS } from '../registry/templateRegistry'
```

- [ ] **Step 2: Add `leftColumnOrder` and `rightColumnOrder` to `initialState`**

Replace:
```js
const initialState = {
  content: emptyContent(),
  templateId: 'classic-traditional',
  paletteIndex: 0,
  fontSize: 'medium',
}
```

With:
```js
const initialState = {
  content: emptyContent(),
  templateId: 'classic-traditional',
  paletteIndex: 0,
  fontSize: 'medium',
  leftColumnOrder: [],
  rightColumnOrder: [],
}
```

- [ ] **Step 3: Add `setLeftColumnOrder` and `setRightColumnOrder` actions**

Add after `setFontSize`:

```js
setLeftColumnOrder:  (order) => set({ leftColumnOrder: order }),
setRightColumnOrder: (order) => set({ rightColumnOrder: order }),
```

- [ ] **Step 4: Update `setTemplateId` to initialize column orders on first two-column template load**

Replace:
```js
setTemplateId: (templateId) => set({ templateId, paletteIndex: 0 }),
```

With:
```js
setTemplateId: (templateId) => set((s) => {
  const tpl  = TEMPLATE_CONFIGS[templateId]
  const base = { templateId, paletteIndex: 0 }
  if (tpl?.layoutType !== 'two-column') return base
  // Preserve existing column orders if already set (user customisation survives template switches)
  if (s.leftColumnOrder.length > 0 || s.rightColumnOrder.length > 0) return base
  const enabled = new Set(s.content.sectionOrder.filter(k => k !== 'personal'))
  const defs    = tpl.defaultColumns
  return {
    ...base,
    leftColumnOrder:  defs.left.filter(k  => enabled.has(k)),
    rightColumnOrder: defs.right.filter(k => enabled.has(k)),
  }
}),
```

- [ ] **Step 5: Update `toggleOptionalSection` to keep column orders in sync**

Replace:
```js
toggleOptionalSection: (key, enabled) =>
  set((s) => {
    const order = s.content.sectionOrder.filter((k) => k !== key)
    if (enabled) order.push(key)
    return { content: { ...s.content, sectionOrder: order } }
  }),
```

With:
```js
toggleOptionalSection: (key, enabled) =>
  set((s) => {
    const order = s.content.sectionOrder.filter((k) => k !== key)
    if (enabled) order.push(key)
    const isTwoCol = TEMPLATE_CONFIGS[s.templateId]?.layoutType === 'two-column'
    if (!isTwoCol) return { content: { ...s.content, sectionOrder: order } }
    const left  = enabled ? s.leftColumnOrder  : s.leftColumnOrder.filter(k  => k !== key)
    const right = enabled
      ? [...s.rightColumnOrder, key]
      : s.rightColumnOrder.filter(k => k !== key)
    return { content: { ...s.content, sectionOrder: order }, leftColumnOrder: left, rightColumnOrder: right }
  }),
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/store/useResumeStore.js
git commit -m "feat: add leftColumnOrder/rightColumnOrder to store for two-column section assignment"
```

---

### Task 2: Add `defaultColumns` to all 8 two-column template configs

**Files:** all 8 JSON files under `frontend/src/templates/`

The `defaultColumns` entry lists which sections belong in each column when the template is first loaded. Add it as the last key in each file (before the closing `}`). The values reflect each template's current hardcoded column split.

- [ ] **Step 1: Add `defaultColumns` to `modern-split.json`**

Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["skills", "languages"],
  "right": ["experience", "education", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 2: Add `defaultColumns` to `modern-sidebar.json`**

Add before the closing `}` (after the `"palettes"` array):

```json
"defaultColumns": {
  "left":  ["skills", "languages"],
  "right": ["experience", "education", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 3: Add `defaultColumns` to `modern.json`**

`ModernTemplate` puts skills + education in the left sidebar. Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["skills", "education", "languages"],
  "right": ["experience", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 4: Add `defaultColumns` to `modern-banner.json`**

`ModernBannerTemplate` puts education + skills + languages in the left. Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["education", "skills", "languages"],
  "right": ["experience", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 5: Add `defaultColumns` to `minimal-columns.json`**

Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["skills", "languages"],
  "right": ["experience", "education", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 6: Add `defaultColumns` to `minimal-boxed.json`**

`MinimalBoxedTemplate` puts skills + languages + awards in the left. Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["skills", "languages", "awards"],
  "right": ["experience", "education", "projects", "certifications", "custom"]
}
```

- [ ] **Step 7: Add `defaultColumns` to `executive-band.json`**

Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["skills", "languages"],
  "right": ["experience", "education", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 8: Add `defaultColumns` to `executive-sidebar.json`**

Add before the closing `}`:

```json
"defaultColumns": {
  "left":  ["skills", "languages"],
  "right": ["experience", "education", "projects", "certifications", "awards", "custom"]
}
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/templates/modern-split.json frontend/src/templates/modern-sidebar.json \
        frontend/src/templates/modern.json frontend/src/templates/modern-banner.json \
        frontend/src/templates/minimal-columns.json frontend/src/templates/minimal-boxed.json \
        frontend/src/templates/executive-band.json frontend/src/templates/executive-sidebar.json
git commit -m "feat: add defaultColumns to all two-column template configs"
```

---

### Task 3: Refactor ModernSplitTemplate to use store column orders

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernSplitTemplate.jsx`

The current template hardcodes skills+languages in the sidebar and filters `sectionOrder` for the main column. Replace with a unified `renderSection(key, col)` function that both columns call.

- [ ] **Step 1: Add store import**

Add at the top of the file, after existing imports:

```js
import { useResumeStore } from '../../../store/useResumeStore'
```

- [ ] **Step 2: Read column orders from store inside the component**

Inside `ModernSplitTemplate`, replace the destructuring line:
```js
const { personal = {}, experience = [], education = [], skills = [],
        projects = [], certifications = [], languages = [], awards = [], custom = [],
        sectionOrder = [] } = content
```

With:
```js
const { personal = {}, experience = [], education = [], skills = [],
        projects = [], certifications = [], languages = [], awards = [], custom = [] } = content
const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder)
const rightColumnOrder = useResumeStore(s => s.rightColumnOrder)
```

(`sectionOrder` is no longer used in this template.)

- [ ] **Step 3: Replace the sidebar and main column section rendering with `renderSection`**

After the `dateStr` and `hasSkills`/`hasSocial` declarations, add the unified renderer:

```js
const renderSection = (key, col) => {
  const label = col === 'left' ? sidebarLabel : mainLabel

  if (key === 'skills') {
    if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
    return (
      <div key={key} data-section="skills">
        {label(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
          {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
            <li key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>
              <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
            </li>
          )))}
        </ul>
      </div>
    )
  }

  if (key === 'languages') {
    if (languages.length === 0) return null
    return (
      <div key={key} data-section="languages">
        {label('Languages')}
        <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
          {languages.map((lang, i) => (
            <div key={lang.id ?? i}>
              <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
              {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (key === 'experience') {
    if (experience.length === 0) return null
    return (
      <div key={key} data-section="experience">
        {label(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
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
            {e.bullets?.filter(Boolean).map((b, bi) => (
              <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
                <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'education') {
    if (education.length === 0) return null
    return (
      <div key={key} data-section="education">
        {label('Education')}
        {education.map((e, i) => (
          <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '12px', fontSize: 'var(--resume-body)' }}>
            <div style={{ fontWeight: 700 }}>
              {[e.degree, e.field, e.institution].filter(Boolean).map((v, idx, arr) => (
                <span key={idx}>{v}{idx < arr.length - 1 ? ', ' : ''}</span>
              ))}
            </div>
            <div style={{ color: c.mutedText, fontSize: '12px' }}>
              {[e.startDate, e.endDate].filter(Boolean).join(' — ')}
              {e.gpa ? ` · GPA: ${e.gpa}` : ''}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (key === 'projects') {
    if (projects.length === 0) return null
    return (
      <div key={key} data-section="projects">
        {label('Projects')}
        {projects.map((proj, i) => (
          <div key={proj.id ?? i} data-item={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
              <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
              {proj.url && <span style={{ fontWeight: 400 }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
            </div>
            {proj.description && (
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '3px' }}>
                <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'certifications') {
    if (certifications.length === 0) return null
    return (
      <div key={key} data-section="certifications">
        {label('Certifications')}
        {certifications.map((cert, i) => (
          <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
            <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
            {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
            {cert.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'awards') {
    if (awards.length === 0) return null
    return (
      <div key={key} data-section="awards">
        {label('Achievements')}
        {awards.map((aw, i) => (
          <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
            {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
            {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
            {aw.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
            {aw.description && <div style={{ marginTop: '2px' }}><RichTextEditor path={`awards.${i}.description`} value={aw.description} /></div>}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'custom') {
    if (custom.length === 0) return null
    return (
      <div key={key} data-section="custom">
        {custom.map((sec, i) => (
          <div key={sec.id ?? i} data-item={sec.id ?? i}>
            {label(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
              <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
```

- [ ] **Step 4: Replace sidebar JSX to use `leftColumnOrder`**

Replace the entire `const sidebar = (...)` block with:

```js
const sidebar = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, padding: '28px 20px', boxSizing: 'border-box', flexShrink: 0, fontFamily: ty.bodyFont }}>
    {leftColumnOrder.map(key => renderSection(key, 'left'))}
    {pageIndex === 0 && hasSocial && (
      <>
        {sidebarLabel('Websites & Social Links')}
        <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
          {personal.linkedin && (
            <div>
              <span style={{ fontWeight: 700 }}>LinkedIn: </span>
              <ContactLink path="personal.linkedin" value={personal.linkedin} />
            </div>
          )}
          {personal.website && (
            <div>
              <span style={{ fontWeight: 700 }}>Website: </span>
              <ContactLink path="personal.website" value={personal.website} />
            </div>
          )}
        </div>
      </>
    )}
  </div>
)
```

- [ ] **Step 5: Replace main column JSX to use `rightColumnOrder`**

Replace the entire `const main = (...)` block with:

```js
const main = (
  <div data-col="right" style={{ flex: 1, background: c.mainBg, padding: '28px 28px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
    {pageIndex === 0 && (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '10px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '8px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: 'var(--resume-meta)', color: c.mainText, marginBottom: '12px' }}>
          {personal.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ContactIcon type="email" size={13} color={c.mutedText} />
              <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
            </span>
          )}
          {personal.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ContactIcon type="location" size={13} color={c.mutedText} />
              <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
            </span>
          )}
          {personal.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ContactIcon type="phone" size={13} color={c.mutedText} />
              <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
            </span>
          )}
          {personal.linkedin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ContactIcon type="linkedin" size={13} color={c.mutedText} />
              <ContactLink path="personal.linkedin" value={personal.linkedin} />
            </span>
          )}
          {personal.website && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ContactIcon type="globe" size={13} color={c.mutedText} />
              <ContactLink path="personal.website" value={personal.website} />
            </span>
          )}
        </div>
        <div style={{ height: '1px', background: c.dividerColor }} />
      </div>
    )}
    {personal.summary && (
      <div data-section="summary">
        {mainLabel('Summary')}
        <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
          <RichTextEditor path="personal.summary" value={personal.summary} />
        </div>
      </div>
    )}
    {rightColumnOrder.map(key => renderSection(key, 'right'))}
  </div>
)
```

- [ ] **Step 6: Verify the template renders correctly**

Start the dev server (`npm run dev` in `frontend/`) and navigate to `/preview` with mock data. Select the Modern > Split template. Confirm Experience/Education appear on the right, Skills/Languages on the left — same as before.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/preview/templates/ModernSplitTemplate.jsx
git commit -m "feat: ModernSplitTemplate reads column order from store instead of hardcoded arrays"
```

---

### Task 4: Refactor ModernSidebarTemplate to use store column orders

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernSidebarTemplate.jsx`

Same pattern as Task 3 but with sidebar dark-background styles. The sidebar uses `c.sidebarText` and `c.sidebarMuted` for text colors.

- [ ] **Step 1: Add store import**

```js
import { useResumeStore } from '../../../store/useResumeStore'
```

- [ ] **Step 2: Read column orders from store, remove `sectionOrder` destructuring**

Inside `ModernSidebarTemplate`, replace:
```js
const { personal = {}, experience = [], education = [], skills = [],
        projects = [], certifications = [], languages = [], awards = [], custom = [],
        sectionOrder = [] } = content
```

With:
```js
const { personal = {}, experience = [], education = [], skills = [],
        projects = [], certifications = [], languages = [], awards = [], custom = [] } = content
const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder)
const rightColumnOrder = useResumeStore(s => s.rightColumnOrder)
```

- [ ] **Step 3: Add unified `renderSection(key, col)` function**

Add after `hasSkills`/`hasSocial` declarations:

```js
const renderSection = (key, col) => {
  const label      = col === 'left' ? sidebarLabel : mainLabel
  const textColor  = col === 'left' ? c.sidebarText : c.mainText
  const mutedColor = col === 'left' ? c.sidebarMuted : c.mutedText

  if (key === 'skills') {
    if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
    return (
      <div key={key} data-section="skills">
        {label(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
          {skills.flatMap((sk, gi) => (sk.items ?? []).map((item, ii) => (
            <li key={`${gi}-${ii}`} data-item={`sk-${gi}-${ii}`} style={{ paddingLeft: '14px', position: 'relative', color: textColor }}>
              <span style={{ position: 'absolute', left: 0, color: mutedColor }}>·</span>
              <InlineEditor path={`skills.${gi}.items.${ii}`} value={item}>{item}</InlineEditor>
            </li>
          )))}
        </ul>
      </div>
    )
  }

  if (key === 'languages') {
    if (languages.length === 0) return null
    return (
      <div key={key} data-section="languages">
        {label('Languages')}
        <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
          {languages.map((lang, i) => (
            <div key={lang.id ?? i} style={{ color: textColor }}>
              <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
              {lang.proficiency && <span style={{ color: mutedColor }}> — {lang.proficiency}</span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (key === 'experience') {
    if (experience.length === 0) return null
    return (
      <div key={key} data-section="experience">
        {label(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
        {experience.map((e, i) => (
          <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
            {!e._bulletContinuation && (
              <div style={{ fontSize: 'var(--resume-label)', color: mutedColor, marginBottom: '2px' }}>{dateStr(e)}</div>
            )}
            {!e._bulletContinuation && (
              <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px', color: textColor }}>
                <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
              </div>
            )}
            {!e._bulletContinuation && e.company && (
              <div style={{ fontSize: 'var(--resume-body)', color: mutedColor, marginBottom: '5px' }}>
                <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
              </div>
            )}
            {e.bullets?.filter(Boolean).map((b, bi) => (
              <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px', color: textColor }}>
                <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'education') {
    if (education.length === 0) return null
    return (
      <div key={key} data-section="education">
        {label('Education')}
        {education.map((e, i) => (
          <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: textColor }}>
              <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
            </div>
            {(e.degree || e.field) && (
              <div style={{ fontSize: 'var(--resume-body)', color: mutedColor }}>
                <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                {e.degree && e.field ? ', ' : ''}
                <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
              </div>
            )}
            <div style={{ fontSize: '12px', color: mutedColor }}>
              {[e.startDate, e.endDate].filter(Boolean).join(' — ')}
              {e.gpa ? ` · GPA: ${e.gpa}` : ''}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (key === 'projects') {
    if (projects.length === 0) return null
    return (
      <div key={key} data-section="projects">
        {label('Projects')}
        {projects.map((proj, i) => (
          <div key={proj.id ?? i} data-item={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: textColor }}>
              <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
              {proj.url && <span style={{ fontWeight: 400 }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
            </div>
            {proj.description && (
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '3px', color: textColor }}>
                <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'certifications') {
    if (certifications.length === 0) return null
    return (
      <div key={key} data-section="certifications">
        {label('Certifications')}
        {certifications.map((cert, i) => (
          <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)', color: textColor }}>
            <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
            {cert.issuer && <span style={{ color: mutedColor }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
            {cert.date && <span style={{ color: mutedColor }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'awards') {
    if (awards.length === 0) return null
    return (
      <div key={key} data-section="awards">
        {label('Achievements')}
        {awards.map((aw, i) => (
          <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)', color: textColor }}>
            {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
            {aw.issuer && <span style={{ color: mutedColor }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
            {aw.date && <span style={{ color: mutedColor }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
            {aw.description && <div style={{ marginTop: '2px', color: textColor }}><RichTextEditor path={`awards.${i}.description`} value={aw.description} /></div>}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'custom') {
    if (custom.length === 0) return null
    return (
      <div key={key} data-section="custom">
        {custom.map((sec, i) => (
          <div key={sec.id ?? i} data-item={sec.id ?? i}>
            {label(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: textColor }}>
              <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
```

- [ ] **Step 4: Replace sidebar JSX to use `leftColumnOrder`**

Replace the `const sidebar = (...)` block. Keep the name/title header block and Details/Social links fixed (they are part of personal info, not column-assignable). Replace only the skills/languages section rendering:

```js
const sidebar = (
  <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, color: c.sidebarText, padding: '32px 22px', boxSizing: 'border-box', flexShrink: 0, fontFamily: ty.bodyFont }}>
    {pageIndex === 0 && (
      <>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2, marginBottom: '4px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: '12px', color: c.sidebarMuted, marginBottom: '20px', marginTop: '4px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
      </>
    )}
    {pageIndex === 0 && (personal.email || personal.phone || personal.location) && (
      <>
        {sidebarLabel('Details')}
        <div style={{ fontSize: 'var(--resume-body)', color: c.sidebarText }}>
          {personal.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="email" size={13} color={c.sidebarMuted} />
              <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
            </div>
          )}
          {personal.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="phone" size={13} color={c.sidebarMuted} />
              <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
            </div>
          )}
          {personal.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="location" size={13} color={c.sidebarMuted} />
              <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
            </div>
          )}
        </div>
      </>
    )}
    {leftColumnOrder.map(key => renderSection(key, 'left'))}
    {pageIndex === 0 && hasSocial && (
      <>
        {sidebarLabel('Social Links')}
        <div style={{ fontSize: 'var(--resume-body)', color: c.sidebarText }}>
          {personal.linkedin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="linkedin" size={13} color={c.sidebarMuted} />
              <ContactLink path="personal.linkedin" value={personal.linkedin} />
            </div>
          )}
          {personal.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="globe" size={13} color={c.sidebarMuted} />
              <ContactLink path="personal.website" value={personal.website} />
            </div>
          )}
        </div>
      </>
    )}
  </div>
)
```

- [ ] **Step 5: Replace main column JSX to use `rightColumnOrder`**

Replace the `const main = (...)` block:

```js
const main = (
  <div data-col="right" style={{ flex: 1, background: c.mainBg, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
    {personal.summary && (
      <div data-section="summary">
        {mainLabel('Summary')}
        <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
          <RichTextEditor path="personal.summary" value={personal.summary} />
        </div>
      </div>
    )}
    {rightColumnOrder.map(key => renderSection(key, 'right'))}
  </div>
)
```

- [ ] **Step 6: Verify rendering**

In the browser, select Modern > Sidebar template. Confirm it renders the same as before (skills/languages on the left, experience/education on the right).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/preview/templates/ModernSidebarTemplate.jsx
git commit -m "feat: ModernSidebarTemplate reads column order from store instead of hardcoded arrays"
```

---

### Task 4b: Refactor remaining 6 two-column templates

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ModernBannerTemplate.jsx`
- Modify: `frontend/src/components/preview/templates/ModernTemplate.jsx`

All 6 follow the exact same refactor pattern as Tasks 3 and 4. For each template:

1. Add `import { useResumeStore } from '../../../store/useResumeStore'`
2. Remove `sectionOrder` from the content destructuring; add:
   ```js
   const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder)
   const rightColumnOrder = useResumeStore(s => s.rightColumnOrder)
   ```
3. Add a `renderSection(key, col)` function (shown below per template)
4. Replace the hardcoded left column section rendering with `{leftColumnOrder.map(key => renderSection(key, 'left'))}`
5. Replace `sectionOrder.filter(...)` in the right column with `{rightColumnOrder.map(key => renderSection(key, 'right'))}`

The `renderSection` function is identical across these templates — only the `label` function call and text/muted color variables differ. The section content JSX (items, bullets, dates) is copied from the existing right-column rendering.

---

**MinimalColumnsTemplate, MinimalBoxedTemplate, ExecutiveBandTemplate** — these have light backgrounds on both columns. `renderSection` uses the same colors regardless of column:

```js
const renderSection = (key, col) => {
  const label = col === 'left' ? sectionHeader : sectionHeader  // same fn for both cols in these templates
  // Use c.mutedText and c.headingText throughout (same for both cols)
  // Copy the existing section JSX from the right column — it already uses the right colors
  // ...same section-by-section JSX as shown in Task 3 renderSection, replacing sidebarLabel/mainLabel with sectionHeader
}
```

For `MinimalColumnsTemplate` and `MinimalBoxedTemplate`: the existing label helper is named `sectionHeader` (not `sidebarLabel`/`mainLabel`). Use it for both columns.

For `ExecutiveBandTemplate`: read the file to find what the label helper is named, then use it for both columns.

- [ ] **Step 1: Refactor MinimalColumnsTemplate**

Open `frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx`.

Add the store import. Remove `sectionOrder` from destructuring. Add column order reads.

Find the `sectionHeader` helper function (it renders section headings). Add `renderSection`:

```js
const renderSection = (key, _col) => {
  if (key === 'skills') {
    if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
    return (
      <div key={key} data-section="skills">
        {sectionHeader(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
        {skills.map((sk, si) => (sk.items ?? []).map((item, ii) => (
          <div key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8', paddingLeft: '12px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: c.mutedText }}>·</span>
            <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
          </div>
        )))}
      </div>
    )
  }
  if (key === 'languages') {
    if (languages.length === 0) return null
    return (
      <div key={key} data-section="languages">
        {sectionHeader('Languages')}
        {languages.map((lang, i) => (
          <div key={lang.id ?? i} style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
            {lang.proficiency && <span style={{ color: c.mutedText }}> — {lang.proficiency}</span>}
          </div>
        ))}
      </div>
    )
  }
  if (key === 'experience') {
    if (experience.length === 0) return null
    // Copy the existing experience JSX from rightCol verbatim, wrapped in a key={key} div
    return <div key={key}>{/* existing experience rendering from rightCol */}</div>
  }
  // Repeat for education, projects, certifications, awards, custom
  // Copy each section's JSX verbatim from the existing rightCol rendering
  return null
}
```

**Important:** The easiest way to implement `renderSection` for these templates is to copy the existing `if (key === ...)` blocks from the current `sectionOrder.filter(...).map(key => { ... })` in `rightCol` and wrap them in the function. The left column's sections (skills/languages) already have their own JSX in `leftCol` — wrap those too.

Replace `leftCol` internals (after the personal header) with:
```jsx
{leftColumnOrder.map(key => renderSection(key, 'left'))}
```

Replace the `sectionOrder.filter(...).map(...)` in `rightCol` with:
```jsx
{rightColumnOrder.map(key => renderSection(key, 'right'))}
```

- [ ] **Step 2: Refactor MinimalBoxedTemplate**

Same pattern as Step 1. The left column currently renders skills + languages + awards. The right column filters out personal/skills/languages/awards. After refactor, both use `renderSection` with `leftColumnOrder`/`rightColumnOrder`.

Read the file to find the label helper name (look for a function returning a styled div with the section title), then apply the same pattern.

- [ ] **Step 3: Refactor ExecutiveBandTemplate**

Same pattern. Read the file, find the label helper, apply the pattern.

- [ ] **Step 4: Refactor ExecutiveSidebarTemplate**

This template has a dark sidebar (like ModernSidebarTemplate in Task 4). Read the color vars (`c.sidebarText`, `c.sidebarMuted`) then apply the Task 4 pattern:

```js
const renderSection = (key, col) => {
  const label      = col === 'left' ? sidebarLabel : mainLabel
  const textColor  = col === 'left' ? c.sidebarText : c.mainText
  const mutedColor = col === 'left' ? c.sidebarMuted : c.mutedText
  // ... same section JSX as Task 4 ModernSidebarTemplate renderSection
}
```

The sidebar in ExecutiveSidebar currently renders skills + languages. The right column filters personal/skills/languages.

- [ ] **Step 5: Refactor ModernBannerTemplate**

ModernBannerTemplate has a full-width banner header, then a two-column body. The left column currently renders `sectionOrder.filter(k => ['education', 'skills', 'languages'].includes(k))` and the right renders `sectionOrder.filter(k => !['personal', 'education', 'skills', 'languages'].includes(k))`.

Read the file to find the label helper and color vars. Both columns are light background, so no col-specific colors needed:

```js
const renderSection = (key, _col) => {
  // label function same for both cols
  // colors same for both cols
  // section JSX copied from existing left/right rendering
}
```

Replace left column: `{leftColumnOrder.map(key => renderSection(key, 'left'))}`
Replace right column filter: `{rightColumnOrder.map(key => renderSection(key, 'right'))}`

- [ ] **Step 6: Refactor ModernTemplate**

ModernTemplate has a dark sidebar (uses `c.sidebarBackground`, `c.sidebarText`, `c.sidebarAccent`). Apply the Task 4 dark-sidebar pattern:

```js
const renderSection = (key, col) => {
  const label      = col === 'left' ? sidebarLabel : mainLabel
  const textColor  = col === 'left' ? c.sidebarText : c.mainText
  const mutedColor = col === 'left' ? c.sidebarText : c.mutedText
  // ...
}
```

The existing left column renders: contact info (fixed/personal), skills, education. After refactor, only the contact info block stays fixed — skills and education move to `leftColumnOrder`. The right column replaces its `sectionOrder.filter(k !== 'personal' && k !== 'education' && k !== 'skills')` with `rightColumnOrder.map(...)`.

- [ ] **Step 7: Verify all 6 templates in the browser**

Navigate to `/preview` and switch to each refactored template. Confirm sections appear in the same positions as before (since defaultColumns were set to match the current hardcoded layout). No visual regressions should occur.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalColumnsTemplate.jsx \
        frontend/src/components/preview/templates/MinimalBoxedTemplate.jsx \
        frontend/src/components/preview/templates/ExecutiveBandTemplate.jsx \
        frontend/src/components/preview/templates/ExecutiveSidebarTemplate.jsx \
        frontend/src/components/preview/templates/ModernBannerTemplate.jsx \
        frontend/src/components/preview/templates/ModernTemplate.jsx
git commit -m "feat: refactor remaining 6 two-column templates to use store column orders"
```

---

### Task 5: Create SectionsPanel component

**Files:**
- Create: `frontend/src/components/preview/SectionsPanel.jsx`

- [ ] **Step 1: Create the file with full implementation**

```jsx
import { useRef, useState } from 'react'
import { useResumeStore }   from '../../store/useResumeStore'
import { TEMPLATE_CONFIGS } from '../../registry/templateRegistry'

const SECTION_LABELS = {
  experience: 'Experience', education: 'Education', skills: 'Skills',
  projects: 'Projects', certifications: 'Certifications', languages: 'Languages',
  awards: 'Awards', custom: 'Custom',
}

const LockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="12" height="12" style={{ flexShrink: 0 }}>
    <rect x="3" y="7" width="10" height="8" rx="1.5" fill="#cbd5e1" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const DragHandle = () => (
  <span style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1, flexShrink: 0, cursor: 'grab' }}>⠿</span>
)

function LockedRow({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 8px', borderRadius: 6,
      background: '#f8fafc', border: '1px solid #e2e8f0',
      marginBottom: 4,
    }}>
      <LockIcon />
      <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{label}</span>
    </div>
  )
}

function SectionRow({ id, col, dropTarget, onDragStart, onDragOver, onDragLeave, onDrop }) {
  const isDropTarget = dropTarget?.id === id && dropTarget?.col === col
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id, col)}
      onDragOver={(e) => onDragOver(e, id, col)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, id, col)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px', borderRadius: 6,
        background: isDropTarget ? '#f0f2f8' : '#fff',
        border: `1px solid ${isDropTarget ? '#94a3b8' : '#e2e8f0'}`,
        marginBottom: 4, userSelect: 'none',
        transition: 'border-color 0.1s, background 0.1s',
      }}
    >
      <DragHandle />
      <span style={{ fontSize: 12, color: '#334155', flex: 1 }}>
        {SECTION_LABELS[id] ?? id}
      </span>
    </div>
  )
}

export default function SectionsPanel() {
  const templateId          = useResumeStore(s => s.templateId)
  const content             = useResumeStore(s => s.content)
  const leftColumnOrder     = useResumeStore(s => s.leftColumnOrder)
  const rightColumnOrder    = useResumeStore(s => s.rightColumnOrder)
  const setLeftColumnOrder  = useResumeStore(s => s.setLeftColumnOrder)
  const setRightColumnOrder = useResumeStore(s => s.setRightColumnOrder)
  const reorderSections     = useResumeStore(s => s.reorderSections)

  const isTwoColumn   = TEMPLATE_CONFIGS[templateId]?.layoutType === 'two-column'
  const moveableSections = (content.sectionOrder ?? []).filter(k => k !== 'personal')

  const dragRef                 = useRef({ id: null, col: null })
  const [dropTarget, setDropTarget] = useState(null)

  function handleDragStart(e, id, col) {
    dragRef.current = { id, col }
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, id, col) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget({ id, col })
  }

  function handleDragLeave() {
    setDropTarget(null)
  }

  function handleDrop(e, targetId, targetCol) {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
    const { id: draggedId, col: sourceCol } = dragRef.current
    dragRef.current = { id: null, col: null }
    if (!draggedId || draggedId === targetId) return

    if (!isTwoColumn || sourceCol === targetCol) {
      // Reorder within list
      const list = sourceCol === 'left'  ? [...leftColumnOrder]
                 : sourceCol === 'right' ? [...rightColumnOrder]
                 : [...moveableSections]
      const fromIdx = list.indexOf(draggedId)
      const toIdx   = list.indexOf(targetId)
      if (fromIdx < 0 || toIdx < 0) return
      list.splice(fromIdx, 1)
      list.splice(toIdx, 0, draggedId)
      if (sourceCol === 'left')  setLeftColumnOrder(list)
      else if (sourceCol === 'right') setRightColumnOrder(list)
      else reorderSections(['personal', ...list])
    } else {
      // Move between columns
      const newLeft  = leftColumnOrder.filter(k => k !== draggedId)
      const newRight = rightColumnOrder.filter(k => k !== draggedId)
      if (targetCol === 'left') {
        const toIdx = newLeft.indexOf(targetId)
        if (toIdx < 0) return
        newLeft.splice(toIdx, 0, draggedId)
      } else {
        const toIdx = newRight.indexOf(targetId)
        if (toIdx < 0) return
        newRight.splice(toIdx, 0, draggedId)
      }
      setLeftColumnOrder(newLeft)
      setRightColumnOrder(newRight)
    }
  }

  function handleDropOnColumn(e, targetCol) {
    e.preventDefault()
    setDropTarget(null)
    const { id: draggedId, col: sourceCol } = dragRef.current
    dragRef.current = { id: null, col: null }
    if (!draggedId || sourceCol === targetCol) return
    const newLeft  = leftColumnOrder.filter(k => k !== draggedId)
    const newRight = rightColumnOrder.filter(k => k !== draggedId)
    if (targetCol === 'left') setLeftColumnOrder([...newLeft, draggedId])
    else                      setRightColumnOrder([...newRight, draggedId])
    if (targetCol === 'left') setRightColumnOrder(newRight)
    else                      setLeftColumnOrder(newLeft)
  }

  const rowProps = { dropTarget, onDragStart: handleDragStart, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }

  if (!isTwoColumn) {
    return (
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 9 }}>
          Sections
        </div>
        <LockedRow label="Personal" />
        {moveableSections.map(id => <SectionRow key={id} id={id} col={null} {...rowProps} />)}
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 9 }}>
        Sections
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Left column</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnColumn(e, 'left')}
          style={{ minHeight: 36 }}
        >
          <LockedRow label="Personal" />
          {leftColumnOrder.map(id => <SectionRow key={id} id={id} col="left" {...rowProps} />)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Right column</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnColumn(e, 'right')}
          style={{ minHeight: 36 }}
        >
          {rightColumnOrder.map(id => <SectionRow key={id} id={id} col="right" {...rowProps} />)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Fix the double-set bug in `handleDropOnColumn`**

Looking at `handleDropOnColumn`: both `setLeftColumnOrder` and `setRightColumnOrder` are called correctly. But they are called in the wrong order for the `targetCol === 'left'` branch — the `setRightColumnOrder(newRight)` call happens after both branches. The implementation above has the calls slightly redundant. Replace the function body with:

```js
function handleDropOnColumn(e, targetCol) {
  e.preventDefault()
  setDropTarget(null)
  const { id: draggedId, col: sourceCol } = dragRef.current
  dragRef.current = { id: null, col: null }
  if (!draggedId || sourceCol === targetCol) return
  const newLeft  = leftColumnOrder.filter(k => k !== draggedId)
  const newRight = rightColumnOrder.filter(k => k !== draggedId)
  if (targetCol === 'left') {
    setLeftColumnOrder([...newLeft, draggedId])
    setRightColumnOrder(newRight)
  } else {
    setLeftColumnOrder(newLeft)
    setRightColumnOrder([...newRight, draggedId])
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/SectionsPanel.jsx
git commit -m "feat: add SectionsPanel drag-and-drop component for section reorder and column assignment"
```

---

### Task 6: Wire SectionsPanel into PreviewPage

**Files:**
- Modify: `frontend/src/pages/PreviewPage.jsx`

- [ ] **Step 1: Add SectionsPanel import**

Add after the `DownloadButtons` import line:

```js
import SectionsPanel from '../components/preview/SectionsPanel'
```

- [ ] **Step 2: Render SectionsPanel inside the Controls card, after DownloadButtons**

Find the `{/* Spacer */}` comment and the `<div style={{ flex: 1 }} />` spacer, and the `<DownloadButtons />` line. Currently:

```jsx
{/* Spacer */}
<div style={{ flex: 1 }} />

{/* Downloads */}
<DownloadButtons />
```

Replace with:

```jsx
{/* Downloads */}
<DownloadButtons />

{/* Sections */}
<div style={{ height: 1, background: '#f1f5f9', margin: '6px 0' }} />
<SectionsPanel />
```

(The spacer div is removed — it pushed Downloads to the bottom of the card, but now we have Sections below it, so the card content flows naturally top-to-bottom without the spacer.)

- [ ] **Step 3: Verify end-to-end in the browser**

1. Navigate to `/preview` with mock data
2. Select a single-column template (e.g. Classic Traditional). The Sections panel should show one list: Personal (locked) + draggable section rows. Drag Education above Experience. Confirm the resume preview re-orders.
3. Select Modern > Split or Modern > Sidebar. The panel should show "Left column" and "Right column" lists. Drag Skills from Left to Right. Confirm Skills moves to the right column in the live preview.
4. Drag a section within the Right column (e.g. drag Education above Experience). Confirm reorder in preview.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PreviewPage.jsx
git commit -m "feat: wire SectionsPanel into PreviewPage Controls card"
```
