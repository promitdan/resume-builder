# Template Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all 5 resume template React components and the backend HTML renderer to produce professional, visually polished output matching the approved mockups.

**Architecture:** Per-template React components (JSX inline styles) read from `frontend/src/templates/*.json` for color/typography tokens. The backend `htmlRenderer.js` is refactored from a generic renderer into per-template render functions dispatched by template ID, reading from `backend/src/templates/*.json`. Shared utilities (`esc`, `renderBullets`) are retained.

**Tech Stack:** React 18, Vite, inline JSX styles, Node.js/Express, Google Fonts (Inter + Playfair Display + Lora via CDN)

---

## File Map

| File | Change |
|------|--------|
| `frontend/index.html` | Add Playfair Display + Lora to font import |
| `frontend/src/templates/classic.json` | Update colors/typography tokens |
| `frontend/src/templates/modern.json` | Update sidebarWidthPercent → 38, colors/typography |
| `frontend/src/templates/minimal.json` | Update typography (Inter, weight 300) |
| `frontend/src/templates/executive.json` | Update colors (headerBackground → #1a1a2e), typography |
| `frontend/src/templates/creative.json` | Change layout.type → single-column, add accentStart/accentEnd |
| `backend/src/templates/*.json` | Mirror all 5 frontend JSON changes |
| `frontend/src/components/preview/templates/ClassicTemplate.jsx` | Full rewrite |
| `frontend/src/components/preview/templates/ModernTemplate.jsx` | Full rewrite |
| `frontend/src/components/preview/templates/MinimalTemplate.jsx` | Full rewrite |
| `frontend/src/components/preview/templates/ExecutiveTemplate.jsx` | Full rewrite |
| `frontend/src/components/preview/templates/CreativeTemplate.jsx` | Full rewrite |
| `backend/src/services/renderer/htmlRenderer.js` | Refactor to per-template render functions |
| `backend/src/__tests__/htmlRenderer.test.js` | Add coverage for all 5 templates |

---

## Task 1: Fonts + JSON Token Updates

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/templates/classic.json`
- Modify: `frontend/src/templates/modern.json`
- Modify: `frontend/src/templates/minimal.json`
- Modify: `frontend/src/templates/executive.json`
- Modify: `frontend/src/templates/creative.json`
- Modify: `backend/src/templates/classic.json`
- Modify: `backend/src/templates/modern.json`
- Modify: `backend/src/templates/minimal.json`
- Modify: `backend/src/templates/executive.json`
- Modify: `backend/src/templates/creative.json`

- [ ] **Step 1: Update `frontend/index.html` — replace the Google Fonts link**

Replace the existing `<link href="https://fonts.googleapis.com/css2?family=Inter...` line with:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace `frontend/src/templates/classic.json`**

```json
{
  "id": "classic",
  "name": "Classic",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0",
    "pageMarginSides": "0",
    "sectionSpacing": "18px",
    "itemSpacing": "12px"
  },
  "colors": {
    "mainBackground": "#ffffff",
    "mainText": "#1a1a1a",
    "headingText": "#111111",
    "accentColor": "#111111",
    "dividerColor": "#cccccc",
    "mutedText": "#555555"
  },
  "typography": {
    "nameFont": "'Playfair Display', Georgia, serif",
    "nameFontSize": "28px",
    "nameFontWeight": "700",
    "titleFont": "'Lora', Georgia, serif",
    "titleFontSize": "13px",
    "sectionLabelFont": "'Playfair Display', Georgia, serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "3px",
    "bodyFont": "'Lora', Georgia, serif",
    "bodyFontSize": "11px",
    "bodyLineHeight": "1.6"
  },
  "header": { "placement": "top-center", "alignment": "center", "showAvatar": false, "dividerStyle": "solid-thick" },
  "sections": {
    "type": "single-column",
    "order": ["personal", "skills", "experience", "education", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "solid", "bulletStyle": "bullet", "dateAlignment": "inline-right", "labelWeight": "bold"
  }
}
```

- [ ] **Step 3: Replace `frontend/src/templates/modern.json`**

```json
{
  "id": "modern",
  "name": "Modern",
  "layout": {
    "type": "two-column",
    "sidebarPosition": "left",
    "sidebarWidthPercent": 38,
    "pageMarginTop": "0in",
    "pageMarginSides": "0in",
    "sectionSpacing": "14px",
    "itemSpacing": "12px"
  },
  "colors": {
    "sidebarBackground": "#1e3a5f",
    "sidebarText": "#d6e8ff",
    "sidebarAccent": "#4a9eff",
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#1e3a5f",
    "accentColor": "#4a9eff",
    "dividerColor": "#4a9eff",
    "mutedText": "#666666"
  },
  "typography": {
    "nameFont": "Inter, sans-serif",
    "nameFontSize": "15px",
    "nameFontWeight": "700",
    "titleFont": "Inter, sans-serif",
    "titleFontSize": "11px",
    "sectionLabelFont": "Inter, sans-serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "2.5px",
    "bodyFont": "Inter, sans-serif",
    "bodyFontSize": "11px",
    "bodyLineHeight": "1.6"
  },
  "header": { "placement": "sidebar-top", "alignment": "center", "showAvatar": true, "avatarStyle": "circle", "avatarSizePx": 64 },
  "sections": {
    "dividerStyle": "solid-accent", "bulletStyle": "bullet", "dateAlignment": "inline-right",
    "sidebarSections": ["personal-contact", "skills", "education"],
    "mainSections": ["experience", "projects", "awards", "custom"]
  }
}
```

- [ ] **Step 4: Replace `frontend/src/templates/minimal.json`**

```json
{
  "id": "minimal",
  "name": "Minimal",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0",
    "pageMarginSides": "0",
    "sectionSpacing": "32px",
    "itemSpacing": "20px"
  },
  "colors": {
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#111111",
    "accentColor": "#aaaaaa",
    "dividerColor": "#eeeeee",
    "mutedText": "#999999"
  },
  "typography": {
    "nameFont": "Inter, sans-serif",
    "nameFontSize": "32px",
    "nameFontWeight": "300",
    "titleFont": "Inter, sans-serif",
    "titleFontSize": "14px",
    "sectionLabelFont": "Inter, sans-serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "3px",
    "bodyFont": "Inter, sans-serif",
    "bodyFontSize": "11.5px",
    "bodyLineHeight": "1.65"
  },
  "header": { "placement": "top-left", "alignment": "left", "showAvatar": false, "dividerStyle": "none" },
  "sections": {
    "type": "single-column",
    "order": ["personal", "skills", "experience", "education", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "none", "bulletStyle": "none", "dateAlignment": "inline-right", "labelWeight": "normal"
  }
}
```

- [ ] **Step 5: Replace `frontend/src/templates/executive.json`**

```json
{
  "id": "executive",
  "name": "Executive",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0",
    "pageMarginSides": "0",
    "contentPaddingSides": "52px",
    "contentPaddingTop": "28px",
    "sectionSpacing": "24px",
    "itemSpacing": "14px"
  },
  "colors": {
    "headerBackground": "#1a1a2e",
    "headerText": "#ffffff",
    "headerMuted": "#a0aec0",
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#1a1a2e",
    "accentColor": "#1a1a2e",
    "dividerColor": "#1a1a2e",
    "mutedText": "#666666"
  },
  "typography": {
    "nameFont": "Inter, sans-serif",
    "nameFontSize": "32px",
    "nameFontWeight": "800",
    "nameLetterSpacing": "1px",
    "titleFont": "Inter, sans-serif",
    "titleFontSize": "13px",
    "sectionLabelFont": "Inter, sans-serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "3px",
    "bodyFont": "Inter, sans-serif",
    "bodyFontSize": "11px",
    "bodyLineHeight": "1.6"
  },
  "header": { "placement": "top-full-bleed", "alignment": "left", "showAvatar": false, "dividerStyle": "thick" },
  "sections": {
    "type": "single-column",
    "order": ["personal", "experience", "education", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "left-border", "bulletStyle": "bullet", "dateAlignment": "inline-right", "labelWeight": "bold"
  }
}
```

- [ ] **Step 6: Replace `frontend/src/templates/creative.json`**

```json
{
  "id": "creative",
  "name": "Creative",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0",
    "pageMarginSides": "0",
    "sectionSpacing": "24px",
    "itemSpacing": "16px"
  },
  "colors": {
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#1e1b4b",
    "accentStart": "#4f46e5",
    "accentEnd": "#a21caf",
    "dividerColor": "#e8e6ff",
    "mutedText": "#666666"
  },
  "typography": {
    "nameFont": "Inter, sans-serif",
    "nameFontSize": "30px",
    "nameFontWeight": "800",
    "titleFont": "Inter, sans-serif",
    "titleFontSize": "14px",
    "sectionLabelFont": "Inter, sans-serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "3px",
    "bodyFont": "Inter, sans-serif",
    "bodyFontSize": "11px",
    "bodyLineHeight": "1.6"
  },
  "header": { "placement": "top-full-bleed-gradient", "alignment": "left", "showAvatar": false },
  "sections": {
    "type": "single-column",
    "order": ["personal", "skills", "experience", "education", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "gradient", "bulletStyle": "bullet", "dateAlignment": "inline-right", "skillStyle": "pill-alternating"
  }
}
```

- [ ] **Step 7: Mirror all 5 JSON files to `backend/src/templates/`**

Copy the exact same JSON content written in Steps 2–6 into the corresponding backend files:
- `backend/src/templates/classic.json`
- `backend/src/templates/modern.json`
- `backend/src/templates/minimal.json`
- `backend/src/templates/executive.json`
- `backend/src/templates/creative.json`

- [ ] **Step 8: Run existing test suites to confirm no regression**

```bash
cd frontend && npx vitest run 2>&1 | tail -5
cd ../backend && npx jest 2>&1 | tail -5
```

Expected: all tests pass (JSON-only changes don't break existing tests).

- [ ] **Step 9: Commit**

```bash
git add frontend/index.html frontend/src/templates/ backend/src/templates/
git commit -m "feat: update template JSON tokens and add Playfair Display + Lora fonts"
```

---

## Task 2: ClassicTemplate.jsx Rewrite

**Files:**
- Modify: `frontend/src/components/preview/templates/ClassicTemplate.jsx`
- Test: `frontend/src/__tests__/ResumePreview.test.jsx` (existing — must keep passing)

- [ ] **Step 1: Run the existing template render test to establish baseline**

```bash
cd frontend && npx vitest run src/__tests__/ResumePreview.test.jsx 2>&1
```

Expected: all tests pass.

- [ ] **Step 2: Replace `frontend/src/components/preview/templates/ClassicTemplate.jsx`**

```jsx
import t from '../../../templates/classic.json'

export default function ClassicTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '9px', fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: '3px', color: c.headingText,
      borderBottom: `1.5px solid ${c.dividerColor}`,
      paddingBottom: '4px', marginBottom: '10px', marginTop: '18px',
    }}>{text}</div>
  )

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ textAlign: 'center', padding: '36px 56px 18px', borderBottom: `2px solid ${c.headingText}` }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText }}>{personal.name}</div>
        {personal.title && <div style={{ fontStyle: 'italic', fontSize: ty.titleFontSize, color: '#555', marginTop: '6px', letterSpacing: '0.5px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10.5px', color: '#666', marginTop: '8px' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join(' · ')}
        </div>
      </div>

      <div style={{ padding: '22px 56px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', textAlign: 'justify' }}>{personal.summary}</div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal').map(key => {
          if (key === 'skills' && skills.length > 0) {
            const allItems = skills.flatMap(sk => sk.items)
            return allItems.length > 0 ? (
              <div key={key}>
                {sectionLabel('Core Competencies')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {allItems.map((item, i) => (
                    <span key={i} style={{ background: '#f2f2f2', border: '1px solid #ccc', borderRadius: '3px', padding: '3px 10px', fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#333' }}>{item}</span>
                  ))}
                </div>
              </div>
            ) : null
          }

          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History')}
              {experience.map(e => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                    <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                      {e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: ty.bodyFontSize, fontStyle: 'italic', color: '#444', margin: '2px 0 5px' }}>
                      {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ fontSize: '10.5px', lineHeight: '1.6', color: '#333', fontFamily: 'Inter, sans-serif', marginBottom: '3px' }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education')}
              {education.map(e => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.institution}</div>
                    <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>{e.endDate}</div>
                  </div>
                  <div style={{ fontSize: ty.bodyFontSize, fontStyle: 'italic', color: '#444' }}>
                    {[e.degree, e.field].filter(Boolean).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run the test again to confirm it still passes**

```bash
cd frontend && npx vitest run src/__tests__/ResumePreview.test.jsx 2>&1
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/preview/templates/ClassicTemplate.jsx
git commit -m "feat: redesign Classic template — Playfair Display header, Lora body, pill-tag skills"
```

---

## Task 3: ModernTemplate.jsx Rewrite

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernTemplate.jsx`
- Test: `frontend/src/__tests__/ResumePreview.test.jsx`

- [ ] **Step 1: Replace `frontend/src/components/preview/templates/ModernTemplate.jsx`**

```jsx
import t from '../../../templates/modern.json'

export default function ModernTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => (
    <div style={{ fontSize: '8.5px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.sidebarAccent, borderBottom: '1px solid #2d5080', paddingBottom: '4px', marginBottom: '10px', marginTop: '18px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: c.headingText, borderBottom: `2px solid ${c.sidebarAccent}`, paddingBottom: '4px', marginBottom: '14px', marginTop: '20px' }}>{text}</div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items)

  return (
    <div style={{ display: 'flex', fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, lineHeight: ty.bodyLineHeight, minHeight: '11in' }}>
      <div style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '32px 20px', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '64px', height: '64px', background: c.sidebarAccent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', color: '#fff', margin: '0 auto 12px' }}>
            {(personal.name || '?')[0]}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{personal.name}</div>
          {personal.title && <div style={{ fontSize: '11px', color: '#90b8e0', marginTop: '4px' }}>{personal.title}</div>}
        </div>

        {sidebarLabel('Contact')}
        <div style={{ fontSize: '10.5px', lineHeight: '1.7', wordBreak: 'break-word', marginBottom: '4px' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => <div key={i}>{v}</div>)}
        </div>

        {allSkillItems.length > 0 && <>
          {sidebarLabel('Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '4px' }}>
            {allSkillItems.map((item, i) => (
              <span key={i} style={{ background: '#1a4d7a', border: '1px solid #2d6a9f', color: '#cce4ff', fontSize: '9.5px', padding: '3px 9px', borderRadius: '12px' }}>{item}</span>
            ))}
          </div>
        </>}

        {education.length > 0 && <>
          {sidebarLabel('Education')}
          {education.map(e => (
            <div key={e.id} style={{ marginBottom: '10px', fontSize: '10px', lineHeight: '1.7' }}>
              <div style={{ fontWeight: '600', color: '#fff' }}>{e.institution}</div>
              <div style={{ color: '#90b8e0' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</div>
              <div style={{ color: '#7aa0c0' }}>{e.endDate}</div>
            </div>
          ))}
        </>}
      </div>

      <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box' }}>
        {personal.summary && (
          <div>
            {mainLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginBottom: '4px' }}>{personal.summary}</div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'education' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {mainLabel('Work History')}
              {experience.map(e => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      {e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '11px', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                      {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ fontSize: '10.5px', lineHeight: '1.65', color: '#333', marginBottom: '2px' }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )
          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npx vitest run src/__tests__/ResumePreview.test.jsx 2>&1
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/templates/ModernTemplate.jsx
git commit -m "feat: redesign Modern template — 38% navy sidebar, pill-tag skills, fixed email wrap"
```

---

## Task 4: MinimalTemplate.jsx Rewrite

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalTemplate.jsx`

- [ ] **Step 1: Replace `frontend/src/components/preview/templates/MinimalTemplate.jsx`**

```jsx
import t from '../../../templates/minimal.json'

export default function MinimalTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px', marginTop: '32px' }}>{text}</div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight, padding: '52px 64px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, letterSpacing: '-0.5px' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#666', marginTop: '4px', letterSpacing: '0.5px' }}>{personal.title}</div>}
        <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join(' · ')}
        </div>
      </div>

      {personal.summary && (
        <div>
          {sectionLabel('Summary')}
          <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', maxWidth: '580px' }}>{personal.summary}</div>
        </div>
      )}

      {sectionOrder.filter(k => k !== 'personal').map(key => {
        if (key === 'skills' && allSkillItems.length > 0) return (
          <div key={key}>
            {sectionLabel('Skills')}
            <div style={{ fontSize: '11px', color: '#555', lineHeight: '2' }}>
              {allSkillItems.join(' · ')}
            </div>
          </div>
        )

        if (key === 'experience' && experience.length > 0) return (
          <div key={key}>
            {sectionLabel('Experience')}
            {experience.map(e => (
              <div key={e.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: c.headingText }}>{e.company}</div>
                  <div style={{ fontSize: '10.5px', color: '#999' }}>
                    {e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}
                  </div>
                </div>
                {(e.role || e.location) && (
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                  </div>
                )}
                {e.bullets?.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>• {b}</div>
                ))}
              </div>
            ))}
          </div>
        )

        if (key === 'education' && education.length > 0) return (
          <div key={key}>
            {sectionLabel('Education')}
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {education.map(e => (
                <div key={e.id}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: c.headingText }}>{e.institution}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</div>
                  <div style={{ fontSize: '10.5px', color: '#999' }}>{e.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )

        return null
      })}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npx vitest run src/__tests__/ResumePreview.test.jsx 2>&1
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalTemplate.jsx
git commit -m "feat: redesign Minimal template — Inter 300, dot-separated skills, horizontal education"
```

---

## Task 5: ExecutiveTemplate.jsx Rewrite

**Files:**
- Modify: `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`

- [ ] **Step 1: Replace `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`**

```jsx
import t from '../../../templates/executive.json'

export default function ExecutiveTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText, borderLeft: `3px solid ${c.headingText}`, paddingLeft: '10px', marginBottom: '12px', marginTop: '24px' }}>{text}</div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: c.headerBackground, color: c.headerText, padding: '40px 52px 32px' }}>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: ty.nameLetterSpacing || '1px', textTransform: 'uppercase', color: '#fff', marginBottom: '6px' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: '13px', fontWeight: '400', color: c.headerMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>{personal.title}</div>}
        <div style={{ display: 'flex', gap: '24px', fontSize: '11px', color: '#cbd5e0', flexWrap: 'wrap' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>

      {allSkillItems.length > 0 && (
        <div style={{ background: '#f7f7fa', padding: '16px 52px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allSkillItems.map((item, i) => (
              <span key={i} style={{ background: c.headingText, color: '#e0e0f0', fontSize: '9.5px', fontWeight: '500', padding: '4px 11px', borderRadius: '3px' }}>{item}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary')}
            <div style={{ fontSize: '11.5px', lineHeight: '1.7', color: '#333' }}>{personal.summary}</div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History')}
              {experience.map(e => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>
                      {e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#4a5568', margin: '2px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ fontSize: '11px', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education')}
              {education.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.institution}</span>
                    <span style={{ fontSize: '11px', color: '#555', marginLeft: '10px' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#888' }}>{e.endDate}</div>
                </div>
              ))}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npx vitest run src/__tests__/ResumePreview.test.jsx 2>&1
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/templates/ExecutiveTemplate.jsx
git commit -m "feat: redesign Executive template — dark #1a1a2e header, skills badge bar, border-left labels"
```

---

## Task 6: CreativeTemplate.jsx Rewrite

**Files:**
- Modify: `frontend/src/components/preview/templates/CreativeTemplate.jsx`

- [ ] **Step 1: Replace `frontend/src/components/preview/templates/CreativeTemplate.jsx`**

```jsx
import t from '../../../templates/creative.json'

export default function CreativeTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const gradientStyle = `linear-gradient(90deg, ${c.accentStart}, ${c.accentEnd})`

  const sectionLabel = (text) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', background: gradientStyle, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>{text}</div>
      <div style={{ height: '2px', background: gradientStyle, borderRadius: '1px' }}></div>
    </div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items)
  const pillColors = [
    { bg: '#ede9fe', color: '#5b21b6' },
    { bg: '#fce7f3', color: '#9d174d' },
  ]

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: `linear-gradient(135deg, ${c.accentStart}, #7c3aed, ${c.accentEnd})`, color: '#fff', padding: '40px 52px 32px' }}>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#e0d9ff', letterSpacing: '1px', marginBottom: '18px' }}>{personal.title}</div>}
        <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: '#d1c4ff', flexWrap: 'wrap' }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>☎ {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
        </div>
      </div>

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('About')}
            <div style={{ fontSize: '11.5px', lineHeight: '1.7', color: '#444' }}>{personal.summary}</div>
          </div>
        )}

        {allSkillItems.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allSkillItems.map((item, i) => {
                const p = pillColors[i % 2]
                return <span key={i} style={{ background: p.bg, color: p.color, fontSize: '10px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px' }}>{item}</span>
              })}
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Experience')}
              {experience.map((e, idx) => {
                const borderColor = idx % 2 === 0 ? c.accentStart : c.accentEnd
                return (
                  <div key={e.id} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `3px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                      <div style={{ fontSize: '10px', color: '#888' }}>
                        {e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}
                      </div>
                    </div>
                    {(e.role || e.location) && (
                      <div style={{ fontSize: '11px', fontWeight: '600', color: borderColor, margin: '2px 0 6px' }}>
                        {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                      </div>
                    )}
                    {e.bullets?.filter(Boolean).map((b, i) => (
                      <div key={i} style={{ fontSize: '11px', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {b}</div>
                    ))}
                  </div>
                )
              })}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education')}
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {education.map((e, idx) => {
                  const borderColor = idx % 2 === 0 ? c.accentStart : c.accentEnd
                  return (
                    <div key={e.id} style={{ paddingLeft: '14px', borderLeft: `3px solid ${borderColor}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.institution}</div>
                      <div style={{ fontSize: '11px', color: '#555' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</div>
                      <div style={{ fontSize: '10.5px', color: '#999' }}>{e.endDate}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npx vitest run src/__tests__/ResumePreview.test.jsx 2>&1
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/templates/CreativeTemplate.jsx
git commit -m "feat: redesign Creative template — gradient header, alternating pill skills, left-border experience"
```

---

## Task 7: htmlRenderer.js Refactor

**Files:**
- Modify: `backend/src/services/renderer/htmlRenderer.js`
- Modify: `backend/src/__tests__/htmlRenderer.test.js`

- [ ] **Step 1: Add failing tests to `backend/src/__tests__/htmlRenderer.test.js`**

Append these tests inside the existing `describe('renderToHtml', ...)` block (before the closing `})`):

```js
  test.each(['classic', 'modern', 'minimal', 'executive', 'creative'])(
    '%s template includes name, company, institution, and skill',
    (templateId) => {
      const html = renderToHtml(sampleContent, templateId)
      expect(html).toContain('Jane Doe')
      expect(html).toContain('Acme')
      expect(html).toContain('State U')
      expect(html).toContain('JavaScript')
    }
  )

  test('modern template output contains sidebar element', () => {
    const html = renderToHtml(sampleContent, 'modern')
    expect(html).toContain('sidebar')
  })

  test('executive template skills appear as badge spans', () => {
    const html = renderToHtml(sampleContent, 'executive')
    expect(html).toContain('JavaScript')
    expect(html).toContain('border-radius:3px')
  })

  test('creative template skills appear as rounded pill spans', () => {
    const html = renderToHtml(sampleContent, 'creative')
    expect(html).toContain('JavaScript')
    expect(html).toContain('border-radius:20px')
  })

  test('classic template skills appear as pill spans', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('JavaScript')
    expect(html).toContain('border-radius:3px')
  })
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd backend && npx jest src/__tests__/htmlRenderer.test.js 2>&1 | tail -20
```

Expected: new `test.each` tests fail because the old renderer doesn't produce `border-radius` pill tags.

- [ ] **Step 3: Replace `backend/src/services/renderer/htmlRenderer.js` in full**

```js
const fs   = require('fs')
const path = require('path')

function loadTemplate(templateId) {
  const file = path.join(__dirname, '../../templates', `${templateId}.json`)
  if (!fs.existsSync(file)) throw new Error(`Unknown template: ${templateId}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderBullets(bullets = []) {
  const items = bullets.filter(Boolean)
  if (!items.length) return ''
  return items.map(b => `<div style="margin-bottom:2px;">• ${esc(b)}</div>`).join('')
}

function renderContact(personal) {
  return [personal.email, personal.phone, personal.location, personal.linkedin, personal.website]
    .filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')
}

function wrapHtml(fontLink, bodyFont, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${fontLink}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${bodyFont}; background: #fff; width: 8.5in; }
    ul { list-style: none; }
    a { text-decoration: none; }
  </style>
</head>
<body>${body}</body>
</html>`
}

const INTER_FONT = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">`
const CLASSIC_FONT = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">`

/* ─── CLASSIC ─────────────────────────────────────────────────── */
function renderClassic(content, t) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => `<div style="font-family:'Playfair Display',Georgia,serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${c.headingText};border-bottom:1.5px solid ${c.dividerColor};padding-bottom:4px;margin-bottom:10px;margin-top:18px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items)

  const skillsHtml = allSkillItems.length > 0 ? `
    ${label('Core Competencies')}
    <div style="display:flex;flex-wrap:wrap;gap:5px;">
      ${allSkillItems.map(item => `<span style="background:#f2f2f2;border:1px solid #ccc;border-radius:3px;padding:3px 10px;font-size:10px;font-family:Inter,sans-serif;color:#333;">${esc(item)}</span>`).join('')}
    </div>` : ''

  const expHtml = experience.length > 0 ? `
    ${label('Work History')}
    ${experience.map(e => `
      <div style="margin-bottom:${l.itemSpacing};">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:12px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
          <div style="font-size:10px;color:#666;font-style:italic;">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</div>
        </div>
        ${(e.role || e.location) ? `<div style="font-size:${ty.bodyFontSize};font-style:italic;color:#444;margin:2px 0 5px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
        <div style="font-size:10.5px;line-height:1.6;color:#333;font-family:Inter,sans-serif;">${renderBullets(e.bullets)}</div>
      </div>`).join('')}` : ''

  const eduHtml = education.length > 0 ? `
    ${label('Education')}
    ${education.map(e => `
      <div style="margin-bottom:${l.itemSpacing};">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:12px;font-weight:700;color:${c.headingText};">${esc(e.institution)}</div>
          <div style="font-size:10px;color:#666;font-style:italic;">${esc(e.endDate)}</div>
        </div>
        <div style="font-size:${ty.bodyFontSize};font-style:italic;color:#444;">${esc([e.degree, e.field].filter(Boolean).join(' '))}</div>
      </div>`).join('')}` : ''

  const summaryHtml = personal.summary ? `
    ${label('Professional Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#333;text-align:justify;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => {
    if (key === 'skills') return skillsHtml
    if (key === 'experience') return expHtml
    if (key === 'education') return eduHtml
    return ''
  }).join('')

  const header = `<div style="text-align:center;padding:36px 56px 18px;border-bottom:2px solid ${c.headingText};">
    <div style="font-family:'Playfair Display',Georgia,serif;font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};letter-spacing:3px;text-transform:uppercase;color:${c.headingText};">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-style:italic;font-size:${ty.titleFontSize};color:#555;margin-top:6px;">${esc(personal.title)}</div>` : ''}
    <div style="font-size:10.5px;color:#666;margin-top:8px;">${renderContact(personal)}</div>
  </div>`

  const body = `${header}<div style="padding:22px 56px 40px;">${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml(CLASSIC_FONT, `'Lora', Georgia, serif`, body)
}

/* ─── MODERN ──────────────────────────────────────────────────── */
function renderModern(content, t) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => `<div style="font-size:8.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${c.sidebarAccent};border-bottom:1px solid #2d5080;padding-bottom:4px;margin-bottom:10px;margin-top:18px;">${esc(text)}</div>`
  const mainLabel    = (text) => `<div style="font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${c.headingText};border-bottom:2px solid ${c.sidebarAccent};padding-bottom:4px;margin-bottom:14px;margin-top:20px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items)

  const skillPills = allSkillItems.length > 0 ? `
    ${sidebarLabel('Skills')}
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">
      ${allSkillItems.map(item => `<span style="background:#1a4d7a;border:1px solid #2d6a9f;color:#cce4ff;font-size:9.5px;padding:3px 9px;border-radius:12px;">${esc(item)}</span>`).join('')}
    </div>` : ''

  const eduSidebar = education.length > 0 ? `
    ${sidebarLabel('Education')}
    ${education.map(e => `<div style="margin-bottom:10px;font-size:10px;line-height:1.7;">
      <div style="font-weight:600;color:#fff;">${esc(e.institution)}</div>
      <div style="color:#90b8e0;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</div>
      <div style="color:#7aa0c0;">${esc(e.endDate)}</div>
    </div>`).join('')}` : ''

  const sidebarHtml = `
    <div class="sidebar" style="width:${l.sidebarWidthPercent}%;background:${c.sidebarBackground};color:${c.sidebarText};padding:32px 20px;box-sizing:border-box;flex-shrink:0;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:64px;height:64px;background:${c.sidebarAccent};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;margin:0 auto 12px;">${esc((personal.name || '?')[0])}</div>
        <div style="font-size:15px;font-weight:700;color:#fff;">${esc(personal.name)}</div>
        ${personal.title ? `<div style="font-size:11px;color:#90b8e0;margin-top:4px;">${esc(personal.title)}</div>` : ''}
      </div>
      ${sidebarLabel('Contact')}
      <div style="font-size:10.5px;line-height:1.7;word-break:break-word;margin-bottom:4px;">
        ${[personal.email, personal.phone, personal.location].filter(Boolean).map(v => `<div>${esc(v)}</div>`).join('')}
      </div>
      ${skillPills}
      ${eduSidebar}
    </div>`

  const expHtml = experience.length > 0 ? `
    ${mainLabel('Work History')}
    ${experience.map(e => `
      <div style="margin-bottom:${l.itemSpacing};">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:12px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
          <div style="font-size:10px;color:#888;">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</div>
        </div>
        ${(e.role || e.location) ? `<div style="font-size:11px;font-weight:600;color:${c.sidebarAccent};margin:2px 0 5px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
        <div style="font-size:10.5px;line-height:1.65;color:#333;">${renderBullets(e.bullets)}</div>
      </div>`).join('')}` : ''

  const summaryHtml = personal.summary ? `
    ${mainLabel('Professional Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#333;margin-bottom:4px;">${esc(personal.summary)}</div>` : ''

  const mainHtml = `<div style="flex:1;background:${c.mainBackground};color:${c.mainText};padding:32px 28px;box-sizing:border-box;">${summaryHtml}${expHtml}</div>`

  const body = `<div style="display:flex;min-height:11in;">${sidebarHtml}${mainHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── MINIMAL ─────────────────────────────────────────────────── */
function renderMinimal(content, t) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => `<div style="font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin-bottom:10px;margin-top:32px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items)

  const skillsHtml = allSkillItems.length > 0 ? `
    ${label('Skills')}
    <div style="font-size:11px;color:#555;line-height:2;">${allSkillItems.map(esc).join(' · ')}</div>` : ''

  const expHtml = experience.length > 0 ? `
    ${label('Experience')}
    ${experience.map(e => `
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
          <div style="font-size:13px;font-weight:600;color:${c.headingText};">${esc(e.company)}</div>
          <div style="font-size:10.5px;color:#999;">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</div>
        </div>
        ${(e.role || e.location) ? `<div style="font-size:11px;color:#666;margin-bottom:8px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
        <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;">${renderBullets(e.bullets)}</div>
      </div>`).join('')}` : ''

  const eduHtml = education.length > 0 ? `
    ${label('Education')}
    <div style="display:flex;gap:40px;flex-wrap:wrap;">
      ${education.map(e => `
        <div>
          <div style="font-size:12px;font-weight:600;color:${c.headingText};">${esc(e.institution)}</div>
          <div style="font-size:11px;color:#666;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</div>
          <div style="font-size:10.5px;color:#999;">${esc(e.endDate)}</div>
        </div>`).join('')}
    </div>` : ''

  const summaryHtml = personal.summary ? `
    ${label('Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;max-width:580px;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => {
    if (key === 'skills') return skillsHtml
    if (key === 'experience') return expHtml
    if (key === 'education') return eduHtml
    return ''
  }).join('')

  const header = `<div style="margin-bottom:36px;">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};letter-spacing:-0.5px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:${ty.titleFontSize};font-weight:400;color:#666;margin-top:4px;">${esc(personal.title)}</div>` : ''}
    <div style="font-size:11px;color:#999;margin-top:8px;">${renderContact(personal)}</div>
  </div>`

  const body = `<div style="padding:52px 64px;">${header}${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── EXECUTIVE ───────────────────────────────────────────────── */
function renderExecutive(content, t) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => `<div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${c.headingText};border-left:3px solid ${c.headingText};padding-left:10px;margin-bottom:12px;margin-top:24px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items)

  const skillsBar = allSkillItems.length > 0 ? `
    <div style="background:#f7f7fa;padding:16px 52px;border-bottom:1px solid #e2e8f0;">
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${allSkillItems.map(item => `<span style="background:${c.headingText};color:#e0e0f0;font-size:9.5px;font-weight:500;padding:4px 11px;border-radius:3px;">${esc(item)}</span>`).join('')}
      </div>
    </div>` : ''

  const expHtml = experience.length > 0 ? `
    ${label('Work History')}
    ${experience.map(e => `
      <div style="margin-bottom:${l.itemSpacing};">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:13px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
          <div style="font-size:10px;color:#888;font-weight:500;">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</div>
        </div>
        ${(e.role || e.location) ? `<div style="font-size:10px;font-weight:600;color:#4a5568;margin:2px 0 6px;text-transform:uppercase;letter-spacing:0.5px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
        <div style="font-size:11px;line-height:1.65;color:#444;">${renderBullets(e.bullets)}</div>
      </div>`).join('')}` : ''

  const eduHtml = education.length > 0 ? `
    ${label('Education')}
    ${education.map(e => `
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <div>
          <span style="font-size:12px;font-weight:700;color:${c.headingText};">${esc(e.institution)}</span>
          <span style="font-size:11px;color:#555;margin-left:10px;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</span>
        </div>
        <div style="font-size:10.5px;color:#888;">${esc(e.endDate)}</div>
      </div>`).join('')}` : ''

  const summaryHtml = personal.summary ? `
    ${label('Professional Summary')}
    <div style="font-size:11.5px;line-height:1.7;color:#333;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
    if (key === 'experience') return expHtml
    if (key === 'education') return eduHtml
    return ''
  }).join('')

  const header = `<div style="background:${c.headerBackground};color:${c.headerText};padding:40px 52px 32px;">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};letter-spacing:${ty.nameLetterSpacing || '1px'};text-transform:uppercase;color:#fff;margin-bottom:6px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:13px;font-weight:400;color:${c.headerMuted};letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">${esc(personal.title)}</div>` : ''}
    <div style="display:flex;gap:24px;font-size:11px;color:#cbd5e0;flex-wrap:wrap;">
      ${[personal.email, personal.phone, personal.location].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('')}
    </div>
  </div>`

  const body = `${header}${skillsBar}<div style="padding:28px 52px 40px;">${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── CREATIVE ────────────────────────────────────────────────── */
function renderCreative(content, t) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => `
    <div style="margin-bottom:14px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${c.accentStart};margin-bottom:4px;">${esc(text)}</div>
      <div style="height:2px;background:linear-gradient(90deg,${c.accentStart},${c.accentEnd});border-radius:1px;"></div>
    </div>`

  const allSkillItems = skills.flatMap(sk => sk.items)
  const pillColors = [
    { bg: '#ede9fe', color: '#5b21b6' },
    { bg: '#fce7f3', color: '#9d174d' },
  ]

  const skillsHtml = allSkillItems.length > 0 ? `
    ${label('Skills')}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px;">
      ${allSkillItems.map((item, i) => {
        const p = pillColors[i % 2]
        return `<span style="background:${p.bg};color:${p.color};font-size:10px;font-weight:500;padding:4px 12px;border-radius:20px;">${esc(item)}</span>`
      }).join('')}
    </div>` : ''

  const borderColors = [c.accentStart, c.accentEnd]

  const expHtml = experience.length > 0 ? `
    ${label('Experience')}
    ${experience.map((e, idx) => {
      const bc = borderColors[idx % 2]
      return `<div style="margin-bottom:16px;padding-left:14px;border-left:3px solid ${bc};">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:12.5px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
          <div style="font-size:10px;color:#888;">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</div>
        </div>
        ${(e.role || e.location) ? `<div style="font-size:11px;font-weight:600;color:${bc};margin:2px 0 6px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
        <div style="font-size:11px;line-height:1.65;color:#444;">${renderBullets(e.bullets)}</div>
      </div>`
    }).join('')}` : ''

  const eduHtml = education.length > 0 ? `
    ${label('Education')}
    <div style="display:flex;gap:32px;flex-wrap:wrap;">
      ${education.map((e, idx) => {
        const bc = borderColors[idx % 2]
        return `<div style="padding-left:14px;border-left:3px solid ${bc};">
          <div style="font-size:12px;font-weight:700;color:${c.headingText};">${esc(e.institution)}</div>
          <div style="font-size:11px;color:#555;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</div>
          <div style="font-size:10.5px;color:#999;">${esc(e.endDate)}</div>
        </div>`
      }).join('')}
    </div>` : ''

  const summaryHtml = personal.summary ? `
    ${label('About')}
    <div style="font-size:11.5px;line-height:1.7;color:#444;margin-bottom:24px;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
    if (key === 'experience') return expHtml
    if (key === 'education') return eduHtml
    return ''
  }).join('')

  const header = `<div style="background:linear-gradient(135deg,${c.accentStart},#7c3aed,${c.accentEnd});color:#fff;padding:40px 52px 32px;">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:#fff;letter-spacing:-0.5px;margin-bottom:4px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:${ty.titleFontSize};font-weight:400;color:#e0d9ff;letter-spacing:1px;margin-bottom:18px;">${esc(personal.title)}</div>` : ''}
    <div style="display:flex;gap:20px;font-size:11px;color:#d1c4ff;flex-wrap:wrap;">
      ${personal.email ? `<span>&#9993; ${esc(personal.email)}</span>` : ''}
      ${personal.phone ? `<span>${esc(personal.phone)}</span>` : ''}
      ${personal.location ? `<span>${esc(personal.location)}</span>` : ''}
    </div>
  </div>`

  const body = `${header}<div style="padding:28px 52px 40px;">${summaryHtml}${skillsHtml}${sectionsHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── DISPATCH ────────────────────────────────────────────────── */
const RENDERERS = { classic: renderClassic, modern: renderModern, minimal: renderMinimal, executive: renderExecutive, creative: renderCreative }

function renderToHtml(content, templateId) {
  const t = loadTemplate(templateId)
  const fn = RENDERERS[templateId]
  if (!fn) throw new Error(`Unknown template: ${templateId}`)
  return fn(content, t)
}

module.exports = { renderToHtml }
```

- [ ] **Step 4: Run the backend tests**

```bash
cd backend && npx jest src/__tests__/htmlRenderer.test.js 2>&1
```

Expected: all tests pass including the new `test.each` coverage.

- [ ] **Step 5: Run the full backend test suite**

```bash
cd backend && npx jest 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/renderer/htmlRenderer.js backend/src/__tests__/htmlRenderer.test.js
git commit -m "feat: refactor htmlRenderer to per-template render functions with pill-tag skills"
```

---

## Task 8: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run the complete frontend test suite**

```bash
cd frontend && npx vitest run 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 2: Run the complete backend test suite**

```bash
cd backend && npx jest 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 3: Start the dev server and visually verify all 5 templates**

```bash
cd frontend && npm run dev
```

Open http://localhost:5173, upload a resume or fill in the wizard, go to the preview page, and switch through all 5 templates using the template switcher. Verify:
- Classic: Playfair Display header, Lora body, gray pill skills
- Modern: 38% navy sidebar, no squeezed email, blue pill skills
- Minimal: thin Inter 300 name, dot-separated skills, no borders
- Executive: dark `#1a1a2e` header, skills badge bar below header, left-border section labels
- Creative: purple-to-magenta gradient header, alternating purple/pink pill skills, left-border experience entries

- [ ] **Step 4: Final commit if any minor visual fixes needed**

```bash
git add -p
git commit -m "fix: visual polish on template redesign"
```
