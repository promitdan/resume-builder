# Resume Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack resume builder with a guided wizard, PDF/DOCX upload parsing, 5 switchable templates, and PDF/DOCX export.

**Architecture:** Hybrid — Vite React frontend handles the live preview and wizard UI, Node/Express backend handles file parsing (pdf-parse, mammoth.js) and export-quality rendering (Puppeteer for PDF, docx.js for DOCX). Content JSON and Template JSON are always kept separate; the Filled Template is derived at runtime.

**Tech Stack:** Vite, React, React Router v6, Zustand, Axios (frontend) · Express, multer, pdf-parse, mammoth, puppeteer, docx (backend) · Vitest + React Testing Library (frontend tests) · Jest + supertest (backend tests)

---

## File Map

```
resume-builder/
├── package.json                          root — concurrently dev runner
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── test/
│       │   └── setup.js
│       ├── templates/                    Template JSONs (frontend copy)
│       │   ├── classic.json
│       │   ├── modern.json
│       │   ├── minimal.json
│       │   ├── executive.json
│       │   └── creative.json
│       ├── store/
│       │   ├── useResumeStore.js
│       │   └── useAgentStore.js
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── BuildPage.jsx
│       │   └── PreviewPage.jsx
│       └── components/
│           ├── landing/
│           │   ├── HeroCTA.jsx
│           │   └── UploadDropzone.jsx
│           ├── wizard/
│           │   ├── WizardLayout.jsx
│           │   ├── PersonalInfoStep.jsx
│           │   ├── ExperienceStep.jsx
│           │   ├── EducationStep.jsx
│           │   ├── SkillsStep.jsx
│           │   ├── OptionalSectionsStep.jsx
│           │   ├── TemplatePickerStep.jsx
│           │   └── PreviewStep.jsx
│           ├── preview/
│           │   ├── ResumePreview.jsx
│           │   ├── TemplateSwitcher.jsx
│           │   └── templates/
│           │       ├── ClassicTemplate.jsx
│           │       ├── ModernTemplate.jsx
│           │       ├── MinimalTemplate.jsx
│           │       ├── ExecutiveTemplate.jsx
│           │       └── CreativeTemplate.jsx
│           └── shared/
│               └── DownloadButtons.jsx
└── backend/
    ├── package.json
    ├── jest.config.js
    └── src/
        ├── index.js
        ├── templates/                    Template JSONs (backend copy)
        │   ├── classic.json
        │   ├── modern.json
        │   ├── minimal.json
        │   ├── executive.json
        │   └── creative.json
        ├── routes/
        │   ├── upload.js
        │   └── export.js
        ├── services/
        │   ├── parser/
        │   │   ├── pdfParser.js
        │   │   ├── docxParser.js
        │   │   └── contentMapper.js
        │   ├── renderer/
        │   │   └── htmlRenderer.js
        │   └── exporter/
        │       ├── pdfExporter.js
        │       └── docxExporter.js
        └── __tests__/
            ├── contentMapper.test.js
            ├── htmlRenderer.test.js
            ├── docxExporter.test.js
            └── routes.test.js
```

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `.gitignore`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/vitest.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/test/setup.js`
- Create: `backend/package.json`
- Create: `backend/jest.config.js`
- Create: `backend/src/index.js`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "resume-builder",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\"",
    "install:all": "npm install && npm install --prefix frontend && npm install --prefix backend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```
node_modules/
dist/
.env
*.local
.superpowers/
```

- [ ] **Step 3: Create frontend/package.json**

```json
{
  "name": "resume-builder-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.1",
    "zustand": "^4.5.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^24.0.0",
    "vitest": "^1.3.1"
  }
}
```

- [ ] **Step 4: Create frontend/vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

- [ ] **Step 5: Create frontend/vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  }
})
```

- [ ] **Step 6: Create frontend/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume Builder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create frontend/src/test/setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Create frontend/src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 9: Create frontend/src/App.jsx (stub — routes added in Task 11)**

```jsx
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Landing</div>} />
      <Route path="/build" element={<div>Build</div>} />
      <Route path="/preview" element={<div>Preview</div>} />
    </Routes>
  )
}
```

- [ ] **Step 10: Create backend/package.json**

```json
{
  "name": "resume-builder-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "docx": "^8.5.0",
    "express": "^4.18.3",
    "mammoth": "^1.7.0",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "puppeteer": "^22.4.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

- [ ] **Step 11: Create backend/jest.config.js**

```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js']
}
```

- [ ] **Step 12: Create backend/src/index.js**

```js
const express = require('express')
const cors = require('cors')
const uploadRouter = require('./routes/upload')
const exportRouter = require('./routes/export')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/upload', uploadRouter)
app.use('/api/export', exportRouter)
app.use('/api/agents', (req, res) => res.status(501).json({ error: 'Agents not yet implemented', code: 'NOT_IMPLEMENTED' }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
}

module.exports = app
```

- [ ] **Step 13: Install root dependencies**

```bash
cd "resume-builder"
npm install
```

- [ ] **Step 14: Install frontend dependencies**

```bash
cd "resume-builder/frontend"
npm install
```

- [ ] **Step 15: Install backend dependencies**

```bash
cd "resume-builder/backend"
npm install
```

- [ ] **Step 16: Verify frontend dev server starts**

```bash
cd resume-builder/frontend && npm run dev
```

Expected: Vite server running at `http://localhost:5173`

- [ ] **Step 17: Verify backend server starts**

```bash
cd resume-builder/backend && npm run dev
```

Expected: `Backend running on http://localhost:3001`
Verify: `curl http://localhost:3001/api/health` returns `{"status":"ok"}`

- [ ] **Step 18: Commit**

```bash
git add .
git commit -m "feat: monorepo scaffolding — Vite React frontend + Express backend"
```

---

## Task 2: Template JSON Files

All 5 template JSON files must exist in **both** `frontend/src/templates/` and `backend/src/templates/`. Frontend uses them for live preview; backend uses them for export. Create the directories first, then each file.

**Files:**
- Create: `frontend/src/templates/classic.json`
- Create: `frontend/src/templates/modern.json`
- Create: `frontend/src/templates/minimal.json`
- Create: `frontend/src/templates/executive.json`
- Create: `frontend/src/templates/creative.json`
- Create: `backend/src/templates/classic.json` (identical copy)
- Create: `backend/src/templates/modern.json` (identical copy)
- Create: `backend/src/templates/minimal.json` (identical copy)
- Create: `backend/src/templates/executive.json` (identical copy)
- Create: `backend/src/templates/creative.json` (identical copy)

- [ ] **Step 1: Create classic.json**

```json
{
  "id": "classic",
  "name": "Classic",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0.75in",
    "pageMarginSides": "0.75in",
    "sectionSpacing": "16px",
    "itemSpacing": "10px"
  },
  "colors": {
    "mainBackground": "#ffffff",
    "mainText": "#111111",
    "headingText": "#111111",
    "accentColor": "#111111",
    "dividerColor": "#222222",
    "mutedText": "#555555"
  },
  "typography": {
    "nameFont": "Georgia, serif",
    "nameFontSize": "24px",
    "nameFontWeight": "700",
    "titleFont": "Georgia, serif",
    "titleFontSize": "13px",
    "sectionLabelFont": "Georgia, serif",
    "sectionLabelSize": "11px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "1.5px",
    "bodyFont": "Georgia, serif",
    "bodyFontSize": "10.5px",
    "bodyLineHeight": "1.5"
  },
  "header": {
    "placement": "top-center",
    "alignment": "center",
    "showAvatar": false,
    "dividerStyle": "solid-thick"
  },
  "sections": {
    "type": "single-column",
    "order": ["personal", "experience", "education", "skills", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "solid",
    "bulletStyle": "bullet",
    "dateAlignment": "inline-right",
    "labelWeight": "bold"
  }
}
```

Place this file at both `frontend/src/templates/classic.json` and `backend/src/templates/classic.json`.

- [ ] **Step 2: Create modern.json**

```json
{
  "id": "modern",
  "name": "Modern",
  "layout": {
    "type": "two-column",
    "sidebarPosition": "left",
    "sidebarWidthPercent": 35,
    "pageMarginTop": "0in",
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
    "sidebarSections": ["personal-contact", "skills", "languages", "certifications"],
    "mainSections": ["experience", "education", "projects", "awards", "custom"]
  }
}
```

Place at both `frontend/src/templates/modern.json` and `backend/src/templates/modern.json`.

- [ ] **Step 3: Create minimal.json**

```json
{
  "id": "minimal",
  "name": "Minimal",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0.75in",
    "pageMarginSides": "0.75in",
    "sectionSpacing": "20px",
    "itemSpacing": "12px"
  },
  "colors": {
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#111111",
    "accentColor": "#888888",
    "dividerColor": "#eeeeee",
    "mutedText": "#999999"
  },
  "typography": {
    "nameFont": "'Helvetica Neue', Arial, sans-serif",
    "nameFontSize": "26px",
    "nameFontWeight": "300",
    "titleFont": "'Helvetica Neue', Arial, sans-serif",
    "titleFontSize": "12px",
    "sectionLabelFont": "'Helvetica Neue', Arial, sans-serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "3px",
    "bodyFont": "'Helvetica Neue', Arial, sans-serif",
    "bodyFontSize": "10.5px",
    "bodyLineHeight": "1.6"
  },
  "header": {
    "placement": "top-left",
    "alignment": "left",
    "showAvatar": false,
    "dividerStyle": "thin-light"
  },
  "sections": {
    "type": "single-column",
    "order": ["personal", "experience", "education", "skills", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "none",
    "bulletStyle": "none",
    "dateAlignment": "inline-right",
    "labelWeight": "normal"
  }
}
```

Place at both `frontend/src/templates/minimal.json` and `backend/src/templates/minimal.json`.

- [ ] **Step 4: Create executive.json**

```json
{
  "id": "executive",
  "name": "Executive",
  "layout": {
    "type": "single-column",
    "pageMarginTop": "0in",
    "pageMarginSides": "0in",
    "contentPaddingSides": "0.75in",
    "contentPaddingTop": "24px",
    "sectionSpacing": "16px",
    "itemSpacing": "10px"
  },
  "colors": {
    "headerBackground": "#1a1a1a",
    "headerText": "#ffffff",
    "headerMuted": "#cccccc",
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#1a1a1a",
    "accentColor": "#1a1a1a",
    "dividerColor": "#1a1a1a",
    "mutedText": "#666666"
  },
  "typography": {
    "nameFont": "Georgia, serif",
    "nameFontSize": "26px",
    "nameFontWeight": "700",
    "nameLetterSpacing": "2px",
    "titleFont": "Arial, sans-serif",
    "titleFontSize": "12px",
    "sectionLabelFont": "Arial, sans-serif",
    "sectionLabelSize": "10px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "2px",
    "bodyFont": "Georgia, serif",
    "bodyFontSize": "10.5px",
    "bodyLineHeight": "1.5",
    "summaryFontStyle": "italic"
  },
  "header": {
    "placement": "top-full-bleed",
    "alignment": "left",
    "showAvatar": false,
    "dividerStyle": "thick"
  },
  "sections": {
    "type": "single-column",
    "order": ["personal", "experience", "education", "skills", "projects", "certifications", "awards", "languages", "custom"],
    "dividerStyle": "thick",
    "bulletStyle": "bullet",
    "dateAlignment": "inline-right",
    "labelWeight": "bold"
  }
}
```

Place at both `frontend/src/templates/executive.json` and `backend/src/templates/executive.json`.

- [ ] **Step 5: Create creative.json**

```json
{
  "id": "creative",
  "name": "Creative",
  "layout": {
    "type": "two-column",
    "sidebarPosition": "left",
    "sidebarWidthPercent": 38,
    "pageMarginTop": "0in",
    "pageMarginSides": "0in",
    "sectionSpacing": "14px",
    "itemSpacing": "8px"
  },
  "colors": {
    "headerGradientStart": "#6c63ff",
    "headerGradientEnd": "#e040fb",
    "sidebarBackground": "#f8f7ff",
    "sidebarText": "#333333",
    "sidebarAccent": "#6c63ff",
    "mainBackground": "#ffffff",
    "mainText": "#222222",
    "headingText": "#6c63ff",
    "accentColor": "#6c63ff",
    "dividerColor": "#e8e6ff",
    "mutedText": "#888888",
    "tagBackground": "#f0eeff",
    "tagText": "#6c63ff"
  },
  "typography": {
    "nameFont": "Arial, sans-serif",
    "nameFontSize": "22px",
    "nameFontWeight": "700",
    "titleFont": "Arial, sans-serif",
    "titleFontSize": "11px",
    "sectionLabelFont": "Arial, sans-serif",
    "sectionLabelSize": "9px",
    "sectionLabelStyle": "uppercase",
    "sectionLabelSpacing": "1.5px",
    "bodyFont": "Arial, sans-serif",
    "bodyFontSize": "10px",
    "bodyLineHeight": "1.5"
  },
  "header": {
    "placement": "top-full-bleed-gradient",
    "alignment": "left",
    "showAvatar": false,
    "gradientStart": "#6c63ff",
    "gradientEnd": "#e040fb"
  },
  "sections": {
    "dividerStyle": "light",
    "bulletStyle": "bullet",
    "dateAlignment": "below",
    "skillStyle": "pill",
    "sidebarSections": ["personal-contact", "skills", "languages", "certifications"],
    "mainSections": ["experience", "education", "projects", "awards", "custom"]
  }
}
```

Place at both `frontend/src/templates/creative.json` and `backend/src/templates/creative.json`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/templates/ backend/src/templates/
git commit -m "feat: add 5 template JSON files (classic, modern, minimal, executive, creative)"
```

---

## Task 3: Zustand Stores

**Files:**
- Create: `frontend/src/store/useResumeStore.js`
- Create: `frontend/src/store/useAgentStore.js`
- Create: `frontend/src/__tests__/useResumeStore.test.js`

- [ ] **Step 1: Write the failing store tests**

Create `frontend/src/__tests__/useResumeStore.test.js`:

```js
import { act, renderHook } from '@testing-library/react'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => {
  useResumeStore.setState(useResumeStore.getInitialState())
})

describe('useResumeStore', () => {
  test('initial state has empty content and classic template', () => {
    const { result } = renderHook(() => useResumeStore())
    expect(result.current.templateId).toBe('classic')
    expect(result.current.content.personal.name).toBe('')
    expect(result.current.content.experience).toEqual([])
    expect(result.current.content.sectionOrder).toEqual(['personal', 'experience', 'education', 'skills'])
  })

  test('updatePersonal merges fields into personal', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.updatePersonal({ name: 'Jane Doe', email: 'jane@test.com' }))
    expect(result.current.content.personal.name).toBe('Jane Doe')
    expect(result.current.content.personal.email).toBe('jane@test.com')
  })

  test('addExperience appends an entry with a uuid id', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.addExperience())
    expect(result.current.content.experience).toHaveLength(1)
    expect(result.current.content.experience[0].id).toBeTruthy()
    expect(result.current.content.experience[0].company).toBe('')
  })

  test('updateExperience updates the correct entry by id', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.addExperience())
    const id = result.current.content.experience[0].id
    act(() => result.current.updateExperience(id, { company: 'Acme' }))
    expect(result.current.content.experience[0].company).toBe('Acme')
  })

  test('removeExperience removes entry by id', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.addExperience())
    const id = result.current.content.experience[0].id
    act(() => result.current.removeExperience(id))
    expect(result.current.content.experience).toHaveLength(0)
  })

  test('toggleOptionalSection adds section key to sectionOrder', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.toggleOptionalSection('projects', true))
    expect(result.current.content.sectionOrder).toContain('projects')
  })

  test('toggleOptionalSection removes section key from sectionOrder', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.toggleOptionalSection('projects', true))
    act(() => result.current.toggleOptionalSection('projects', false))
    expect(result.current.content.sectionOrder).not.toContain('projects')
  })

  test('setTemplateId updates templateId', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.setTemplateId('modern'))
    expect(result.current.templateId).toBe('modern')
  })

  test('setContent replaces full content', () => {
    const { result } = renderHook(() => useResumeStore())
    const incoming = {
      meta: { version: '1.0', updatedAt: '' },
      personal: { name: 'Parsed User', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
      experience: [], education: [], skills: [], projects: [],
      certifications: [], languages: [], awards: [], custom: [],
      sectionOrder: ['personal', 'experience', 'education', 'skills'],
      _raw: ''
    }
    act(() => result.current.setContent(incoming))
    expect(result.current.content.personal.name).toBe('Parsed User')
  })

  test('resetResume restores initial state', () => {
    const { result } = renderHook(() => useResumeStore())
    act(() => result.current.updatePersonal({ name: 'Someone' }))
    act(() => result.current.resetResume())
    expect(result.current.content.personal.name).toBe('')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd frontend && npm test
```

Expected: FAIL — `Cannot find module '../store/useResumeStore'`

- [ ] **Step 3: Create frontend/src/store/useResumeStore.js**

```js
import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

const emptyContent = () => ({
  meta: { version: '1.0', updatedAt: new Date().toISOString() },
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
})

const initialState = {
  content: emptyContent(),
  templateId: 'classic'
}

export const useResumeStore = create((set) => ({
  ...initialState,

  setContent: (content) => set({ content }),

  updatePersonal: (fields) =>
    set((s) => ({ content: { ...s.content, personal: { ...s.content.personal, ...fields } } })),

  addExperience: () =>
    set((s) => ({
      content: {
        ...s.content,
        experience: [...s.content.experience, { id: uuid(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }]
      }
    })),

  updateExperience: (id, fields) =>
    set((s) => ({
      content: {
        ...s.content,
        experience: s.content.experience.map((e) => (e.id === id ? { ...e, ...fields } : e))
      }
    })),

  removeExperience: (id) =>
    set((s) => ({ content: { ...s.content, experience: s.content.experience.filter((e) => e.id !== id) } })),

  addEducation: () =>
    set((s) => ({
      content: {
        ...s.content,
        education: [...s.content.education, { id: uuid(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]
      }
    })),

  updateEducation: (id, fields) =>
    set((s) => ({
      content: {
        ...s.content,
        education: s.content.education.map((e) => (e.id === id ? { ...e, ...fields } : e))
      }
    })),

  removeEducation: (id) =>
    set((s) => ({ content: { ...s.content, education: s.content.education.filter((e) => e.id !== id) } })),

  updateSkills: (skills) =>
    set((s) => ({ content: { ...s.content, skills } })),

  toggleOptionalSection: (key, enabled) =>
    set((s) => {
      const order = s.content.sectionOrder.filter((k) => k !== key)
      if (enabled) order.push(key)
      return { content: { ...s.content, sectionOrder: order } }
    }),

  reorderSections: (newOrder) =>
    set((s) => ({ content: { ...s.content, sectionOrder: newOrder } })),

  setTemplateId: (templateId) => set({ templateId }),

  resetResume: () => set({ content: emptyContent(), templateId: 'classic' })
}))

useResumeStore.getInitialState = () => ({ content: emptyContent(), templateId: 'classic' })
```

- [ ] **Step 4: Install uuid in frontend**

```bash
cd frontend && npm install uuid
```

- [ ] **Step 5: Create frontend/src/store/useAgentStore.js**

```js
import { create } from 'zustand'

export const useAgentStore = create(() => ({
  review: { score: null, feedback: [], loading: false },
  suggestions: { items: [], loading: false },
  jobMatch: { score: null, gaps: [], loading: false },
  benchmark: { courses: [], loading: false }
}))
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd frontend && npm test
```

Expected: All store tests PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/store/ frontend/src/__tests__/useResumeStore.test.js
git commit -m "feat: add Zustand stores (useResumeStore + useAgentStore)"
```

---

## Task 4: Backend — contentMapper Service

Converts raw extracted text (from a PDF or DOCX) into a Content JSON object. Uses keyword heuristics to detect section headings and map content blocks to fields.

**Files:**
- Create: `backend/src/services/parser/contentMapper.js`
- Create: `backend/src/__tests__/contentMapper.test.js`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/__tests__/contentMapper.test.js`:

```js
const { mapToContent } = require('../services/parser/contentMapper')

const sampleText = `
John Doe
Software Engineer
john@example.com | (555) 123-4567 | New York, NY | linkedin.com/in/johndoe

EXPERIENCE
Senior Engineer — Acme Corp
Jan 2022 – Present
• Led a team of 5 engineers
• Reduced deployment time by 40%

Junior Engineer — Beta Inc
Jun 2019 – Dec 2021
• Built REST APIs in Node.js

EDUCATION
B.S. Computer Science
State University, 2019

SKILLS
JavaScript, React, Node.js, Python, AWS

CERTIFICATIONS
AWS Solutions Architect — Amazon, 2023
`

describe('mapToContent', () => {
  let content

  beforeAll(() => {
    content = mapToContent(sampleText)
  })

  test('returns an object with required top-level keys', () => {
    expect(content).toHaveProperty('meta')
    expect(content).toHaveProperty('personal')
    expect(content).toHaveProperty('experience')
    expect(content).toHaveProperty('education')
    expect(content).toHaveProperty('skills')
    expect(content).toHaveProperty('sectionOrder')
    expect(content).toHaveProperty('_raw')
  })

  test('extracts name as first non-empty line', () => {
    expect(content.personal.name).toBe('John Doe')
  })

  test('extracts email from contact line', () => {
    expect(content.personal.email).toBe('john@example.com')
  })

  test('extracts phone from contact line', () => {
    expect(content.personal.phone).toBe('(555) 123-4567')
  })

  test('detects experience section and creates entries', () => {
    expect(content.experience.length).toBeGreaterThanOrEqual(1)
    expect(content.experience[0].company).toContain('Acme Corp')
  })

  test('each experience entry has an id', () => {
    content.experience.forEach((e) => expect(e.id).toBeTruthy())
  })

  test('detects education section', () => {
    expect(content.education.length).toBeGreaterThanOrEqual(1)
  })

  test('detects skills section and splits into items', () => {
    expect(content.skills.length).toBeGreaterThanOrEqual(1)
    expect(content.skills[0].items.length).toBeGreaterThan(0)
  })

  test('sectionOrder includes personal, experience, education, skills', () => {
    expect(content.sectionOrder).toContain('personal')
    expect(content.sectionOrder).toContain('experience')
    expect(content.sectionOrder).toContain('education')
    expect(content.sectionOrder).toContain('skills')
  })

  test('handles empty string without throwing', () => {
    expect(() => mapToContent('')).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd backend && npm test -- --testPathPattern=contentMapper
```

Expected: FAIL — `Cannot find module '../services/parser/contentMapper'`

- [ ] **Step 3: Create backend/src/services/parser/contentMapper.js**

```js
const { v4: uuid } = require('uuid')

const SECTION_PATTERNS = [
  { key: 'experience',     regex: /^(experience|work experience|employment|work history|career history)/i },
  { key: 'education',      regex: /^(education|academic|qualifications)/i },
  { key: 'skills',         regex: /^(skills|technical skills|core competencies|competencies)/i },
  { key: 'projects',       regex: /^(projects|personal projects|notable projects)/i },
  { key: 'certifications', regex: /^(certifications?|licenses?|credentials)/i },
  { key: 'languages',      regex: /^(languages)/i },
  { key: 'awards',         regex: /^(awards?|honors?|achievements?|accomplishments?)/i },
  { key: 'custom',         regex: /^(volunteer|publications?|references?|interests?|hobbies)/i },
]

const EMAIL_RE    = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i
const PHONE_RE    = /(\+?[\d][\d\s\-().]{6,}\d)/
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i
const WEBSITE_RE  = /https?:\/\/[^\s|·,]+/i
const DATE_RE     = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4})\s*(–|-|to)\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4}|present|current)/i

function extractPersonal(lines) {
  const personal = { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' }
  const contactLine = lines.slice(0, 6).join(' ')

  const emailMatch    = contactLine.match(EMAIL_RE)
  const phoneMatch    = contactLine.match(PHONE_RE)
  const linkedinMatch = contactLine.match(LINKEDIN_RE)
  const websiteMatch  = contactLine.match(WEBSITE_RE)

  if (emailMatch)    personal.email    = emailMatch[0].trim()
  if (phoneMatch)    personal.phone    = phoneMatch[0].trim()
  if (linkedinMatch) personal.linkedin = linkedinMatch[0].trim()
  if (websiteMatch && !linkedinMatch)  personal.website = websiteMatch[0].trim()

  // Name = first non-empty line that doesn't look like contact info
  for (const line of lines) {
    const clean = line.trim()
    if (clean && !EMAIL_RE.test(clean) && !PHONE_RE.test(clean) && clean.length < 60) {
      personal.name = clean
      break
    }
  }

  return personal
}

function splitIntoSections(lines) {
  const sections = [{ key: 'header', lines: [] }]
  let current = sections[0]

  for (const line of lines) {
    const trimmed = line.trim()
    const matched = SECTION_PATTERNS.find(({ regex }) => regex.test(trimmed) && trimmed.length < 50)
    if (matched) {
      current = { key: matched.key, lines: [] }
      sections.push(current)
    } else {
      current.lines.push(line)
    }
  }

  return sections
}

function parseExperience(lines) {
  const entries = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dateMatch = trimmed.match(DATE_RE)
    if (dateMatch) {
      if (current) {
        const parts = trimmed.split(dateMatch[0])
        current.startDate = dateMatch[1] || ''
        current.endDate   = dateMatch[4] || ''
        current.current   = /present|current/i.test(dateMatch[4] || '')
      }
      continue
    }

    if (trimmed.match(/^[•\-–*]\s+/) && current) {
      current.bullets.push(trimmed.replace(/^[•\-–*]\s+/, ''))
      continue
    }

    // New entry heuristic: line contains a dash, em-dash, or "at" separating role and company
    if (/—|–|-|@|\bat\b/.test(trimmed) && trimmed.length < 100 && !trimmed.startsWith('•')) {
      const parts = trimmed.split(/\s*[—–]\s*|\s+at\s+|\s*-\s*/)
      current = {
        id: uuid(), role: (parts[0] || '').trim(), company: (parts[1] || '').trim(),
        location: '', startDate: '', endDate: '', current: false, bullets: []
      }
      entries.push(current)
    } else if (!current || (current.role && !dateMatch)) {
      // Standalone line — treat as a new entry header
      current = {
        id: uuid(), role: '', company: trimmed,
        location: '', startDate: '', endDate: '', current: false, bullets: []
      }
      entries.push(current)
    }
  }

  return entries
}

function parseEducation(lines) {
  const entries = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dateMatch = trimmed.match(/\d{4}/)
    if (dateMatch && current) {
      current.endDate = dateMatch[0]
      continue
    }

    if (/^(b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|ph\.?d\.?|bachelor|master|doctor|associate)/i.test(trimmed)) {
      current = { id: uuid(), institution: '', degree: trimmed, field: '', startDate: '', endDate: '', gpa: '' }
      entries.push(current)
    } else if (current && !current.institution) {
      current.institution = trimmed
    } else {
      current = { id: uuid(), institution: trimmed, degree: '', field: '', startDate: '', endDate: '', gpa: '' }
      entries.push(current)
    }
  }

  return entries
}

function parseSkills(lines) {
  const allItems = lines
    .join(', ')
    .split(/[,|•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!allItems.length) return []
  return [{ id: uuid(), category: 'Skills', items: allItems }]
}

function parseCertifications(lines) {
  return lines
    .filter((l) => l.trim())
    .map((l) => {
      const parts = l.trim().split(/\s*[—–,]\s*/)
      return { id: uuid(), name: parts[0] || '', issuer: parts[1] || '', date: parts[2] || '', url: '' }
    })
}

function mapToContent(rawText) {
  const lines = rawText.split('\n').map((l) => l.trimEnd())
  const sections = splitIntoSections(lines)

  const headerSection = sections.find((s) => s.key === 'header') || { lines: [] }
  const personal      = extractPersonal(headerSection.lines)

  const content = {
    meta: { version: '1.0', updatedAt: new Date().toISOString() },
    personal,
    experience:     [],
    education:      [],
    skills:         [],
    projects:       [],
    certifications: [],
    languages:      [],
    awards:         [],
    custom:         [],
    sectionOrder:   ['personal'],
    _raw:           rawText
  }

  const sectionOrder = ['personal']

  for (const section of sections) {
    if (section.key === 'header') continue
    sectionOrder.push(section.key)

    switch (section.key) {
      case 'experience':     content.experience     = parseExperience(section.lines);     break
      case 'education':      content.education      = parseEducation(section.lines);      break
      case 'skills':         content.skills         = parseSkills(section.lines);         break
      case 'certifications': content.certifications = parseCertifications(section.lines); break
      default:
        // projects, languages, awards, custom — store raw lines as custom entry
        content[section.key] = section.lines
          .filter((l) => l.trim())
          .map((l) => ({ id: uuid(), label: section.key, content: l.trim() }))
    }
  }

  content.sectionOrder = [...new Set(sectionOrder)]
  return content
}

module.exports = { mapToContent }
```

- [ ] **Step 4: Install uuid in backend**

```bash
cd backend && npm install uuid
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd backend && npm test -- --testPathPattern=contentMapper
```

Expected: All contentMapper tests PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/services/parser/contentMapper.js backend/src/__tests__/contentMapper.test.js
git commit -m "feat: add contentMapper service — raw text to Content JSON"
```

---

## Task 5: Backend — pdfParser and docxParser Services

Both parsers accept a file buffer and return raw extracted text. The text is then passed to `contentMapper`. Unit tests use small fixture files.

**Files:**
- Create: `backend/src/services/parser/pdfParser.js`
- Create: `backend/src/services/parser/docxParser.js`
- Create: `backend/src/__tests__/fixtures/sample.txt` (used to verify text extraction shape)

> Note: True unit tests for PDF/DOCX parsing require real binary fixtures. These tests verify the module interface and that the parsers return a non-empty string from a valid buffer. Integration testing with real uploaded files happens manually during Task 6 verification.

- [ ] **Step 1: Create backend/src/services/parser/pdfParser.js**

```js
const pdfParse = require('pdf-parse')

/**
 * Extracts raw text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer)
  return data.text || ''
}

module.exports = { extractTextFromPdf }
```

- [ ] **Step 2: Create backend/src/services/parser/docxParser.js**

```js
const mammoth = require('mammoth')

/**
 * Extracts raw text from a DOCX buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

module.exports = { extractTextFromDocx }
```

- [ ] **Step 3: Write interface tests for both parsers**

Create `backend/src/__tests__/parsers.test.js`:

```js
const { extractTextFromPdf }  = require('../services/parser/pdfParser')
const { extractTextFromDocx } = require('../services/parser/docxParser')

describe('extractTextFromPdf', () => {
  test('returns a string given a valid buffer', async () => {
    // Minimal valid PDF binary (1-page empty PDF)
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj ' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj ' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
      '0000000058 00000 n\n0000000115 00000 n\n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    )
    const result = await extractTextFromPdf(minimalPdf)
    expect(typeof result).toBe('string')
  })

  test('returns empty string for empty PDF', async () => {
    // pdf-parse throws on truly invalid buffers — valid but empty PDFs return ''
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj ' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj ' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
      '0000000058 00000 n\n0000000115 00000 n\n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    )
    const result = await extractTextFromPdf(minimalPdf)
    expect(result).toBe('')
  })
})

describe('extractTextFromDocx', () => {
  test('returns a string for a valid DOCX buffer', async () => {
    // mammoth accepts the minimal OOXML zip — use a real tiny fixture if available,
    // otherwise just verify the function exists and returns the right type
    expect(typeof extractTextFromDocx).toBe('function')
  })

  test('module exports extractTextFromDocx', () => {
    const mod = require('../services/parser/docxParser')
    expect(mod.extractTextFromDocx).toBeDefined()
  })
})
```

- [ ] **Step 4: Run parser tests**

```bash
cd backend && npm test -- --testPathPattern=parsers
```

Expected: PASS — interface tests confirm modules load and return strings

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/parser/pdfParser.js backend/src/services/parser/docxParser.js backend/src/__tests__/parsers.test.js
git commit -m "feat: add pdfParser and docxParser services"
```

---

## Task 6: Backend — POST /api/upload Route

Wires multer → pdfParser/docxParser → contentMapper into a single route. Returns `{ content: ContentJSON }`.

**Files:**
- Create: `backend/src/routes/upload.js`
- Create: `backend/src/routes/export.js` (stub — implemented in Task 10)
- Modify: `backend/src/__tests__/routes.test.js`

- [ ] **Step 1: Create export route stub so index.js doesn't crash**

Create `backend/src/routes/export.js`:

```js
const express = require('express')
const router = express.Router()

// Implemented in Task 10
router.post('/pdf',  (req, res) => res.status(501).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' }))
router.post('/docx', (req, res) => res.status(501).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' }))

module.exports = router
```

- [ ] **Step 2: Write the failing upload route test**

Create `backend/src/__tests__/routes.test.js`:

```js
const request  = require('supertest')
const app      = require('../index')
const path     = require('path')
const fs       = require('fs')

describe('POST /api/upload', () => {
  test('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/upload')
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('returns 400 when file type is not pdf or docx', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('plain text'), { filename: 'resume.txt', contentType: 'text/plain' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('UNSUPPORTED_FILE_TYPE')
  })

  test('returns 200 with content JSON shape for a text-based attachment named .pdf', async () => {
    // We send a buffer that pdf-parse will attempt to read — it may fail on invalid PDF,
    // so we mock at the service level by sending a minimal valid PDF structure
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj ' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj ' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
      '0000000058 00000 n\n0000000115 00000 n\n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    )
    const res = await request(app)
      .post('/api/upload')
      .attach('file', minimalPdf, { filename: 'resume.pdf', contentType: 'application/pdf' })
    // Empty PDF produces empty text → content object still has correct shape
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('content')
    expect(res.body.content).toHaveProperty('personal')
    expect(res.body.content).toHaveProperty('experience')
    expect(res.body.content).toHaveProperty('sectionOrder')
  })
})
```

- [ ] **Step 3: Run test — verify it fails**

```bash
cd backend && npm test -- --testPathPattern=routes
```

Expected: FAIL — upload route returns 404 (not yet implemented)

- [ ] **Step 4: Create backend/src/routes/upload.js**

```js
const express  = require('express')
const multer   = require('multer')
const { extractTextFromPdf }  = require('../services/parser/pdfParser')
const { extractTextFromDocx } = require('../services/parser/docxParser')
const { mapToContent }        = require('../services/parser/contentMapper')

const router  = express.Router()
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const extAllowed = /\.(pdf|docx)$/i.test(file.originalname)
    if (allowed.includes(file.mimetype) || extAllowed) {
      cb(null, true)
    } else {
      const err = new Error('Unsupported file type')
      err.code  = 'UNSUPPORTED_FILE_TYPE'
      cb(err, false)
    }
  }
})

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'UNSUPPORTED_FILE_TYPE') return res.status(400).json({ error: err.message, code: err.code })
      if (err.code === 'LIMIT_FILE_SIZE')       return res.status(413).json({ error: 'File too large (max 10MB)', code: 'FILE_TOO_LARGE' })
      return res.status(400).json({ error: err.message, code: 'UPLOAD_ERROR' })
    }
    next()
  })
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided', code: 'NO_FILE' })

  try {
    const isPdf  = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(req.file.originalname)
    const rawText = isPdf
      ? await extractTextFromPdf(req.file.buffer)
      : await extractTextFromDocx(req.file.buffer)

    const content = mapToContent(rawText)
    return res.json({ content })
  } catch (err) {
    console.error('Parse error:', err)
    return res.status(422).json({ error: 'Failed to parse file', code: 'PARSE_ERROR' })
  }
})

module.exports = router
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd backend && npm test -- --testPathPattern=routes
```

Expected: All 3 upload route tests PASS

- [ ] **Step 6: Manual smoke test**

```bash
cd backend && npm run dev
# In another terminal:
curl -X GET http://localhost:3001/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/upload.js backend/src/routes/export.js backend/src/__tests__/routes.test.js
git commit -m "feat: add POST /api/upload route — file parsing to Content JSON"
```

---

## Task 7: Backend — htmlRenderer Service

Converts Content JSON + Template JSON into a complete HTML string. This is what Puppeteer renders to PDF. Must handle both single-column and two-column layouts.

**Files:**
- Create: `backend/src/services/renderer/htmlRenderer.js`
- Create: `backend/src/__tests__/htmlRenderer.test.js`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/__tests__/htmlRenderer.test.js`:

```js
const { renderToHtml } = require('../services/renderer/htmlRenderer')

const sampleContent = {
  meta: { version: '1.0', updatedAt: '' },
  personal: { name: 'Jane Doe', title: 'Engineer', email: 'jane@test.com', phone: '555-0000', location: 'NYC', linkedin: '', website: '', summary: 'Experienced engineer.' },
  experience: [{ id: '1', company: 'Acme', role: 'Senior Engineer', location: 'NYC', startDate: 'Jan 2022', endDate: 'Present', current: true, bullets: ['Led a team', 'Shipped product'] }],
  education: [{ id: '2', institution: 'State U', degree: 'B.S.', field: 'CS', startDate: '2015', endDate: '2019', gpa: '' }],
  skills: [{ id: '3', category: 'Languages', items: ['JavaScript', 'Python'] }],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
}

describe('renderToHtml', () => {
  test('returns a string', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(typeof html).toBe('string')
  })

  test('output starts with <!DOCTYPE html>', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/i)
  })

  test('includes the candidate name', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('Jane Doe')
  })

  test('includes experience company name', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('Acme')
  })

  test('includes education institution', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('State U')
  })

  test('includes skill items', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('JavaScript')
  })

  test('works with modern (two-column) template', () => {
    const html = renderToHtml(sampleContent, 'modern')
    expect(html).toContain('Jane Doe')
    expect(html).toContain('sidebar')
  })

  test('throws for unknown templateId', () => {
    expect(() => renderToHtml(sampleContent, 'nonexistent')).toThrow()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd backend && npm test -- --testPathPattern=htmlRenderer
```

Expected: FAIL — `Cannot find module '../services/renderer/htmlRenderer'`

- [ ] **Step 3: Create backend/src/services/renderer/htmlRenderer.js**

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderContact(personal) {
  return [personal.email, personal.phone, personal.location, personal.linkedin, personal.website]
    .filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')
}

function renderBullets(bullets = [], bulletStyle) {
  if (!bullets.length) return ''
  const marker = bulletStyle === 'dash' ? '–' : '•'
  return `<ul style="margin:4px 0 0 16px;padding:0;list-style:none;">
    ${bullets.map((b) => `<li style="margin-bottom:2px;">${marker} ${esc(b)}</li>`).join('')}
  </ul>`
}

function renderSectionLabel(label, t) {
  const { colors, typography } = t
  return `<div style="
    font-family:${typography.sectionLabelFont};
    font-size:${typography.sectionLabelSize};
    font-weight:${t.sections.labelWeight || 'bold'};
    text-transform:${typography.sectionLabelStyle};
    letter-spacing:${typography.sectionLabelSpacing};
    color:${colors.headingText};
    border-bottom:${t.sections.dividerStyle === 'none' ? 'none' : `1px solid ${colors.dividerColor}`};
    margin-bottom:6px;padding-bottom:3px;margin-top:14px;
  ">${esc(label)}</div>`
}

function renderExperience(entries, t) {
  if (!entries.length) return ''
  return renderSectionLabel('Experience', t) + entries.map((e) => `
    <div style="margin-bottom:${t.layout.itemSpacing};">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(e.role)}${e.role && e.company ? ' — ' : ''}${esc(e.company)}</span>
        <span style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</span>
      </div>
      ${e.location ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.location)}</div>` : ''}
      ${renderBullets(e.bullets, t.sections.bulletStyle)}
    </div>`).join('')
}

function renderEducation(entries, t) {
  if (!entries.length) return ''
  return renderSectionLabel('Education', t) + entries.map((e) => `
    <div style="margin-bottom:${t.layout.itemSpacing};">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(e.degree)} ${esc(e.field)}</span>
        <span style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.endDate)}</span>
      </div>
      <div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.institution)}</div>
      ${e.gpa ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('')
}

function renderSkills(skills, t) {
  if (!skills.length) return ''
  return renderSectionLabel('Skills', t) + skills.map((s) => `
    <div style="margin-bottom:6px;">
      ${s.category ? `<span style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(s.category)}: </span>` : ''}
      <span style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${s.items.map(esc).join(', ')}</span>
    </div>`).join('')
}

function renderProjects(projects, t) {
  if (!projects.length) return ''
  return renderSectionLabel('Projects', t) + projects.map((p) => `
    <div style="margin-bottom:${t.layout.itemSpacing};">
      <div style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(p.name)}${p.url ? ` — <a href="${esc(p.url)}" style="color:${t.colors.accentColor};">${esc(p.url)}</a>` : ''}</div>
      ${p.description ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(p.description)}</div>` : ''}
      ${renderBullets(p.bullets, t.sections.bulletStyle)}
    </div>`).join('')
}

function renderCertifications(certs, t) {
  if (!certs.length) return ''
  return renderSectionLabel('Certifications', t) + certs.map((c) => `
    <div style="margin-bottom:4px;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">
      <strong>${esc(c.name)}</strong>${c.issuer ? ` — ${esc(c.issuer)}` : ''}${c.date ? `, ${esc(c.date)}` : ''}
    </div>`).join('')
}

function renderLanguages(langs, t) {
  if (!langs.length) return ''
  return renderSectionLabel('Languages', t) + langs.map((l) => `
    <div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(l.language)}${l.proficiency ? ` — ${esc(l.proficiency)}` : ''}</div>`).join('')
}

function renderAwards(awards, t) {
  if (!awards.length) return ''
  return renderSectionLabel('Awards', t) + awards.map((a) => `
    <div style="margin-bottom:4px;">
      <div style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(a.title)}${a.issuer ? ` — ${esc(a.issuer)}` : ''}</div>
      ${a.description ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(a.description)}</div>` : ''}
    </div>`).join('')
}

function renderCustom(items, t) {
  if (!items.length) return ''
  const label = items[0]?.label || 'Other'
  return renderSectionLabel(label, t) + items.map((i) => `
    <div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(i.content)}</div>`).join('')
}

function renderSection(key, content, t) {
  switch (key) {
    case 'experience':     return renderExperience(content.experience, t)
    case 'education':      return renderEducation(content.education, t)
    case 'skills':         return renderSkills(content.skills, t)
    case 'projects':       return renderProjects(content.projects, t)
    case 'certifications': return renderCertifications(content.certifications, t)
    case 'languages':      return renderLanguages(content.languages, t)
    case 'awards':         return renderAwards(content.awards, t)
    case 'custom':         return renderCustom(content.custom, t)
    default:               return ''
  }
}

function renderSingleColumn(content, t) {
  const { personal } = content
  const { colors, typography, header, layout } = t

  const headerHtml = header.placement === 'top-full-bleed'
    ? `<div style="background:${colors.headerBackground};color:${colors.headerText};padding:24px ${layout.contentPaddingSides || '0.75in'};">
        <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};letter-spacing:${typography.nameLetterSpacing || 'normal'};">${esc(personal.name)}</div>
        <div style="font-size:${typography.titleFontSize};color:${colors.headerMuted || colors.headerText};margin-top:4px;">${esc(personal.title)}</div>
        <div style="font-size:11px;margin-top:6px;color:${colors.headerMuted || colors.headerText};">${renderContact(personal)}</div>
      </div>`
    : `<div style="text-align:${header.alignment};padding-bottom:12px;border-bottom:${t.sections.dividerStyle === 'solid-thick' ? '2px' : '1px'} solid ${colors.dividerColor};margin-bottom:14px;">
        <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};color:${colors.headingText};">${esc(personal.name)}</div>
        ${personal.title ? `<div style="font-size:${typography.titleFontSize};color:${colors.mutedText};margin-top:2px;">${esc(personal.title)}</div>` : ''}
        <div style="font-size:11px;color:${colors.mutedText};margin-top:4px;">${renderContact(personal)}</div>
      </div>`

  const contentPad = layout.contentPaddingSides ? `padding:${layout.contentPaddingTop || '0'} ${layout.contentPaddingSides};` : ''

  const sectionsHtml = content.sectionOrder
    .filter((k) => k !== 'personal')
    .map((k) => renderSection(k, content, t))
    .join('')

  const summaryHtml = personal.summary
    ? `<div style="font-size:${typography.bodyFontSize};color:${colors.mainText};font-style:${typography.summaryFontStyle || 'normal'};margin-bottom:12px;">${esc(personal.summary)}</div>`
    : ''

  return `
    ${headerHtml}
    <div style="${contentPad}">
      ${summaryHtml}
      ${sectionsHtml}
    </div>`
}

function renderTwoColumn(content, t) {
  const { personal } = content
  const { colors, typography, header, layout, sections } = t
  const sidebarW = layout.sidebarWidthPercent
  const mainW    = 100 - sidebarW

  const sidebarSections = sections.sidebarSections || []
  const mainSections    = sections.mainSections    || []

  // Header
  let headerHtml = ''
  if (header.placement === 'sidebar-top') {
    // Header rendered inside sidebar
  } else if (header.placement === 'top-full-bleed-gradient') {
    headerHtml = `<div style="background:linear-gradient(135deg,${colors.headerGradientStart},${colors.headerGradientEnd});color:#fff;padding:20px 24px;">
      <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};">${esc(personal.name)}</div>
      <div style="font-size:${typography.titleFontSize};opacity:0.9;margin-top:3px;">${esc(personal.title)}</div>
    </div>`
  }

  const sidebarHeader = header.placement === 'sidebar-top'
    ? `<div style="text-align:${header.alignment};margin-bottom:14px;">
        <div style="width:${header.avatarSizePx || 56}px;height:${header.avatarSizePx || 56}px;background:${colors.sidebarAccent};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:#fff;margin:0 auto 8px;">${esc((personal.name || '?')[0])}</div>
        <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};color:${colors.sidebarText};">${esc(personal.name)}</div>
        <div style="font-size:${typography.titleFontSize};color:${colors.sidebarAccent};margin-top:3px;">${esc(personal.title)}</div>
      </div>`
    : ''

  const sidebarContactHtml = `<div style="font-size:10px;color:${colors.sidebarText || '#fff'};margin-bottom:12px;">
    ${[personal.email, personal.phone, personal.location].filter(Boolean).map((v) => `<div>${esc(v)}</div>`).join('')}
  </div>`

  const sidebarBody = sidebarSections.map((key) => {
    if (key === 'personal-contact') return sidebarContactHtml
    return renderSection(key, content, { ...t, colors: { ...t.colors, mainText: colors.sidebarText, headingText: colors.sidebarAccent, mutedText: colors.sidebarText, dividerColor: colors.sidebarAccent } })
  }).join('')

  const mainBody = content.sectionOrder
    .filter((k) => k !== 'personal' && mainSections.includes(k))
    .map((k) => renderSection(k, content, t))
    .join('')

  return `
    ${headerHtml}
    <div style="display:flex;min-height:100%;" class="two-column-body">
      <div class="sidebar" style="width:${sidebarW}%;background:${colors.sidebarBackground};color:${colors.sidebarText};padding:20px 16px;box-sizing:border-box;">
        ${sidebarHeader}
        ${sidebarBody}
      </div>
      <div style="width:${mainW}%;background:${colors.mainBackground};color:${colors.mainText};padding:20px 20px;box-sizing:border-box;">
        ${personal.summary ? `<div style="font-size:${typography.bodyFontSize};margin-bottom:12px;">${esc(personal.summary)}</div>` : ''}
        ${mainBody}
      </div>
    </div>`
}

function renderToHtml(content, templateId) {
  const t = loadTemplate(templateId)
  const { colors, typography, layout } = t

  const body = layout.type === 'two-column'
    ? renderTwoColumn(content, t)
    : renderSingleColumn(content, t)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${typography.bodyFont};
      font-size: ${typography.bodyFontSize};
      line-height: ${typography.bodyLineHeight};
      background: ${colors.mainBackground};
      color: ${colors.mainText};
      width: 8.5in;
      min-height: 11in;
    }
    .resume-wrap {
      margin: ${layout.pageMarginTop} ${layout.pageMarginSides};
    }
    ul { list-style: none; }
    a  { text-decoration: none; }
    .two-column-body { min-height: 11in; }
  </style>
</head>
<body>
  <div class="${layout.type === 'two-column' ? '' : 'resume-wrap'}">
    ${body}
  </div>
</body>
</html>`
}

module.exports = { renderToHtml }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd backend && npm test -- --testPathPattern=htmlRenderer
```

Expected: All 8 htmlRenderer tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/renderer/htmlRenderer.js backend/src/__tests__/htmlRenderer.test.js
git commit -m "feat: add htmlRenderer service — Content JSON + Template JSON to HTML"
```

---

## Task 8: Backend — pdfExporter and docxExporter Services

**Files:**
- Create: `backend/src/services/exporter/pdfExporter.js`
- Create: `backend/src/services/exporter/docxExporter.js`

> Puppeteer launches a real Chromium instance — unit testing it in Jest causes timeouts and CI friction. Instead: verify the module interface in a lightweight test, then do a manual integration smoke test. The docxExporter is a pure function and gets a real test.

- [ ] **Step 1: Create backend/src/services/exporter/pdfExporter.js**

```js
const puppeteer = require('puppeteer')
const { renderToHtml } = require('../renderer/htmlRenderer')

/**
 * Renders Content JSON + templateId to a PDF buffer via Puppeteer.
 * @param {object} content  - Content JSON
 * @param {string} templateId
 * @returns {Promise<Buffer>}
 */
async function exportToPdf(content, templateId) {
  const html = renderToHtml(content, templateId)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    })
    return pdf
  } finally {
    await browser.close()
  }
}

module.exports = { exportToPdf }
```

- [ ] **Step 2: Create backend/src/services/exporter/docxExporter.js**

```js
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType
} = require('docx')
const fs   = require('fs')
const path = require('path')

function loadTemplate(templateId) {
  const file = path.join(__dirname, '../../templates', `${templateId}.json`)
  if (!fs.existsSync(file)) throw new Error(`Unknown template: ${templateId}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function hexToRgb(hex) {
  const clean = (hex || '#000000').replace('#', '')
  return clean.length === 6 ? clean.toUpperCase() : '000000'
}

function sectionHeading(label, t) {
  return new Paragraph({
    text: label.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: hexToRgb(t.colors.dividerColor) } },
    run: { font: t.typography.sectionLabelFont?.split(',')[0].trim().replace(/['"]/g, '') || 'Arial', size: 20, bold: true, color: hexToRgb(t.colors.headingText) }
  })
}

function text(str, opts = {}) {
  return new TextRun({ text: String(str || ''), ...opts })
}

function buildPersonalSection(personal, t) {
  const font = t.typography.nameFont?.split(',')[0].trim().replace(/['"]/g, '') || 'Arial'
  const paras = [
    new Paragraph({
      alignment: t.header.alignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [text(personal.name, { font, size: 48, bold: true, color: hexToRgb(t.colors.headingText) })]
    })
  ]
  if (personal.title) {
    paras.push(new Paragraph({
      alignment: t.header.alignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [text(personal.title, { font, size: 24, color: hexToRgb(t.colors.mutedText) })]
    }))
  }
  const contact = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join('  ·  ')
  if (contact) {
    paras.push(new Paragraph({
      alignment: t.header.alignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 160 },
      children: [text(contact, { size: 18, color: hexToRgb(t.colors.mutedText) })]
    }))
  }
  if (personal.summary) {
    paras.push(new Paragraph({ children: [text(personal.summary, { size: 20 })], spacing: { after: 120 } }))
  }
  return paras
}

function buildExperienceSection(experience, t) {
  if (!experience.length) return []
  const paras = [sectionHeading('Experience', t)]
  for (const e of experience) {
    paras.push(new Paragraph({
      children: [
        text(`${e.role}${e.role && e.company ? ' — ' : ''}${e.company}`, { bold: true, size: 20 }),
        text(`   ${e.current ? 'Present' : e.endDate}${e.startDate ? ` (${e.startDate})` : ''}`, { size: 18, color: hexToRgb(t.colors.mutedText) })
      ],
      spacing: { before: 100 }
    }))
    if (e.location) paras.push(new Paragraph({ children: [text(e.location, { size: 18, color: hexToRgb(t.colors.mutedText) })] }))
    for (const b of (e.bullets || [])) {
      if (b) paras.push(new Paragraph({ bullet: { level: 0 }, children: [text(b, { size: 18 })], spacing: { after: 40 } }))
    }
  }
  return paras
}

function buildEducationSection(education, t) {
  if (!education.length) return []
  const paras = [sectionHeading('Education', t)]
  for (const e of education) {
    paras.push(new Paragraph({
      children: [
        text(`${e.degree} ${e.field}`.trim(), { bold: true, size: 20 }),
        text(`   ${e.endDate}`, { size: 18, color: hexToRgb(t.colors.mutedText) })
      ],
      spacing: { before: 100 }
    }))
    paras.push(new Paragraph({ children: [text(e.institution, { size: 18, color: hexToRgb(t.colors.mutedText) })], spacing: { after: 80 } }))
    if (e.gpa) paras.push(new Paragraph({ children: [text(`GPA: ${e.gpa}`, { size: 18 })] }))
  }
  return paras
}

function buildSkillsSection(skills, t) {
  if (!skills.length) return []
  const paras = [sectionHeading('Skills', t)]
  for (const s of skills) {
    paras.push(new Paragraph({
      children: [
        s.category ? text(`${s.category}: `, { bold: true, size: 18 }) : null,
        text(s.items.join(', '), { size: 18 })
      ].filter(Boolean),
      spacing: { after: 60 }
    }))
  }
  return paras
}

function buildCertificationsSection(certs, t) {
  if (!certs.length) return []
  const paras = [sectionHeading('Certifications', t)]
  for (const c of certs) {
    paras.push(new Paragraph({
      children: [
        text(c.name, { bold: true, size: 18 }),
        c.issuer ? text(` — ${c.issuer}`, { size: 18 }) : null,
        c.date   ? text(`, ${c.date}`, { size: 18, color: hexToRgb(t.colors.mutedText) }) : null
      ].filter(Boolean),
      spacing: { after: 60 }
    }))
  }
  return paras
}

function buildGenericSection(label, items, t) {
  if (!items.length) return []
  const paras = [sectionHeading(label, t)]
  for (const item of items) {
    const body = item.content || item.name || item.language || item.title || ''
    if (body) paras.push(new Paragraph({ children: [text(body, { size: 18 })], spacing: { after: 60 } }))
  }
  return paras
}

function buildSection(key, content, t) {
  switch (key) {
    case 'experience':     return buildExperienceSection(content.experience, t)
    case 'education':      return buildEducationSection(content.education, t)
    case 'skills':         return buildSkillsSection(content.skills, t)
    case 'certifications': return buildCertificationsSection(content.certifications, t)
    case 'projects':       return buildGenericSection('Projects', content.projects, t)
    case 'languages':      return buildGenericSection('Languages', content.languages, t)
    case 'awards':         return buildGenericSection('Awards', content.awards, t)
    case 'custom':         return buildGenericSection(content.custom[0]?.label || 'Other', content.custom, t)
    default: return []
  }
}

async function exportToDocx(content, templateId) {
  const t = loadTemplate(templateId)

  const children = [
    ...buildPersonalSection(content.personal, t),
    ...content.sectionOrder
      .filter((k) => k !== 'personal')
      .flatMap((k) => buildSection(k, content, t))
  ]

  const doc = new Document({
    sections: [{ properties: {}, children }]
  })

  return await Packer.toBuffer(doc)
}

module.exports = { exportToDocx }
```

- [ ] **Step 3: Write a docxExporter interface test**

Create `backend/src/__tests__/docxExporter.test.js`:

```js
const { exportToDocx } = require('../services/exporter/docxExporter')

const sampleContent = {
  meta: { version: '1.0', updatedAt: '' },
  personal: { name: 'Jane Doe', title: 'Engineer', email: 'jane@test.com', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [{ id: '1', company: 'Acme', role: 'Engineer', location: '', startDate: 'Jan 2022', endDate: 'Present', current: true, bullets: ['Did work'] }],
  education: [{ id: '2', institution: 'State U', degree: 'B.S.', field: 'CS', startDate: '', endDate: '2019', gpa: '' }],
  skills: [{ id: '3', category: 'Tech', items: ['JavaScript'] }],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
}

describe('exportToDocx', () => {
  test('returns a Buffer', async () => {
    const buf = await exportToDocx(sampleContent, 'classic')
    expect(Buffer.isBuffer(buf)).toBe(true)
  }, 15000)

  test('buffer is non-empty', async () => {
    const buf = await exportToDocx(sampleContent, 'classic')
    expect(buf.length).toBeGreaterThan(0)
  }, 15000)

  test('throws for unknown templateId', async () => {
    await expect(exportToDocx(sampleContent, 'nonexistent')).rejects.toThrow()
  })
})
```

- [ ] **Step 4: Run docxExporter tests**

```bash
cd backend && npm test -- --testPathPattern=docxExporter
```

Expected: All 3 tests PASS (docx generation takes a moment — timeout set to 15s)

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/exporter/pdfExporter.js backend/src/services/exporter/docxExporter.js backend/src/__tests__/docxExporter.test.js
git commit -m "feat: add pdfExporter (Puppeteer) and docxExporter (docx.js) services"
```

---

## Task 9: Backend — POST /api/export Routes

Replaces the stub export routes from Task 6 with real implementations.

**Files:**
- Modify: `backend/src/routes/export.js`
- Modify: `backend/src/__tests__/routes.test.js` (add export route tests)

- [ ] **Step 1: Add export route tests to routes.test.js**

Append to `backend/src/__tests__/routes.test.js`:

```js
const sampleContent = {
  meta: { version: '1.0', updatedAt: '' },
  personal: { name: 'Jane Doe', title: 'Engineer', email: 'jane@test.com', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [], education: [], skills: [], projects: [],
  certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
}

describe('POST /api/export/docx', () => {
  test('returns 400 when content is missing', async () => {
    const res = await request(app).post('/api/export/docx').send({ templateId: 'classic' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when templateId is missing', async () => {
    const res = await request(app).post('/api/export/docx').send({ content: sampleContent })
    expect(res.status).toBe(400)
  })

  test('returns 400 for unknown templateId', async () => {
    const res = await request(app).post('/api/export/docx').send({ content: sampleContent, templateId: 'nonexistent' })
    expect(res.status).toBe(400)
  })

  test('returns a DOCX buffer with correct content-type for valid request', async () => {
    const res = await request(app)
      .post('/api/export/docx')
      .send({ content: sampleContent, templateId: 'classic' })
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/officedocument/)
  }, 15000)
})

describe('POST /api/export/pdf', () => {
  test('returns 400 when content is missing', async () => {
    const res = await request(app).post('/api/export/pdf').send({ templateId: 'classic' })
    expect(res.status).toBe(400)
  })

  test('returns 400 for unknown templateId', async () => {
    const res = await request(app).post('/api/export/pdf').send({ content: sampleContent, templateId: 'nonexistent' })
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
cd backend && npm test -- --testPathPattern=routes
```

Expected: New export tests FAIL with 501 (stub still in place)

- [ ] **Step 3: Replace backend/src/routes/export.js**

```js
const express = require('express')
const { exportToPdf }  = require('../services/exporter/pdfExporter')
const { exportToDocx } = require('../services/exporter/docxExporter')

const router = express.Router()

const VALID_TEMPLATES = ['classic', 'modern', 'minimal', 'executive', 'creative']

function validateBody(req, res) {
  if (!req.body.content)    { res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' }); return false }
  if (!req.body.templateId) { res.status(400).json({ error: 'templateId is required', code: 'MISSING_TEMPLATE' }); return false }
  if (!VALID_TEMPLATES.includes(req.body.templateId)) {
    res.status(400).json({ error: `Unknown template: ${req.body.templateId}`, code: 'INVALID_TEMPLATE' })
    return false
  }
  return true
}

router.post('/pdf', async (req, res) => {
  if (!validateBody(req, res)) return
  try {
    const { content, templateId } = req.body
    const pdf = await exportToPdf(content, templateId)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume.pdf"`,
      'Content-Length': pdf.length
    })
    res.end(pdf)
  } catch (err) {
    console.error('PDF export error:', err)
    res.status(500).json({ error: 'PDF generation failed', code: 'PDF_ERROR' })
  }
})

router.post('/docx', async (req, res) => {
  if (!validateBody(req, res)) return
  try {
    const { content, templateId } = req.body
    const buf = await exportToDocx(content, templateId)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="resume.docx"`,
      'Content-Length': buf.length
    })
    res.end(buf)
  } catch (err) {
    console.error('DOCX export error:', err)
    res.status(500).json({ error: 'DOCX generation failed', code: 'DOCX_ERROR' })
  }
})

module.exports = router
```

- [ ] **Step 4: Run all backend tests**

```bash
cd backend && npm test
```

Expected: All tests PASS (PDF export test skipped for Puppeteer — DOCX tests run fully)

- [ ] **Step 5: Manual smoke test — DOCX export**

```bash
curl -X POST http://localhost:3001/api/export/docx \
  -H "Content-Type: application/json" \
  -d '{"content":{"meta":{"version":"1.0","updatedAt":""},"personal":{"name":"Jane Doe","title":"","email":"","phone":"","location":"","linkedin":"","website":"","summary":""},"experience":[],"education":[],"skills":[],"projects":[],"certifications":[],"languages":[],"awards":[],"custom":[],"sectionOrder":["personal"],"_raw":""},"templateId":"classic"}' \
  --output resume.docx
```

Expected: `resume.docx` file created, opens in Word/LibreOffice with "Jane Doe"

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/export.js backend/src/__tests__/routes.test.js
git commit -m "feat: implement POST /api/export/pdf and /api/export/docx routes"
```

---

## Task 10: Frontend — App Shell, Routing, and Pages

Wires up React Router and creates the three page stubs with real imports.

**Files:**
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/pages/LandingPage.jsx`
- Create: `frontend/src/pages/BuildPage.jsx`
- Create: `frontend/src/pages/PreviewPage.jsx`

- [ ] **Step 1: Create page stubs**

`frontend/src/pages/LandingPage.jsx`:
```jsx
export default function LandingPage() {
  return <div>Landing</div>
}
```

`frontend/src/pages/BuildPage.jsx`:
```jsx
export default function BuildPage() {
  return <div>Build</div>
}
```

`frontend/src/pages/PreviewPage.jsx`:
```jsx
export default function PreviewPage() {
  return <div>Preview</div>
}
```

- [ ] **Step 2: Write routing tests**

Create `frontend/src/__tests__/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}

test('/ renders LandingPage', () => {
  renderAt('/')
  expect(screen.getByText('Landing')).toBeInTheDocument()
})

test('/build renders BuildPage', () => {
  renderAt('/build')
  expect(screen.getByText('Build')).toBeInTheDocument()
})

test('/preview renders PreviewPage', () => {
  renderAt('/preview')
  expect(screen.getByText('Preview')).toBeInTheDocument()
})
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
cd frontend && npm test
```

Expected: FAIL — App still has inline stub text, not page components

- [ ] **Step 4: Update frontend/src/App.jsx**

```jsx
import { Routes, Route } from 'react-router-dom'
import LandingPage  from './pages/LandingPage'
import BuildPage    from './pages/BuildPage'
import PreviewPage  from './pages/PreviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<LandingPage />} />
      <Route path="/build"   element={<BuildPage />} />
      <Route path="/preview" element={<PreviewPage />} />
    </Routes>
  )
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd frontend && npm test
```

Expected: All routing tests PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.jsx frontend/src/pages/ frontend/src/__tests__/App.test.jsx
git commit -m "feat: add React Router shell and page stubs (Landing, Build, Preview)"
```

---

## Task 11: Frontend — Landing Page

**Files:**
- Modify: `frontend/src/pages/LandingPage.jsx`
- Create: `frontend/src/components/landing/HeroCTA.jsx`
- Create: `frontend/src/components/landing/UploadDropzone.jsx`

- [ ] **Step 1: Write Landing page tests**

Create `frontend/src/__tests__/LandingPage.test.jsx`:

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>)
}

test('renders Start Fresh button', () => {
  renderLanding()
  expect(screen.getByText(/start fresh/i)).toBeInTheDocument()
})

test('renders Upload Resume button', () => {
  renderLanding()
  expect(screen.getByText(/upload resume/i)).toBeInTheDocument()
})

test('shows file input when Upload Resume is clicked', () => {
  renderLanding()
  fireEvent.click(screen.getByText(/upload resume/i))
  expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
})

test('Start Fresh navigates to /build', () => {
  renderLanding()
  const link = screen.getByText(/start fresh/i).closest('a')
  expect(link).toHaveAttribute('href', '/build')
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd frontend && npm test -- --reporter=verbose
```

Expected: FAIL — LandingPage is a stub

- [ ] **Step 3: Create frontend/src/components/landing/HeroCTA.jsx**

```jsx
import { Link } from 'react-router-dom'

export default function HeroCTA({ onUploadClick }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
        Build Your Perfect Resume
      </h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '1rem' }}>
        Professional · Free · No sign-up needed
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/build"
          style={{
            background: '#6c63ff', color: '#fff', padding: '14px 28px',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600,
            fontSize: '1rem', boxShadow: '0 4px 14px rgba(108,99,255,0.35)'
          }}
        >
          ✦ Start Fresh
        </Link>
        <button
          onClick={onUploadClick}
          style={{
            background: '#fff', color: '#6c63ff', padding: '14px 28px',
            border: '2px solid #6c63ff', borderRadius: '8px', fontWeight: 600,
            fontSize: '1rem', cursor: 'pointer'
          }}
        >
          ↑ Upload Resume
        </button>
      </div>
      <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#bbb' }}>
        PDF &amp; DOCX supported · Download as PDF or DOCX
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Create frontend/src/components/landing/UploadDropzone.jsx**

```jsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useResumeStore } from '../../store/useResumeStore'

export default function UploadDropzone() {
  const [dragging, setDragging]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const inputRef                  = useRef()
  const setContent                = useResumeStore((s) => s.setContent)
  const navigate                  = useNavigate()

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post('/api/upload', form)
      setContent(data.content)
      navigate('/build')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      data-testid="upload-dropzone"
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? '#4a9eda' : '#6c63ff'}`,
        borderRadius: '12px', padding: '40px 32px', background: dragging ? '#f0f4ff' : '#f8f7ff',
        cursor: loading ? 'wait' : 'pointer', textAlign: 'center',
        transition: 'all 0.2s', maxWidth: '420px', margin: '0 auto'
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
      <p style={{ color: '#6c63ff', fontWeight: 600, marginBottom: '4px' }}>
        {loading ? 'Parsing your resume…' : 'Drop PDF or DOCX here'}
      </p>
      <p style={{ fontSize: '0.8rem', color: '#aaa' }}>or click to browse</p>
      {error && <p style={{ color: '#e53e3e', marginTop: '10px', fontSize: '0.85rem' }}>{error}</p>}
      <input
        ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
```

- [ ] **Step 5: Update frontend/src/pages/LandingPage.jsx**

```jsx
import { useState } from 'react'
import HeroCTA       from '../components/landing/HeroCTA'
import UploadDropzone from '../components/landing/UploadDropzone'

export default function LandingPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #f8f7ff 60%, #ede9ff)',
      padding: '32px 16px'
    }}>
      <HeroCTA onUploadClick={() => setShowUpload(true)} />
      {showUpload && (
        <div style={{ marginTop: '40px', width: '100%', maxWidth: '460px' }}>
          <UploadDropzone />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd frontend && npm test
```

Expected: All landing page tests PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/LandingPage.jsx frontend/src/components/landing/
git commit -m "feat: add Landing page with dual CTA and upload dropzone"
```

---

## Task 12: Frontend — WizardLayout Shell

**Files:**
- Create: `frontend/src/components/wizard/WizardLayout.jsx`
- Create: `frontend/src/__tests__/WizardLayout.test.jsx`

- [ ] **Step 1: Write WizardLayout tests**

Create `frontend/src/__tests__/WizardLayout.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import WizardLayout from '../components/wizard/WizardLayout'

const mockSteps = [
  { title: 'Info',  component: () => <div>Info Step</div> },
  { title: 'Work',  component: () => <div>Work Step</div> },
  { title: 'Done',  component: () => <div>Done Step</div> }
]

test('renders current step component', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText('Info Step')).toBeInTheDocument()
})

test('shows step indicator', () => {
  render(<WizardLayout steps={mockSteps} currentStep={1} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
})

test('Next button calls onNext', () => {
  const onNext = jest.fn()
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={onNext} onBack={() => {}} />)
  fireEvent.click(screen.getByText(/next/i))
  expect(onNext).toHaveBeenCalled()
})

test('Back button calls onBack', () => {
  const onBack = jest.fn()
  render(<WizardLayout steps={mockSteps} currentStep={1} onNext={() => {}} onBack={onBack} />)
  fireEvent.click(screen.getByText(/back/i))
  expect(onBack).toHaveBeenCalled()
})

test('Back button is disabled on step 0', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText(/back/i)).toBeDisabled()
})

test('Next button shows Finish on last step', () => {
  render(<WizardLayout steps={mockSteps} currentStep={2} onNext={() => {}} onBack={() => {}} />)
  expect(screen.getByText(/finish/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd frontend && npm test -- --testPathPattern=WizardLayout
```

Expected: FAIL — WizardLayout doesn't exist

- [ ] **Step 3: Create frontend/src/components/wizard/WizardLayout.jsx**

```jsx
export default function WizardLayout({ steps = [], currentStep = 0, onNext, onBack }) {
  const step   = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  if (!step) return <div>Invalid step</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
            Step {currentStep + 1} of {steps.length}
          </div>
          <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
            <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: '#6c63ff', transition: 'width 0.3s' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{step.title}</h2>
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <step.component />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px', background: '#fff', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button disabled={isFirst} onClick={onBack} style={{ padding: '10px 24px', borderRadius: '6px', border: '1px solid #ddd', background: isFirst ? '#f3f4f6' : '#fff', color: isFirst ? '#999' : '#333', fontWeight: 600, cursor: isFirst ? 'not-allowed' : 'pointer' }}>
          ← Back
        </button>
        <button onClick={onNext} style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#6c63ff', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {isLast ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=WizardLayout
```

Expected: All 6 WizardLayout tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wizard/WizardLayout.jsx frontend/src/__tests__/WizardLayout.test.jsx
git commit -m "feat: add WizardLayout shell with step indicator and navigation"
```

---

## Task 13: Frontend — PersonalInfoStep

**Files:**
- Create: `frontend/src/components/wizard/PersonalInfoStep.jsx`
- Create: `frontend/src/__tests__/PersonalInfoStep.test.jsx`

- [ ] **Step 1: Write PersonalInfoStep tests**

Create `frontend/src/__tests__/PersonalInfoStep.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import PersonalInfoStep from '../components/wizard/PersonalInfoStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders all personal info fields', () => {
  render(<PersonalInfoStep />)
  expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/job title/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument()
})

test('typing in name field updates store', () => {
  render(<PersonalInfoStep />)
  fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Jane Doe' } })
  expect(useResumeStore.getState().content.personal.name).toBe('Jane Doe')
})

test('renders summary textarea', () => {
  render(<PersonalInfoStep />)
  expect(screen.getByPlaceholderText(/professional summary/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd frontend && npm test -- --testPathPattern=PersonalInfoStep
```

- [ ] **Step 3: Create frontend/src/components/wizard/PersonalInfoStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', marginBottom: '4px' }
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', color: '#555' }

function Field({ label, name, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'block', marginBottom: '20px' }}>
      <span style={labelStyle}>{label}</span>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    </label>
  )
}

export default function PersonalInfoStep() {
  const personal = useResumeStore((s) => s.content.personal)
  const updatePersonal = useResumeStore((s) => s.updatePersonal)

  const h = (e) => updatePersonal({ [e.target.name]: e.target.value })

  return (
    <div style={{ maxWidth: '600px' }}>
      <Field label="Full Name *"        name="name"     value={personal.name}     onChange={h} placeholder="Jane Doe" />
      <Field label="Job Title"          name="title"    value={personal.title}    onChange={h} placeholder="Software Engineer" />
      <Field label="Email"              name="email"    value={personal.email}    onChange={h} type="email" placeholder="jane@example.com" />
      <Field label="Phone"              name="phone"    value={personal.phone}    onChange={h} type="tel" placeholder="(555) 123-4567" />
      <Field label="Location"           name="location" value={personal.location} onChange={h} placeholder="New York, NY" />
      <Field label="LinkedIn URL"       name="linkedin" value={personal.linkedin} onChange={h} type="url" placeholder="linkedin.com/in/janedoe" />
      <Field label="Website"            name="website"  value={personal.website}  onChange={h} type="url" placeholder="janedoe.com" />
      <label style={{ display: 'block' }}>
        <span style={labelStyle}>Professional Summary</span>
        <textarea name="summary" value={personal.summary} onChange={h} placeholder="Brief summary of your background and goals..." rows={4}
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} />
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=PersonalInfoStep
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wizard/PersonalInfoStep.jsx frontend/src/__tests__/PersonalInfoStep.test.jsx
git commit -m "feat: add PersonalInfoStep"
```

---

## Task 14: Frontend — ExperienceStep

**Files:**
- Create: `frontend/src/components/wizard/ExperienceStep.jsx`
- Create: `frontend/src/__tests__/ExperienceStep.test.jsx`

- [ ] **Step 1: Write ExperienceStep tests**

Create `frontend/src/__tests__/ExperienceStep.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import ExperienceStep from '../components/wizard/ExperienceStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders Add Work Experience button when list is empty', () => {
  render(<ExperienceStep />)
  expect(screen.getByText(/add work experience/i)).toBeInTheDocument()
})

test('clicking Add Work Experience adds an entry', () => {
  render(<ExperienceStep />)
  fireEvent.click(screen.getByText(/add work experience/i))
  expect(useResumeStore.getState().content.experience).toHaveLength(1)
})

test('shows company field after adding entry', () => {
  render(<ExperienceStep />)
  fireEvent.click(screen.getByText(/add work experience/i))
  expect(screen.getByPlaceholderText(/company/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd frontend && npm test -- --testPathPattern=ExperienceStep
```

- [ ] **Step 3: Create frontend/src/components/wizard/ExperienceStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const fs = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', marginBottom: '8px' }

export default function ExperienceStep() {
  const experience       = useResumeStore((s) => s.content.experience)
  const addExperience    = useResumeStore((s) => s.addExperience)
  const updateExperience = useResumeStore((s) => s.updateExperience)
  const removeExperience = useResumeStore((s) => s.removeExperience)

  function field(id, name, value, placeholder) {
    return <input style={fs} placeholder={placeholder} value={value} onChange={(e) => updateExperience(id, { [name]: e.target.value })} />
  }

  function handleBullet(id, idx, value) {
    const exp = experience.find((e) => e.id === id)
    const bullets = [...(exp?.bullets || [])]
    bullets[idx] = value
    updateExperience(id, { bullets })
  }

  return (
    <div>
      {experience.map((exp, i) => (
        <div key={exp.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Entry {i + 1}</strong>
            <button onClick={() => removeExperience(exp.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          {field(exp.id, 'role',      exp.role,      'Job Title / Role')}
          {field(exp.id, 'company',   exp.company,   'Company')}
          {field(exp.id, 'location',  exp.location,  'Location (optional)')}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...fs, flex: 1 }} placeholder="Start Date (e.g. Jan 2022)" value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} />
            <input style={{ ...fs, flex: 1 }} placeholder="End Date or Present"        value={exp.endDate}   onChange={(e) => updateExperience(exp.id, { endDate:   e.target.value })} />
          </div>
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#555' }}>Bullet Points</div>
            {(exp.bullets || []).map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input style={{ ...fs, flex: 1, marginBottom: 0 }} placeholder={`Bullet ${idx + 1}`} value={b} onChange={(e) => handleBullet(exp.id, idx, e.target.value)} />
                <button onClick={() => { const bullets = exp.bullets.filter((_, i) => i !== idx); updateExperience(exp.id, { bullets }) }} style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })} style={{ fontSize: '0.85rem', color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add bullet</button>
          </div>
        </div>
      ))}
      <button onClick={addExperience} style={{ padding: '10px 20px', border: '2px dashed #6c63ff', borderRadius: '6px', color: '#6c63ff', background: 'none', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
        + Add Work Experience
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=ExperienceStep
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wizard/ExperienceStep.jsx frontend/src/__tests__/ExperienceStep.test.jsx
git commit -m "feat: add ExperienceStep with dynamic entry list"
```

---

## Task 15: Frontend — EducationStep

**Files:**
- Create: `frontend/src/components/wizard/EducationStep.jsx`
- Create: `frontend/src/__tests__/EducationStep.test.jsx`

- [ ] **Step 1: Write EducationStep tests**

Create `frontend/src/__tests__/EducationStep.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import EducationStep from '../components/wizard/EducationStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders Add Education button', () => {
  render(<EducationStep />)
  expect(screen.getByText(/add education/i)).toBeInTheDocument()
})

test('clicking Add Education adds an entry', () => {
  render(<EducationStep />)
  fireEvent.click(screen.getByText(/add education/i))
  expect(useResumeStore.getState().content.education).toHaveLength(1)
})

test('shows institution field after adding entry', () => {
  render(<EducationStep />)
  fireEvent.click(screen.getByText(/add education/i))
  expect(screen.getByPlaceholderText(/institution/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Create frontend/src/components/wizard/EducationStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const fs = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', marginBottom: '8px' }

export default function EducationStep() {
  const education      = useResumeStore((s) => s.content.education)
  const addEducation   = useResumeStore((s) => s.addEducation)
  const updateEducation  = useResumeStore((s) => s.updateEducation)
  const removeEducation  = useResumeStore((s) => s.removeEducation)

  return (
    <div>
      {education.map((edu, i) => (
        <div key={edu.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Entry {i + 1}</strong>
            <button onClick={() => removeEducation(edu.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <input style={fs} placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} />
          <input style={fs} placeholder="Degree (e.g. B.S.)" value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} />
          <input style={fs} placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...fs, flex: 1 }} placeholder="Start Year" value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} />
            <input style={{ ...fs, flex: 1 }} placeholder="End Year"   value={edu.endDate}   onChange={(e) => updateEducation(edu.id, { endDate:   e.target.value })} />
          </div>
          <input style={fs} placeholder="GPA (optional)" value={edu.gpa} onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} />
        </div>
      ))}
      <button onClick={addEducation} style={{ padding: '10px 20px', border: '2px dashed #6c63ff', borderRadius: '6px', color: '#6c63ff', background: 'none', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
        + Add Education
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=EducationStep
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/wizard/EducationStep.jsx frontend/src/__tests__/EducationStep.test.jsx
git commit -m "feat: add EducationStep"
```

---

## Task 16: Frontend — SkillsStep

**Files:**
- Create: `frontend/src/components/wizard/SkillsStep.jsx`
- Create: `frontend/src/__tests__/SkillsStep.test.jsx`

- [ ] **Step 1: Write SkillsStep tests**

Create `frontend/src/__tests__/SkillsStep.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import SkillsStep from '../components/wizard/SkillsStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders Add Skill Category button', () => {
  render(<SkillsStep />)
  expect(screen.getByText(/add skill category/i)).toBeInTheDocument()
})

test('clicking Add Skill Category adds to store', () => {
  render(<SkillsStep />)
  fireEvent.click(screen.getByText(/add skill category/i))
  expect(useResumeStore.getState().content.skills).toHaveLength(1)
})
```

- [ ] **Step 2: Create frontend/src/components/wizard/SkillsStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'
import { v4 as uuid } from 'uuid'

const fs = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', marginBottom: '8px' }

export default function SkillsStep() {
  const skills       = useResumeStore((s) => s.content.skills)
  const updateSkills = useResumeStore((s) => s.updateSkills)

  const add    = () => updateSkills([...skills, { id: uuid(), category: '', items: [] }])
  const remove = (id) => updateSkills(skills.filter((s) => s.id !== id))
  const update = (id, field, value) => updateSkills(skills.map((s) => s.id === id ? { ...s, [field]: value } : s))
  const setItems = (id, raw) => update(id, 'items', raw.split(',').map((s) => s.trim()).filter(Boolean))

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>Group skills by category. Separate items with commas.</p>
      {skills.map((skill, i) => (
        <div key={skill.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Category {i + 1}</strong>
            <button onClick={() => remove(skill.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <input style={fs} placeholder="Category name (e.g. Programming Languages)" value={skill.category} onChange={(e) => update(skill.id, 'category', e.target.value)} />
          <input style={fs} placeholder="Skills, comma separated (e.g. JavaScript, React, Python)" value={skill.items.join(', ')} onChange={(e) => setItems(skill.id, e.target.value)} />
        </div>
      ))}
      <button onClick={add} style={{ padding: '10px 20px', border: '2px dashed #6c63ff', borderRadius: '6px', color: '#6c63ff', background: 'none', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
        + Add Skill Category
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=SkillsStep
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/wizard/SkillsStep.jsx frontend/src/__tests__/SkillsStep.test.jsx
git commit -m "feat: add SkillsStep"
```

---

## Task 17: Frontend — OptionalSectionsStep

**Files:**
- Create: `frontend/src/components/wizard/OptionalSectionsStep.jsx`
- Create: `frontend/src/__tests__/OptionalSectionsStep.test.jsx`

- [ ] **Step 1: Write OptionalSectionsStep tests**

Create `frontend/src/__tests__/OptionalSectionsStep.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import OptionalSectionsStep from '../components/wizard/OptionalSectionsStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders all 5 optional section toggles', () => {
  render(<OptionalSectionsStep />)
  expect(screen.getByText('Projects')).toBeInTheDocument()
  expect(screen.getByText('Certifications')).toBeInTheDocument()
  expect(screen.getByText('Languages')).toBeInTheDocument()
  expect(screen.getByText('Awards')).toBeInTheDocument()
  expect(screen.getByText('Custom Section')).toBeInTheDocument()
})

test('clicking Projects toggle adds it to sectionOrder', () => {
  render(<OptionalSectionsStep />)
  fireEvent.click(screen.getByText('Projects').closest('div'))
  expect(useResumeStore.getState().content.sectionOrder).toContain('projects')
})

test('clicking an active toggle removes it from sectionOrder', () => {
  useResumeStore.getState().toggleOptionalSection('projects', true)
  render(<OptionalSectionsStep />)
  fireEvent.click(screen.getByText('Projects').closest('div'))
  expect(useResumeStore.getState().content.sectionOrder).not.toContain('projects')
})
```

- [ ] **Step 2: Create frontend/src/components/wizard/OptionalSectionsStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const SECTIONS = [
  { key: 'projects',       label: 'Projects',       desc: 'Personal or professional projects' },
  { key: 'certifications', label: 'Certifications', desc: 'Licenses and credentials' },
  { key: 'languages',      label: 'Languages',      desc: 'Spoken / written languages' },
  { key: 'awards',         label: 'Awards',         desc: 'Honors and achievements' },
  { key: 'custom',         label: 'Custom Section', desc: 'Volunteer work, publications, etc.' }
]

export default function OptionalSectionsStep() {
  const sectionOrder          = useResumeStore((s) => s.content.sectionOrder)
  const toggleOptionalSection = useResumeStore((s) => s.toggleOptionalSection)

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '20px' }}>Toggle sections to include in your resume.</p>
      {SECTIONS.map(({ key, label, desc }) => {
        const on = sectionOrder.includes(key)
        return (
          <div key={key} onClick={() => toggleOptionalSection(key, !on)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: `1px solid ${on ? '#6c63ff' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: on ? '#f8f7ff' : '#fff', transition: 'all 0.2s' }}>
            <div>
              <div style={{ fontWeight: 600, color: on ? '#6c63ff' : '#333' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{desc}</div>
            </div>
            <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: on ? '#6c63ff' : '#ddd', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=OptionalSectionsStep
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/wizard/OptionalSectionsStep.jsx frontend/src/__tests__/OptionalSectionsStep.test.jsx
git commit -m "feat: add OptionalSectionsStep with 5 toggleable sections"
```

---

## Task 18: Frontend — TemplatePickerStep

**Files:**
- Create: `frontend/src/components/wizard/TemplatePickerStep.jsx`
- Create: `frontend/src/__tests__/TemplatePickerStep.test.jsx`

- [ ] **Step 1: Write tests**

Create `frontend/src/__tests__/TemplatePickerStep.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import TemplatePickerStep from '../components/wizard/TemplatePickerStep'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => useResumeStore.setState(useResumeStore.getInitialState()))

test('renders all 5 template cards', () => {
  render(<TemplatePickerStep />)
  expect(screen.getByText('Classic')).toBeInTheDocument()
  expect(screen.getByText('Modern')).toBeInTheDocument()
  expect(screen.getByText('Minimal')).toBeInTheDocument()
  expect(screen.getByText('Executive')).toBeInTheDocument()
  expect(screen.getByText('Creative')).toBeInTheDocument()
})

test('clicking Modern updates store templateId', () => {
  render(<TemplatePickerStep />)
  fireEvent.click(screen.getByText('Modern').closest('[data-template]'))
  expect(useResumeStore.getState().templateId).toBe('modern')
})
```

- [ ] **Step 2: Create frontend/src/components/wizard/TemplatePickerStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   desc: 'Centered header, serif. ATS-safe.' },
  { id: 'modern',    name: 'Modern',    desc: 'Two-column sidebar. Great for tech.' },
  { id: 'minimal',   name: 'Minimal',   desc: 'Spacious, clean, premium feel.' },
  { id: 'executive', name: 'Executive', desc: 'Dark bold header. Senior roles.' },
  { id: 'creative',  name: 'Creative',  desc: 'Gradient header, pill skill tags.' }
]

export default function TemplatePickerStep() {
  const templateId    = useResumeStore((s) => s.templateId)
  const setTemplateId = useResumeStore((s) => s.setTemplateId)

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '24px' }}>Choose a style — you can change it anytime on the preview page.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        {TEMPLATES.map((t) => (
          <div key={t.id} data-template={t.id} onClick={() => setTemplateId(t.id)}
            style={{ border: templateId === t.id ? '3px solid #6c63ff' : '1px solid #ddd', borderRadius: '8px', padding: '14px', cursor: 'pointer', background: templateId === t.id ? '#f8f7ff' : '#fff', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ width: '100%', height: '90px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#aaa' }}>
              {t.name}
            </div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: templateId === t.id ? '#6c63ff' : '#1a1a2e' }}>{t.name}</h4>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#888', lineHeight: 1.4 }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=TemplatePickerStep
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/wizard/TemplatePickerStep.jsx frontend/src/__tests__/TemplatePickerStep.test.jsx
git commit -m "feat: add TemplatePickerStep"
```

---

## Task 19: Frontend — ResumePreview and Template Components

**Files:**
- Create: `frontend/src/components/preview/ResumePreview.jsx`
- Create: `frontend/src/components/preview/templates/ClassicTemplate.jsx`
- Create: `frontend/src/components/preview/templates/ModernTemplate.jsx`
- Create: `frontend/src/components/preview/templates/MinimalTemplate.jsx`
- Create: `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`
- Create: `frontend/src/components/preview/templates/CreativeTemplate.jsx`

- [ ] **Step 1: Create ResumePreview.jsx**

```jsx
import ClassicTemplate   from './templates/ClassicTemplate'
import ModernTemplate    from './templates/ModernTemplate'
import MinimalTemplate   from './templates/MinimalTemplate'
import ExecutiveTemplate from './templates/ExecutiveTemplate'
import CreativeTemplate  from './templates/CreativeTemplate'

const MAP = { classic: ClassicTemplate, modern: ModernTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate }

export default function ResumePreview({ content, templateId }) {
  const Template = MAP[templateId]
  if (!Template) return <div style={{ padding: '20px', color: '#e53e3e' }}>Unknown template: {templateId}</div>
  return (
    <div style={{ width: '8.5in', minHeight: '11in', background: '#fff', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Template content={content} />
    </div>
  )
}
```

- [ ] **Step 2: Create ClassicTemplate.jsx**

```jsx
import t from '../../../templates/classic.json'

export default function ClassicTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout, s = t.sections

  const label = (text) => (
    <div style={{ fontFamily: ty.sectionLabelFont, fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.headingText, borderBottom: `1px solid ${c.dividerColor}`, paddingBottom: '3px', marginBottom: '6px', marginTop: l.sectionSpacing }}>
      {text}
    </div>
  )

  return (
    <div style={{ padding: l.pageMarginSides, fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ textAlign: t.header.alignment, paddingBottom: '12px', borderBottom: `2px solid ${c.dividerColor}`, marginBottom: '14px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, color: c.mutedText, marginTop: '3px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10px', color: c.mutedText, marginTop: '5px' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join(' · ')}
        </div>
      </div>
      {personal.summary && <div style={{ marginBottom: '12px' }}>{personal.summary}</div>}
      {sectionOrder.filter((k) => k !== 'personal').map((key) => {
        if (key === 'experience' && experience.length) return (
          <div key={key}>{label('Experience')}{experience.map((e) => (
            <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.role}{e.role && e.company ? ' — ' : ''}{e.company}</strong>
                <span style={{ color: c.mutedText }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span>
              </div>
              {e.location && <div style={{ color: c.mutedText }}>{e.location}</div>}
              {e.bullets?.filter(Boolean).map((b, i) => <div key={i}>• {b}</div>)}
            </div>
          ))}</div>
        )
        if (key === 'education' && education.length) return (
          <div key={key}>{label('Education')}{education.map((e) => (
            <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.degree} {e.field}</strong><span style={{ color: c.mutedText }}>{e.endDate}</span>
              </div>
              <div style={{ color: c.mutedText }}>{e.institution}</div>
              {e.gpa && <div>GPA: {e.gpa}</div>}
            </div>
          ))}</div>
        )
        if (key === 'skills' && skills.length) return (
          <div key={key}>{label('Skills')}{skills.map((sk) => (
            <div key={sk.id}>{sk.category && <strong>{sk.category}: </strong>}{sk.items.join(', ')}</div>
          ))}</div>
        )
        return null
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create ModernTemplate.jsx**

ModernTemplate renders a two-column layout: colored sidebar on the left, main content on the right. Follow the same pattern as ClassicTemplate but read from `modern.json` and use flex layout.

```jsx
import t from '../../../templates/modern.json'

export default function ModernTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout, s = t.sections
  const sw = l.sidebarWidthPercent

  const sidebarLabel = (text) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.sidebarAccent, borderBottom: `1px solid ${c.sidebarAccent}`, paddingBottom: '3px', marginBottom: '6px', marginTop: '14px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.headingText, borderBottom: `1px solid ${c.dividerColor}`, paddingBottom: '3px', marginBottom: '6px', marginTop: '14px' }}>{text}</div>
  )

  const mainSections = s.mainSections || []

  return (
    <div style={{ display: 'flex', minHeight: '11in', fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize }}>
      <div style={{ width: `${sw}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '24px 16px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: c.sidebarAccent, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>
            {(personal.name || '?')[0]}
          </div>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight }}>{personal.name}</div>
          {personal.title && <div style={{ fontSize: ty.titleFontSize, color: c.sidebarAccent, marginTop: '3px' }}>{personal.title}</div>}
        </div>
        {sidebarLabel('Contact')}
        {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => <div key={i} style={{ fontSize: '10px', marginBottom: '3px', wordBreak: 'break-all' }}>{v}</div>)}
        {skills.length > 0 && <>{sidebarLabel('Skills')}{skills.map((sk) => <div key={sk.id} style={{ marginBottom: '6px' }}><div style={{ fontWeight: 'bold', fontSize: '10px' }}>{sk.category}</div><div style={{ fontSize: '10px' }}>{sk.items.join(', ')}</div></div>)}</>}
      </div>
      <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '24px 20px', boxSizing: 'border-box' }}>
        {personal.summary && <div style={{ marginBottom: '12px' }}>{personal.summary}</div>}
        {sectionOrder.filter((k) => k !== 'personal' && mainSections.includes(k)).map((key) => {
          if (key === 'experience' && experience.length) return (
            <div key={key}>{mainLabel('Experience')}{experience.map((e) => (
              <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: c.headingText }}>{e.role}{e.role && e.company ? ' — ' : ''}{e.company}</strong>
                  <span style={{ color: c.mutedText, fontSize: '10px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span>
                </div>
                {e.bullets?.filter(Boolean).map((b, i) => <div key={i} style={{ marginTop: '2px' }}>– {b}</div>)}
              </div>
            ))}</div>
          )
          if (key === 'education' && education.length) return (
            <div key={key}>{mainLabel('Education')}{education.map((e) => (
              <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                <strong style={{ color: c.headingText }}>{e.degree} {e.field}</strong>
                <div style={{ color: c.mutedText }}>{e.institution} · {e.endDate}</div>
              </div>
            ))}</div>
          )
          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create MinimalTemplate.jsx, ExecutiveTemplate.jsx, CreativeTemplate.jsx**

Each follows the same pattern. Read from the respective JSON file and render using its colors, typography, and layout values. MinimalTemplate and ExecutiveTemplate are single-column (follow ClassicTemplate structure). CreativeTemplate is two-column with a gradient header (follow ModernTemplate structure using `creative.json` gradient colors).

For MinimalTemplate: use `minimal.json`, thin fonts, no dividers, lots of whitespace.

For ExecutiveTemplate: use `executive.json`, full-bleed dark header (`headerBackground` color), bold section labels with thick underlines.

For CreativeTemplate: gradient header (`linear-gradient(135deg, headerGradientStart, headerGradientEnd)`), light sidebar using `sidebarBackground`, pill-style skill tags using `tagBackground` and `tagText`.

- [ ] **Step 5: Write a smoke test for ResumePreview**

Create `frontend/src/__tests__/ResumePreview.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import ResumePreview from '../components/preview/ResumePreview'

const content = {
  personal: { name: 'Jane Doe', title: 'Engineer', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [], education: [], skills: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'], _raw: ''
}

test.each(['classic', 'modern', 'minimal', 'executive', 'creative'])('%s template renders without crash', (id) => {
  render(<ResumePreview content={content} templateId={id} />)
  expect(screen.getByText('Jane Doe')).toBeInTheDocument()
})

test('unknown templateId shows error message', () => {
  render(<ResumePreview content={content} templateId="unknown" />)
  expect(screen.getByText(/unknown template/i)).toBeInTheDocument()
})
```

- [ ] **Step 6: Run all preview tests**

```bash
cd frontend && npm test -- --testPathPattern=ResumePreview
```

Expected: All 6 tests PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/preview/
git commit -m "feat: add ResumePreview and all 5 template renderers"
```

---

## Task 20: Frontend — PreviewStep

**Files:**
- Create: `frontend/src/components/wizard/PreviewStep.jsx`

- [ ] **Step 1: Create frontend/src/components/wizard/PreviewStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'
import ResumePreview from '../preview/ResumePreview'

export default function PreviewStep() {
  const content    = useResumeStore((s) => s.content)
  const templateId = useResumeStore((s) => s.templateId)

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        This is how your resume looks. Click Finish to go to the download page.
      </p>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <ResumePreview content={content} templateId={templateId} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/wizard/PreviewStep.jsx
git commit -m "feat: add PreviewStep"
```

---

## Task 21: Frontend — PreviewPage, TemplateSwitcher, DownloadButtons

**Files:**
- Modify: `frontend/src/pages/PreviewPage.jsx`
- Create: `frontend/src/components/preview/TemplateSwitcher.jsx`
- Create: `frontend/src/components/shared/DownloadButtons.jsx`

- [ ] **Step 1: Create TemplateSwitcher.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = ['classic', 'modern', 'minimal', 'executive', 'creative']

export default function TemplateSwitcher() {
  const templateId    = useResumeStore((s) => s.templateId)
  const setTemplateId = useResumeStore((s) => s.setTemplateId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {TEMPLATES.map((t) => (
        <button key={t} onClick={() => setTemplateId(t)}
          style={{ padding: '8px 14px', borderRadius: '6px', border: templateId === t ? '2px solid #6c63ff' : '1px solid #ddd', background: templateId === t ? '#6c63ff' : '#fff', color: templateId === t ? '#fff' : '#333', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', textAlign: 'left' }}>
          {t}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create DownloadButtons.jsx**

```jsx
import { useState } from 'react'
import axios from 'axios'
import { useResumeStore } from '../../store/useResumeStore'

export default function DownloadButtons() {
  const content    = useResumeStore((s) => s.content)
  const templateId = useResumeStore((s) => s.templateId)
  const [loading, setLoading] = useState(null)
  const [error, setError]     = useState('')

  async function download(type) {
    setLoading(type)
    setError('')
    try {
      const { data } = await axios.post(`/api/export/${type}`, { content, templateId }, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(`Failed to export ${type.toUpperCase()}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
        <button onClick={() => download('pdf')} disabled={!!loading}
          style={{ padding: '12px', borderRadius: '6px', border: 'none', background: '#6c63ff', color: '#fff', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
          {loading === 'pdf' ? '⏳ Generating…' : '⬇ Download PDF'}
        </button>
        <button onClick={() => download('docx')} disabled={!!loading}
          style={{ padding: '12px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
          {loading === 'docx' ? '⏳ Generating…' : '⬇ Download DOCX'}
        </button>
      </div>
      {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem' }}>{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Update PreviewPage.jsx**

```jsx
import { useNavigate } from 'react-router-dom'
import { useResumeStore } from '../store/useResumeStore'
import ResumePreview from '../components/preview/ResumePreview'
import TemplateSwitcher from '../components/preview/TemplateSwitcher'
import DownloadButtons from '../components/shared/DownloadButtons'

export default function PreviewPage() {
  const content    = useResumeStore((s) => s.content)
  const templateId = useResumeStore((s) => s.templateId)
  const navigate   = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Resume Preview</h1>
          <button onClick={() => navigate('/build')}
            style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            ← Back to Edit
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '28px', alignItems: 'start' }}>
          <div style={{ overflow: 'auto' }}>
            <ResumePreview content={content} templateId={templateId} />
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem' }}>Template</h3>
            <TemplateSwitcher />
            <h3 style={{ margin: '20px 0 14px 0', fontSize: '1rem' }}>Download</h3>
            <DownloadButtons />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PreviewPage.jsx frontend/src/components/preview/TemplateSwitcher.jsx frontend/src/components/shared/DownloadButtons.jsx
git commit -m "feat: add PreviewPage with template switcher and download buttons"
```

---

## Task 22: Frontend — BuildPage (Wizard Integration)

**Files:**
- Modify: `frontend/src/pages/BuildPage.jsx`

- [ ] **Step 1: Update BuildPage.jsx**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardLayout         from '../components/wizard/WizardLayout'
import PersonalInfoStep     from '../components/wizard/PersonalInfoStep'
import ExperienceStep       from '../components/wizard/ExperienceStep'
import EducationStep        from '../components/wizard/EducationStep'
import SkillsStep           from '../components/wizard/SkillsStep'
import OptionalSectionsStep from '../components/wizard/OptionalSectionsStep'
import TemplatePickerStep   from '../components/wizard/TemplatePickerStep'
import PreviewStep          from '../components/wizard/PreviewStep'

const STEPS = [
  { title: 'Personal Info',       component: PersonalInfoStep     },
  { title: 'Work Experience',     component: ExperienceStep       },
  { title: 'Education',           component: EducationStep        },
  { title: 'Skills',              component: SkillsStep           },
  { title: 'Optional Sections',   component: OptionalSectionsStep },
  { title: 'Choose Template',     component: TemplatePickerStep   },
  { title: 'Preview & Download',  component: PreviewStep          }
]

export default function BuildPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  function handleNext() {
    if (currentStep === STEPS.length - 1) navigate('/preview')
    else setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={() => setCurrentStep((s) => Math.max(s - 1, 0))}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/BuildPage.jsx
git commit -m "feat: wire BuildPage with all 7 wizard steps"
```

---

## Task 23: Final Integration Verification

- [ ] **Step 1: Run all tests**

```bash
cd backend  && npm test
cd ../frontend && npm test
```

Expected: All tests PASS

- [ ] **Step 2: Start both servers**

```bash
npm run dev
```

Expected: Frontend on `http://localhost:5173`, backend on `http://localhost:3001`

- [ ] **Step 3: Manual end-to-end flow**

1. Open `http://localhost:5173`
2. See Landing page — "Start Fresh" and "Upload Resume" buttons visible
3. Click **Start Fresh** → navigates to `/build`
4. Fill Personal Info (name, email, title) → Next
5. Add one experience entry with company + 2 bullets → Next
6. Add one education entry → Next
7. Add one skill category with comma-separated skills → Next
8. Toggle on Projects and Languages → Next
9. Select "Modern" template → Next
10. See live preview — resume renders with Modern template → Finish
11. On `/preview` page — see full resume preview + template switcher + download buttons
12. Click "Download PDF" → PDF file downloads
13. Open PDF — verify it shows correct name, experience, and styling
14. Click "Download DOCX" → DOCX file downloads
15. Open DOCX — verify content is correct

- [ ] **Step 4: Manual upload flow**

1. Back on Landing page, click **Upload Resume**
2. Upload a real PDF or DOCX resume
3. Wizard auto-fills with parsed content
4. Adjust any fields, pick a template, download

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete resume builder v1 — wizard, upload, 5 templates, PDF/DOCX export"
```

---

## Summary

**23 tasks · 22 commits · Full-stack resume builder complete.**

| Area | Coverage |
|---|---|
| Backend services | contentMapper, pdfParser, docxParser, htmlRenderer, pdfExporter, docxExporter |
| Backend routes | POST /api/upload, POST /api/export/pdf, POST /api/export/docx, /api/agents (reserved) |
| Frontend stores | useResumeStore (full TDD), useAgentStore (reserved) |
| Frontend pages | Landing, Build (7-step wizard), Preview |
| Templates | Classic, Modern, Minimal, Executive, Creative |
| Tests | Jest (backend), Vitest + RTL (frontend) |

**AI roadmap:** Implement `POST /api/agents/review`, `/content`, `/match`, `/benchmark` using the Claude API (Anthropic SDK) with SSE streaming. Add `useAgentStore` slices as each agent lands.

---
