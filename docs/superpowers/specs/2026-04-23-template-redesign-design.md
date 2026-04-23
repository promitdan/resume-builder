# Template Redesign — Design Spec

**Date:** 2026-04-23  
**Status:** Approved

## Goal

Completely redesign all 5 resume templates (Classic, Modern, Minimal, Executive, Creative) to produce professional, visually polished output. Replace the current bland, unreadable renderings with proper typography hierarchy, pill-tag skills, and template-specific visual identity. Both the React preview components and the backend HTML renderer (used for PDF/DOCX export) must be updated to match.

---

## Scope

### Files Modified

**Frontend — React template components (full rewrite):**
- `frontend/src/components/preview/templates/ClassicTemplate.jsx`
- `frontend/src/components/preview/templates/ModernTemplate.jsx`
- `frontend/src/components/preview/templates/MinimalTemplate.jsx`
- `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`
- `frontend/src/components/preview/templates/CreativeTemplate.jsx`

**Backend — JSON config tokens (update values):**
- `backend/src/templates/classic.json`
- `backend/src/templates/modern.json`
- `backend/src/templates/minimal.json`
- `backend/src/templates/executive.json`
- `backend/src/templates/creative.json`

**Backend — HTML renderer (refactor):**
- `backend/src/services/renderer/htmlRenderer.js`

**Frontend — Fonts:**
- `frontend/index.html` — add Playfair Display + Lora (Classic needs them; others use Inter already loaded)

### Files NOT Changed

The store, wizard, API routes, content data model, and section ordering logic are unchanged. The `content` object shape (personal, experience, education, skills, sectionOrder) remains the same.

---

## Architecture

### Data Flow (unchanged)

```
User fills wizard → Zustand store → { personal, experience, education, skills, sectionOrder }
  → React template component (preview)
  → POST /api/export → htmlRenderer.js (PDF/DOCX)
```

### HTML Renderer Refactor

Current: one generic `renderSingleColumn` / `renderTwoColumn` driven by JSON.  
New: per-template render functions dispatched by template ID.

```js
// Dispatch table
const renderers = { classic, modern, minimal, executive, creative }

function renderToHtml(content, templateId) {
  const t = loadTemplate(templateId)          // still loads JSON for tokens
  const fn = renderers[templateId]
  if (!fn) throw new Error(`Unknown template: ${templateId}`)
  return fn(content, t)                       // fn returns full HTML string
}
```

Shared utilities retained: `esc()`, `renderBullets()`, `renderContact()`.  
New shared utility: `renderPillTags(items, pillStyle)` — renders an array of strings as pill-tag spans.

---

## Template Designs

### 1. Classic

**Identity:** Traditional finance/law resume. Serif-heavy. ATS-safe. Centered header.

**Fonts:**
- Name: Playfair Display 700, 28px, uppercase, letter-spacing 3px
- Body: Lora (serif), 11px, line-height 1.6
- Section labels: Playfair Display 700, 9px, uppercase, letter-spacing 3px

**Layout:** Single column, 56px side padding, 36px top padding.

**Header:** Centered. Name → italic title (13px, `#555`) → contact line (10.5px, `#666`). Bottom border: 2px solid `#111`.

**Section labels:** Thin gray rule (`1.5px solid #ccc`) below label text.

**Skills:** Pill tags — `#f2f2f2` background, `1px solid #ccc` border, `3px` border-radius, 10px Inter font, `#333` text. Flex-wrap.

**Experience:** Company bold (12px), date right-aligned italic (10px, `#666`), role italic below (11px, `#444`), bullets with `•` marker (Inter 10.5px).

**Education:** Institution bold (12px), degree italic (11px, `#444`), date right-aligned.

**Colors:** `#111` headings, `#333` body, `#555`/`#666` muted, `#fff` background.

---

### 2. Modern

**Identity:** Tech/finance hybrid. Dark navy sidebar. Clean Inter. Blue accents.

**Fonts:** Inter throughout. Name 15px 700 (sidebar), body 11px, section labels 9px uppercase.

**Layout:** Two-column. Sidebar 38%, main 62%.

**Sidebar (`#1e3a5f` background, `#d6e8ff` text):**
- Avatar circle (64px, `#4a9eff` bg, white initial letter, 26px bold)
- Name (15px 700 white), title (11px `#90b8e0`)
- Contact section: label in `#4a9eff` uppercase, contact lines wrap freely (word-break: break-word) — fixes the email squeeze
- Skills section: pill tags — `#1a4d7a` bg, `1px solid #2d6a9f` border, `#cce4ff` text, 9.5px, 12px border-radius
- Education section: institution bold white, degree `#90b8e0`, year `#7aa0c0`

**Main area (white background):**
- Summary paragraph (11px, `#333`)
- Section labels: 9px uppercase, `#1e3a5f` color, 2px `#4a9eff` bottom border
- Experience: company bold `#1e3a5f` (12px), job title in `#4a9eff` 600 weight, date right-aligned `#888`
- Bullets: Inter 10.5px, `#333`

**JSON tokens updated:** `sidebarWidthPercent: 38`, sidebar and accent colors.

---

### 3. Minimal

**Identity:** Ultra-clean. Generous whitespace. No decorative borders. Editorial feel.

**Fonts:** Inter 300/400/600. Name 32px weight 300. Body 11.5px. Labels 9px.

**Layout:** Single column, 64px side padding, 52px top padding.

**Header:** Name left-aligned (32px, weight 300, `#111`). Title below (14px, weight 400, `#666`, letter-spacing 0.5px). Contact line (11px, `#999`).

**Section labels:** 9px, weight 600, letter-spacing 3px, uppercase, color `#aaa`. No border, no rule — whitespace alone separates sections. 32px margin above each section.

**Skills:** Dot-separated inline text: `skill1 · skill2 · skill3`. Font 11px, color `#555`, line-height 2.

**Experience:** Company 13px 600 `#111`, date right-aligned 10.5px `#999`, role 11px `#666` below. Bullets 11px `#444`, line-height 1.7. 20px between entries.

**Education:** Three entries in a horizontal flex row with 40px gap.

**Colors:** `#111` headings, `#444` body, `#666`/`#999` muted. No accent color.

---

### 4. Executive

**Identity:** Senior/authoritative. Dark full-bleed header. Skills bar. Bold structure.

**Fonts:** Inter throughout. Name 32px weight 800. Body 11px. Labels 9px uppercase.

**Layout:** Single column. Header is full-bleed (no margin). Content: 52px side padding, 28px top padding.

**Header block (`#1a1a2e` background):**
- Name: 32px 800 weight white, letter-spacing 1px, uppercase
- Title: 13px 400 `#a0aec0`, letter-spacing 3px, uppercase
- Contact: flex row, 11px `#cbd5e0`
- Padding: 40px 52px 32px

**Skills bar (`#f7f7fa` background, `1px solid #e2e8f0` bottom border):**
- Displayed immediately below the dark header
- Pills: `#1a1a2e` bg, `#e0e0f0` text, 9.5px, 500 weight, 3px border-radius, 4px 11px padding
- Padding: 16px 52px

**Section labels:** 9px uppercase letter-spacing 3px, `#1a1a2e` color, `3px solid #1a1a2e` left border, 10px left padding. No bottom rule.

**Experience:** Company 13px 700 `#1a1a2e`, job title in small-caps uppercase (10px, `#4a5568`, letter-spacing 0.5px). Bullets 11px `#444`.

**Education:** Inline row — institution bold, degree normal weight, year right-aligned.

---

### 5. Creative

**Identity:** Modern personality. Gradient header. Colorful pill tags. Left-border accents.

**Fonts:** Inter throughout. Name 30px weight 800. Body 11px. Labels 9px.

**Layout:** Single column, 52px side padding, 28px top padding below header.

**Header block (gradient `#4f46e5` → `#7c3aed` → `#a21caf`, 135deg):**
- Name: 30px 800 white
- Title: 14px 400 `#e0d9ff`, letter-spacing 1px
- Contact: flex row with emoji icons (✉ ☎ 📍), 11px `#d1c4ff`
- Padding: 40px 52px 32px

**Section labels:** 9px uppercase letter-spacing 3px. Gradient text (`#4f46e5` → `#a21caf`) using `-webkit-background-clip: text`. Followed by a 2px full-width gradient bar (`border-radius: 1px`).

**Skills:** Alternating pill tags by array index — index % 2 === 0: `#ede9fe` bg / `#5b21b6` text (purple); index % 2 === 1: `#fce7f3` bg / `#9d174d` text (pink). 10px Inter 500, 20px border-radius, 4px 12px padding.

**Experience:** Each entry has a 3px left border, alternating purple (`#7c3aed`) and magenta (`#a21caf`). 14px left padding. Company 12.5px 700 `#1e1b4b`, job title 11px 600 in matching accent color.

**Education:** Three entries in horizontal flex row, each with 3px left border (alternating colors).

---

## Shared Changes

### `renderPillTags` utility (HTML renderer)

```js
function renderPillTags(items, pillStyle) {
  // pillStyle: { bg, color, border, borderRadius, fontSize, padding }
  return `<div style="display:flex;flex-wrap:wrap;gap:5px;">
    ${items.map(item => `<span style="background:${pillStyle.bg};color:${pillStyle.color};
      border:${pillStyle.border || 'none'};border-radius:${pillStyle.borderRadius};
      font-size:${pillStyle.fontSize};padding:${pillStyle.padding};
      font-family:Inter,sans-serif;">${esc(item)}</span>`).join('')}
  </div>`
}
```

### Google Fonts (frontend/index.html)

Add to existing font preloads:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

---

## What Is NOT Changing

- Resume data model (`personal`, `experience`, `education`, `skills`, `sectionOrder`)
- Zustand store structure
- Wizard step components
- Landing page, BuildPage, PreviewPage layouts
- `TemplateSwitcher` component
- Backend API routes
- Test infrastructure

---

## Success Criteria

1. All 5 templates render visually in the React preview with: correct fonts, pill-tag skills, proper hierarchy, no squeezed text
2. PDF/DOCX export via `htmlRenderer.js` produces output that matches the React preview for each template
3. All existing tests continue to pass (no data model or API changes)
4. Modern sidebar email/contact does not overflow or squeeze
