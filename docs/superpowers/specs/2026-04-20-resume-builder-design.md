# Resume Builder — Design Spec
**Date:** 2026-04-20
**Status:** Approved

---

## Overview

A web-based resume builder that lets users either build a resume from scratch via a guided wizard, or upload an existing PDF/DOCX and have it parsed into an editable form. Users can switch between 5 industry-standard templates and download their finished resume as PDF or DOCX. No accounts, no data collection — fully stateless and privacy-first.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React |
| Backend | Node.js + Express |
| State management | Zustand |
| PDF export | Puppeteer (headless Chromium) |
| DOCX export | docx.js |
| PDF parsing | pdf-parse |
| DOCX parsing | mammoth.js |
| File uploads | multer |

**Monorepo structure:**
```
resume-builder/
├── frontend/       Vite + React
├── backend/        Node + Express
├── .gitignore
└── README.md
```

Both `frontend/` and `backend/` are independent with their own `package.json`. Dev runs both concurrently.

---

## Core Principles

- **No auth, no database.** All state lives in the browser (Zustand store) for the duration of the session. The backend is stateless — it receives data, processes it, and returns a result. Nothing is persisted server-side.
- **Content and template are always separate.** The Content JSON (user data) and Template JSON (visual rules) are never merged into a stored artifact. The Filled Template is always derived at runtime.
- **AI-ready from day one.** Route namespaces, store slices, and SSE infrastructure are in place before any AI features are built.

---

## Data Models

### Content JSON

The single source of truth for all resume data. Shared by the frontend (wizard, preview) and all future AI agents. Arrays grow/shrink per user — the template never encodes content.

```json
{
  "meta": { "version": "1.0", "updatedAt": "ISO date" },
  "personal": {
    "name": "", "title": "", "email": "", "phone": "",
    "location": "", "linkedin": "", "website": "", "summary": ""
  },
  "experience": [{
    "id": "uuid", "company": "", "role": "", "location": "",
    "startDate": "", "endDate": "", "current": false, "bullets": [""]
  }],
  "education": [{
    "id": "uuid", "institution": "", "degree": "",
    "field": "", "startDate": "", "endDate": "", "gpa": ""
  }],
  "skills": [{ "id": "uuid", "category": "", "items": [""] }],
  "projects": [{ "id": "uuid", "name": "", "description": "", "url": "", "bullets": [""] }],
  "certifications": [{ "id": "uuid", "name": "", "issuer": "", "date": "", "url": "" }],
  "languages": [{ "id": "uuid", "language": "", "proficiency": "" }],
  "awards": [{ "id": "uuid", "title": "", "issuer": "", "date": "", "description": "" }],
  "custom": [{ "id": "uuid", "label": "", "content": "" }],
  "sectionOrder": ["personal", "experience", "education", "skills"],
  "_raw": ""
}
```

`sectionOrder` starts with the 4 core sections. When a user toggles on an optional section in Step 5, its key is appended to `sectionOrder`. The renderer iterates `sectionOrder` to determine what renders and in what sequence. `_raw` is a backend-only field populated with any text from the uploaded resume that couldn't be mapped to a known section — used as a reference during the wizard, not rendered in the template.

```json
```

### Template JSON

A complete static visual specification. One file per template, stored in `backend/src/templates/`. Never changes based on user data. Fully describes colors, fonts, spacing, and layout rules.

```json
{
  "id": "modern",
  "name": "Modern",
  "layout": {
    "type": "two-column",
    "sidebarPosition": "left",
    "sidebarWidthPercent": 35,
    "pageMarginTop": "0.5in",
    "pageMarginSides": "0in",
    "sectionSpacing": "14px",
    "itemSpacing": "8px"
  },
  "colors": {
    "sidebarBackground": "#1e3a5f",
    "sidebarText": "#ffffff",
    "sidebarAccent": "#4a9eda",
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#1e3a5f",
    "accentColor": "#4a9eda",
    "dividerColor": "#4a9eda",
    "mutedText": "#666666"
  },
  "typography": {
    "nameFont": "Arial, sans-serif",
    "nameFontSize": "22px",
    "nameFontWeight": "700",
    "titleFont": "Arial, sans-serif",
    "titleFontSize": "12px",
    "sectionLabelFont": "Arial, sans-serif",
    "sectionLabelSize": "10px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "2px",
    "bodyFont": "Arial, sans-serif",
    "bodyFontSize": "10px",
    "bodyLineHeight": "1.5"
  },
  "header": {
    "placement": "sidebar-top",
    "alignment": "center",
    "showAvatar": true,
    "avatarStyle": "circle",
    "avatarSizePx": 64
  },
  "sections": {
    "dividerStyle": "solid-accent",
    "bulletStyle": "dash",
    "dateAlignment": "inline-right",
    "sidebarSections": ["personal-contact", "skills", "languages"],
    "mainSections": ["summary", "experience", "education", "projects", "certifications", "awards", "custom"]
  }
}
```

Single-column templates use `sections.order` (flat array) instead of `sidebarSections`/`mainSections`.

### Rendering Model

```
Template JSON  (visual rules, static)
      +
Content JSON   (user data, variable)
      ↓
  Filled Template  (rendered at runtime — never stored)
```

- **In browser:** React renders live preview HTML from both sources
- **On export:** Backend receives Content JSON + templateId → loads Template JSON → renders HTML → Puppeteer (PDF) or docx.js (DOCX)

---

## Templates

5 industry-standard styles, each with its own Template JSON:

| ID | Name | Layout | Best for |
|---|---|---|---|
| `classic` | Classic | Single column, serif, centered header | Law, finance, academia |
| `modern` | Modern | Two column, colored sidebar | Tech, product roles |
| `minimal` | Minimal | Single column, thin fonts, monochrome | Designers, senior ICs |
| `executive` | Executive | Single column, dark bold header, summary section | C-suite, VP, director |
| `creative` | Creative | Two column, gradient header, pill skill tags | Designers, marketers, creatives |

---

## Frontend

### Routes

```
/           Landing page — Dual CTA
/build      Step-by-step wizard
/preview    Full-page preview + template switcher + download
```

### Wizard Steps (`/build`)

```
Step 1 → Personal Info          (name, title, email, phone, location, linkedin, website, summary)
Step 2 → Work Experience        (add/remove/reorder entries, bullet points per entry)
Step 3 → Education              (add/remove entries)
Step 4 → Skills                 (categories + items per category)
Step 5 → Optional Sections      (toggle on/off: Projects, Certifications, Languages, Awards, Custom)
Step 6 → Choose Template        (live mini-previews of all 5 templates)
Step 7 → Preview & Download
```

Each step validates required fields before allowing "Next". Validation errors shown inline — no modals. No data is lost if the user navigates back.

### State Management (Zustand)

**`useResumeStore`** — ships with v1:
```js
{
  content: ContentJSON,
  templateId: 'classic',
  actions: {
    setContent,             // replaces full content (used after upload parse)
    updatePersonal,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    updateSkills,
    toggleOptionalSection,
    reorderSections,
    setTemplateId,
    resetResume
  }
}
```

**`useAgentStore`** — reserved for AI milestone:
```js
{
  review: { score: null, feedback: [], loading: false },
  suggestions: { items: [], loading: false },
  jobMatch: { score: null, gaps: [], loading: false },
  benchmark: { courses: [], loading: false }
}
```

### Component Tree

```
App
├── LandingPage
│   ├── HeroCTA               (Start Fresh / Upload Resume buttons)
│   └── UploadDropzone        (drag/drop or click, PDF/DOCX)
├── BuildPage (wizard shell)
│   ├── WizardLayout          (step indicator, back/next, progress bar)
│   ├── PersonalInfoStep
│   ├── ExperienceStep        (dynamic list — add/remove/reorder)
│   ├── EducationStep
│   ├── SkillsStep
│   ├── OptionalSectionsStep
│   ├── TemplatePickerStep    (mini previews of all 5)
│   └── PreviewStep
└── PreviewPage
    ├── ResumePreview         (live renderer)
    │   ├── ClassicTemplate
    │   ├── ModernTemplate
    │   ├── MinimalTemplate
    │   ├── ExecutiveTemplate
    │   └── CreativeTemplate
    ├── TemplateSwitcher
    └── DownloadButtons       (PDF + DOCX)
```

Each template component receives the full Content JSON as props and renders using layout/styles derived from its Template JSON. Switching templates swaps the component — props are unchanged.

---

## Backend

### Directory Structure

```
backend/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── upload.js         POST /api/upload
│   │   ├── export.js         POST /api/export/pdf, POST /api/export/docx
│   │   └── agents/           reserved — empty for now
│   ├── services/
│   │   ├── parser/
│   │   │   ├── pdfParser.js      pdf-parse → raw text
│   │   │   ├── docxParser.js     mammoth.js → raw text
│   │   │   └── contentMapper.js  raw text → Content JSON
│   │   ├── exporter/
│   │   │   ├── pdfExporter.js    Puppeteer → PDF buffer
│   │   │   └── docxExporter.js   docx.js → DOCX buffer
│   │   └── renderer/
│   │       └── htmlRenderer.js   Content JSON + Template JSON → HTML string
│   └── templates/
│       ├── classic.json
│       ├── modern.json
│       ├── minimal.json
│       ├── executive.json
│       └── creative.json
```

### API Endpoints

```
POST /api/upload
  body:     multipart/form-data { file: PDF|DOCX }
  response: { content: ContentJSON }

POST /api/export/pdf
  body:     { content: ContentJSON, templateId: string }
  response: PDF buffer (application/pdf)

POST /api/export/docx
  body:     { content: ContentJSON, templateId: string }
  response: DOCX buffer (application/vnd.openxmlformats-officedocument...)

/api/agents/*
  reserved — not implemented in v1
```

### Upload Parse Pipeline

```
uploaded file
  → detect MIME type (application/pdf | .docx)
  → pdfParser (pdf-parse) or docxParser (mammoth.js) → raw text string
  → contentMapper:
      regex + keyword heuristics to detect section headings
      (matches "Experience", "Work History", "Employment" etc.)
      maps detected blocks → Content JSON fields
      unmapped content → raw fallback field (nothing lost)
  → return { content: ContentJSON }
```

v1 is rule-based. AI-assisted parsing will replace/augment `contentMapper` in a future milestone without changing the route interface.

### Export Pipeline

**PDF:**
```
receive { content, templateId }
  → load Template JSON from templates/
  → htmlRenderer: Content JSON + Template JSON → full HTML string
  → Puppeteer: launch headless Chromium, render HTML, page size A4
  → return PDF buffer → stream to client
```

**DOCX:**
```
receive { content, templateId }
  → load Template JSON from templates/
  → docxExporter: map Content JSON sections → docx.js primitives
      (Paragraph, TextRun, Table for two-column layouts)
      apply colors/fonts from Template JSON
  → return DOCX buffer → stream to client
```

---

## Error Handling

### Frontend

| Scenario | Behavior |
|---|---|
| Wrong file type on upload | Inline error on drop zone, retry without page reload |
| File too large (>10MB) | Inline error on drop zone |
| Parse returns partial content | Pre-fill what was parsed, user corrects in wizard |
| Export request fails | Toast notification with retry, wizard state preserved |
| Wizard required field missing | Inline field highlight, cannot advance to next step |

### Backend

All routes wrapped in try/catch. Consistent error shape: `{ error: string, code: string }`.

| Scenario | Status |
|---|---|
| Unsupported file type | 400 |
| File too large | 413 |
| Parse failure (partial) | 422 with partial content + raw fallback |
| Invalid templateId | 400 |
| Render/export failure | 500 |

Multer file size limit: 10MB.

---

## AI Roadmap (Post-v1)

Four agents planned, all consuming Content JSON via `/api/agents/*`:

| Agent | Route | Purpose |
|---|---|---|
| Resume Reviewer | `POST /api/agents/review` | Score resume quality, flag weak areas |
| Content Generator | `POST /api/agents/content` | Generate/rephrase section bullets (streaming SSE) |
| Job Matcher | `POST /api/agents/match` | Match resume against a job posting, identify gaps |
| Benchmarker | `POST /api/agents/benchmark` | Benchmark against role standards, suggest courses |

All agents will use the Claude API (Anthropic SDK) on the backend. Content generation uses Server-Sent Events for streaming UX. The `useAgentStore` Zustand slice is reserved for agent state from v1.
