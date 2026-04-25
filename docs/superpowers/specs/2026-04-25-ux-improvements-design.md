# UX Improvements Design Spec

**Date:** 2026-04-25

## Overview

Four UX improvements to the resume builder app. Each improvement is independent; they share only the Zustand store as a dependency.

---

## 1. Landing Page — Two-Card Split

### What

Replace the current landing page with a two-card side-by-side layout. Both cards have equal visual weight.

**Upload card:**
- Icon + "Upload resume" headline + subtext ("AI parses your PDF or DOCX")
- Drag-and-drop zone rendered inline — no extra click to reveal it
- Triggers upload → parse → navigate to Preview on success

**Start from scratch card:**
- Icon + "Start from scratch" headline + subtext ("Step-by-step guided builder")
- Primary blue CTA button → navigates to wizard (step 1)

**Below both cards:**
- "or load sample data" text link — loads sample content into store, navigates to Preview

### What changes

- `frontend/src/pages/LandingPage.jsx` — rewrite layout to two-column card grid; move `UploadDropzone` inline into the upload card
- `frontend/src/components/landing/UploadDropzone.jsx` — remove any expand/collapse toggle logic; always render dropzone body
- Upload success handler in LandingPage navigates to `/preview` instead of `/build`

---

## 2. Upload Flow — Skip the Wizard

### What

After a successful upload and parse, route directly to `/preview`. The wizard is only for "Start from scratch."

The preview page already shows the full resume. From there, the user edits inline or clicks "Edit in wizard" to enter the wizard pre-filled.

### What changes

- `frontend/src/pages/LandingPage.jsx` — upload success callback: `navigate('/preview')` instead of `navigate('/build')`
- No wizard changes needed for the upload path

---

## 3. Preview Page — Two Edit Paths

### 3a. "Edit in wizard" button

A persistent button on the Preview page that routes to `/build` (the wizard), carrying the current store content. Since the store is already populated, the wizard renders pre-filled.

The wizard must allow clicking any step freely when data exists (not just "completed" steps). A step is clickable if the store has any content at all (i.e., `personal.name` is non-empty).

**What changes:**
- `frontend/src/pages/PreviewPage.jsx` — add "Edit in wizard" button that calls `navigate('/build')`
- `frontend/src/components/wizard/WizardLayout.jsx` — change `canClick` condition: `const canClick = done || hasContent` where `hasContent = !!personal?.name`

### 3b. Click-to-edit inline

Clicking any text element in the preview activates an in-place editable field. A mini-toolbar (✓ / ✕) appears to confirm or cancel. Confirming writes the new value to the Zustand store; cancelling restores the original. The preview re-renders immediately on confirm.

**Scope of editable fields (MVP):**
- Personal section: name, title, email, phone, location, summary
- Experience entries: role, company, location, each bullet
- Education entries: degree, field, institution, gpa
- Skills: each item within a category
- Projects: title, description, url
- Certifications: name, issuer, date
- Languages: language name, proficiency
- Awards: title, issuer, date
- Custom sections: title, each bullet line in description

**Interaction model:**
- Click a text node → it becomes a controlled `<input>` or `<textarea>` (textarea for multi-line fields like summary and bullets)
- A small floating toolbar renders below/beside the field with ✓ (save) and ✕ (cancel) buttons
- Pressing Enter in a single-line field confirms; Escape cancels
- Only one field editable at a time — clicking another field while one is open cancels the open edit first
- Clicking outside the field + toolbar cancels the edit

**What changes:**
- New `frontend/src/components/preview/InlineEditor.jsx` — wrapper component: renders either the display node or an editable field + toolbar
- Each template (ClassicTemplate, ModernTemplate, MinimalTemplate, ExecutiveTemplate, CreativeTemplate) wraps editable text nodes with `<InlineEditor>`
- `useResumeStore` must expose a generic `setField(path, value)` setter using dot-notation paths with array index support (e.g. `'experience.0.role'`). Implement using `lodash/set` — add `lodash` as a frontend dependency (`npm install lodash`).

**Store setter design:**
```js
import { set as lodashSet } from 'lodash'

// e.g. setField('personal.name', 'Alice') or setField('experience.0.role', 'Engineer')
setField: (path, value) => set(state => {
  const content = structuredClone(state.content)
  lodashSet(content, path, value)
  return { content }
})
```

---

## 4. Template Section Ordering — Skills Near Top

### What

Change the default `sectionOrder` so Skills appears after Experience (not at the bottom). Recruiters scan for Skills early; burying it last hurts the resume.

**New default order:**
```
personal → experience → skills → education → projects → certifications → languages → awards → custom
```

This default applies to:
1. The Zustand store initial state (used when starting from scratch)
2. The parsed content returned by `normalizeLlmContent()` (used when uploading)
3. All 5 template JSON files (used by exporters)

### What changes

- `frontend/src/store/useResumeStore.js` — update `sectionOrder` default array
- `backend/src/services/parser/llmContentMapper.js` — update the `sectionOrder` returned by `normalizeContent()`
- `frontend/src/templates/classic.json`, `modern.json`, `minimal.json`, `executive.json`, `creative.json` — update `sectionOrder` array in each

---

## Out of Scope

- Drag-to-reorder sections on the preview page
- Per-template section order customization
- Rich text editing (bold, italic) in inline editor
- Adding or removing sections from the preview page
- Undo/redo history

---

## Dependencies Between Improvements

All four improvements are independent of each other and can be implemented in any order. The only shared dependency is the Zustand store (`useResumeStore`).

Improvement 3b (inline edit) depends on improvement 3a (Edit in wizard button) only in that they both touch PreviewPage — they can be implemented in the same task or sequentially.
