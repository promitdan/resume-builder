# Rich Text Editing + AI Writing Assistance

**Date:** 2026-04-26  
**Status:** Approved

---

## Overview

Replace the plain-text `InlineEditor` on summary and bullet fields with a TipTap-powered rich text editor. Add a Slack-style floating toolbar with formatting controls and an "Ask AI" button that opens a small popover with three AI writing actions.

---

## Scope

**Rich text applies to:**
- `personal.summary`
- `experience[i].bullets[j]`
- `projects[i].bullets[j]`

**Everything else** (names, titles, dates, company names, locations, skills, etc.) keeps the existing plain-text `InlineEditor`.

---

## Data Model

No store schema changes. Rich text fields stay as strings — they just contain HTML instead of plain text.

```
// Before
personal.summary: "Results-driven engineer..."
experience[0].bullets: ["Led migration...", "Reduced latency..."]

// After
personal.summary: "<p>Results-driven engineer <strong>with 10+ years</strong>...</p>"
experience[0].bullets: ["<p><strong>Led</strong> migration...</p>", "<p>Reduced latency...</p>"]
```

`setField(path, value)` is unchanged — the value is now an HTML string.

**Export compatibility:** The existing `htmlRenderer` already injects HTML into templates, so rich text flows through to PDF/DOCX export with no backend changes.

---

## Frontend Components

### `RichTextEditor`

**Location:** `frontend/src/components/preview/RichTextEditor.jsx`

- Replaces `InlineEditor` for rich text fields in all five templates
- Props: `path` (store path), `value` (HTML string)
- Uses TipTap `useEditor` with extensions: `StarterKit`, `Underline`, `Link`
- Styled to be visually invisible until focused (same blue left-border as current InlineEditor)
- On blur: calls `setField(path, editor.getHTML())`
- Templates render unfocused fields with `dangerouslySetInnerHTML={{ __html: value }}` so formatting is visible in the live preview

### `RichTextToolbar`

**Location:** `frontend/src/components/preview/RichTextToolbar.jsx`

- Uses TipTap's `BubbleMenu` configured to show on editor focus (not selection-only)
- Controls in order: **B** (bold) · *I* (italic) · <u>U</u> (underline) · 🔗 (link) · divider · **✨ Ask AI**
- Clicking **Ask AI** opens `AiAssistPopover` anchored below the toolbar

### `AiAssistPopover`

**Location:** `frontend/src/components/preview/AiAssistPopover.jsx`

- Three chip buttons: **Improve** · **Make concise** · **Fix grammar**
- On chip click:
  1. Strip HTML tags from current editor content
  2. POST to `/api/ai/assist` with `{ text, action }`
  3. Show spinner, disable chips
  4. On success: call `editor.commands.setContent("<p>" + result + "</p>")`, close popover
  5. On error: show inline message "Couldn't reach AI — try again." Keep original content
- Popover closes automatically on success or when user clicks outside

### Template Changes

In each of the five templates (`ModernTemplate`, `ClassicTemplate`, `MinimalTemplate`, `ExecutiveTemplate`, `CreativeTemplate`):

- `<InlineEditor multiline path="personal.summary">` → `<RichTextEditor path="personal.summary" value={...} />`
- `<InlineEditor path="experience.N.bullets.M">` → `<RichTextEditor path="experience.N.bullets.M" value={...} />`
- `<InlineEditor path="projects.N.bullets.M">` → `<RichTextEditor path="projects.N.bullets.M" value={...} />`
- All other `InlineEditor` usages remain unchanged

---

## Backend

### New Endpoint

`POST /api/ai/assist`

**Request:**
```json
{ "text": "worked on migration of monolith", "action": "improve" }
```

**Response:**
```json
{ "result": "Led full migration of monolith to microservices architecture" }
```

**Actions and system prompts:**

| Action | System prompt |
|---|---|
| `improve` | Rewrite this resume bullet or summary to be more impactful and professional. Use strong action verbs. Return only the improved text, no explanation. |
| `concise` | Shorten this to one tight, punchy sentence. Keep the key achievement. Return only the result, no explanation. |
| `grammar` | Fix any grammar, spelling, or punctuation errors. Return only the corrected text, no explanation. |

### New Files

- `backend/src/services/ai/resumeAssistant.js` — builds prompts, calls Groq, falls back to Ollama if Groq is unavailable (reuses existing clients)
- `backend/src/routes/assist.js` — registers `POST /api/ai/assist`, validates request, calls `resumeAssistant`
- `backend/src/index.js` — mounts the new route

### AI Processing Flow

1. Receive `{ text, action }` — text is already plain (HTML stripped on frontend before sending)
2. Select system prompt by action
3. Call Groq (`meta-llama/llama-4-scout-17b-16e-instruct`, temperature 0.3, 30s timeout)
4. If Groq unavailable, fall back to Ollama
5. Return `{ result: trimmedText }`

---

## UX Flow

1. User clicks a bullet or summary → editor activates, blue left-border appears
2. Floating toolbar appears above the field
3. User formats text directly (bold, italic, etc.) **or** clicks **✨ Ask AI**
4. AI popover opens → user picks an action → spinner → content replaced → popover closes
5. User clicks outside → blur fires → `setField` saves HTML to store

---

## Dependencies

**Frontend (new):**
- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-underline`
- `@tiptap/extension-link`

**Backend:** No new dependencies — reuses existing Groq and Ollama clients.

---

## What Does Not Change

- Store actions (`setField`, etc.)
- Wizard step forms (they use plain `<input>`/`<textarea>`, not InlineEditor)
- Export pipeline (`htmlRenderer`, `docxExporter`)
- All `InlineEditor` usages on non-rich-text fields
