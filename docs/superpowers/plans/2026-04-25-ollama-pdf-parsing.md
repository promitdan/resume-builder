# Ollama PDF Parsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the brittle regex-based PDF content mapper with an Ollama LLM call that produces structured JSON output, falling back to the existing regex mapper if Ollama is unavailable.

**Architecture:** Raw text is still extracted by `pdfParser.js` (pdf-parse). A new `ollamaParser.js` posts that text to `http://localhost:11434/api/chat` with `format: "json"` and a system prompt that instructs the model to return resume JSON. A new `llmContentMapper.js` normalizes the LLM output (adds UUIDs, enforces defaults, builds sectionOrder). `upload.js` tries Ollama first; on any failure it falls back to the existing `mapToContent` and sets an `X-Parse-Method: regex-fallback` response header.

**Tech Stack:** Node.js, Express, `node-fetch` (or native `fetch` if Node ≥18), Jest for tests, Ollama `/api/chat` endpoint, `uuid`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/src/services/parser/ollamaParser.js` | HTTP call to Ollama, returns raw LLM JSON string |
| Create | `backend/src/services/parser/llmContentMapper.js` | Normalize LLM output → exact content schema |
| Modify | `backend/src/routes/upload.js` | Try Ollama → fallback to regex |
| Create | `backend/src/__tests__/ollamaParser.test.js` | Unit tests for Ollama caller + fallback logic |
| Create | `backend/src/__tests__/llmContentMapper.test.js` | Unit tests for normalization logic |

---

### Task 1: ollamaParser.js — Ollama HTTP caller

**Files:**
- Create: `backend/src/services/parser/ollamaParser.js`
- Test: `backend/src/__tests__/ollamaParser.test.js`

The system prompt asks the model to return a single JSON object. We use `format: "json"` so Ollama constrains the output. Timeout is 120 seconds. ECONNREFUSED → throw `OllamaUnavailableError` (subclass of Error) so the caller can distinguish "LLM down" from "LLM returned bad data".

- [ ] **Step 1: Write the failing tests**

Create `backend/src/__tests__/ollamaParser.test.js`:

```js
jest.mock('node-fetch')
const fetch = require('node-fetch')
const { Response } = jest.requireActual('node-fetch')
const { parseWithOllama, OllamaUnavailableError } = require('../services/parser/ollamaParser')

const MOCK_CONTENT = {
  personal: { name: 'Jane Doe', email: 'jane@example.com', phone: '', title: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [], education: [], skills: [], projects: [], certifications: [], languages: [], awards: [], custom: []
}

describe('parseWithOllama', () => {
  beforeEach(() => jest.clearAllMocks())

  test('returns parsed content on successful Ollama response', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      message: { content: JSON.stringify(MOCK_CONTENT) }
    }), { status: 200 }))

    const result = await parseWithOllama('Jane Doe\njane@example.com')
    expect(result.personal.name).toBe('Jane Doe')
    expect(result.personal.email).toBe('jane@example.com')
  })

  test('throws OllamaUnavailableError when connection refused', async () => {
    const err = new Error('connect ECONNREFUSED')
    err.code = 'ECONNREFUSED'
    fetch.mockRejectedValueOnce(err)

    await expect(parseWithOllama('some text')).rejects.toBeInstanceOf(OllamaUnavailableError)
  })

  test('throws OllamaUnavailableError on non-200 response', async () => {
    fetch.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }))

    await expect(parseWithOllama('some text')).rejects.toBeInstanceOf(OllamaUnavailableError)
  })

  test('throws Error (not OllamaUnavailableError) when response JSON is malformed', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      message: { content: 'not valid json {{{' }
    }), { status: 200 }))

    await expect(parseWithOllama('some text')).rejects.toThrow()
  })

  test('uses OLLAMA_MODEL env var when set', async () => {
    process.env.OLLAMA_MODEL = 'mistral'
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({
      message: { content: JSON.stringify(MOCK_CONTENT) }
    }), { status: 200 }))

    await parseWithOllama('some text')
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.model).toBe('mistral')
    delete process.env.OLLAMA_MODEL
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
npx jest ollamaParser --no-coverage 2>&1 | tail -20
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement ollamaParser.js**

Create `backend/src/services/parser/ollamaParser.js`:

```js
const fetch = require('node-fetch')

const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434'
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || 'llama3'
const TIMEOUT_MS   = 120_000

class OllamaUnavailableError extends Error {
  constructor(msg) { super(msg); this.name = 'OllamaUnavailableError' }
}

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the resume text and return ONLY valid JSON with this exact shape:
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "summary": "" },
  "experience": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }],
  "skills": [{ "category": "", "items": [] }],
  "projects": [{ "title": "", "description": "", "url": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "languages": [{ "language": "", "proficiency": "Professional" }],
  "awards": [{ "title": "", "issuer": "", "date": "" }],
  "custom": [{ "title": "", "description": "" }]
}
Return empty arrays for sections not present. Do not add any keys not in the schema above.`

async function parseWithOllama(rawText) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL(),
        format: 'json',
        stream: false,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: rawText }
        ]
      }),
      signal: controller.signal
    })
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.name === 'AbortError') {
      throw new OllamaUnavailableError(`Ollama not reachable: ${err.message}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new OllamaUnavailableError(`Ollama returned HTTP ${response.status}`)
  }

  const data = await response.json()
  const content = JSON.parse(data.message.content)
  return content
}

module.exports = { parseWithOllama, OllamaUnavailableError }
```

- [ ] **Step 4: Check if node-fetch is installed**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
node -e "require('node-fetch')" 2>&1
```

If it prints an error, install it:
```bash
npm install node-fetch@2
```
(Use v2 for CommonJS `require` compatibility.)

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
npx jest ollamaParser --no-coverage 2>&1 | tail -20
```
Expected: 5 tests PASS

- [ ] **Step 6: Commit**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
git add src/services/parser/ollamaParser.js src/__tests__/ollamaParser.test.js
git commit -m "feat: add ollamaParser — Ollama /api/chat caller with OllamaUnavailableError"
```

---

### Task 2: llmContentMapper.js — LLM output normalizer

**Files:**
- Create: `backend/src/services/parser/llmContentMapper.js`
- Test: `backend/src/__tests__/llmContentMapper.test.js`

The LLM may omit fields, return null instead of empty string, or forget to add IDs. This mapper enforces the full content schema expected by the frontend store and templates.

- [ ] **Step 1: Write the failing tests**

Create `backend/src/__tests__/llmContentMapper.test.js`:

```js
const { normalizeLlmContent } = require('../services/parser/llmContentMapper')

describe('normalizeLlmContent', () => {
  test('adds meta and _raw', () => {
    const result = normalizeLlmContent({}, 'raw text')
    expect(result.meta.version).toBe('1.0')
    expect(result._raw).toBe('raw text')
  })

  test('fills missing personal fields with empty strings', () => {
    const result = normalizeLlmContent({ personal: { name: 'Jane' } }, '')
    expect(result.personal.name).toBe('Jane')
    expect(result.personal.email).toBe('')
    expect(result.personal.summary).toBe('')
  })

  test('adds uuid id to each experience entry', () => {
    const result = normalizeLlmContent({
      experience: [{ company: 'Acme', role: 'Eng', location: '', startDate: '', endDate: '', current: false, bullets: [] }]
    }, '')
    expect(result.experience[0].id).toBeTruthy()
    expect(result.experience[0].company).toBe('Acme')
  })

  test('ensures bullets is an array (null → [])', () => {
    const result = normalizeLlmContent({
      experience: [{ company: 'X', role: 'Y', bullets: null }]
    }, '')
    expect(Array.isArray(result.experience[0].bullets)).toBe(true)
  })

  test('adds uuid id to each education entry', () => {
    const result = normalizeLlmContent({
      education: [{ institution: 'MIT', degree: 'B.S.', field: 'CS', startDate: '2018', endDate: '2022', gpa: '3.9' }]
    }, '')
    expect(result.education[0].id).toBeTruthy()
  })

  test('adds uuid id to each skills group and ensures items is array', () => {
    const result = normalizeLlmContent({
      skills: [{ category: 'Languages', items: ['JS', 'Python'] }]
    }, '')
    expect(result.skills[0].id).toBeTruthy()
    expect(result.skills[0].items).toEqual(['JS', 'Python'])
  })

  test('builds sectionOrder from populated arrays', () => {
    const result = normalizeLlmContent({
      personal: { name: 'Jane' },
      experience: [{ company: 'Acme', role: 'Eng', bullets: [] }],
      education: [],
      skills: [{ category: 'X', items: ['Y'] }]
    }, '')
    expect(result.sectionOrder).toContain('personal')
    expect(result.sectionOrder).toContain('experience')
    expect(result.sectionOrder).toContain('skills')
    expect(result.sectionOrder).not.toContain('education')
  })

  test('handles completely empty LLM output without throwing', () => {
    expect(() => normalizeLlmContent(null, '')).not.toThrow()
    expect(() => normalizeLlmContent(undefined, '')).not.toThrow()
  })

  test('handles items being a string (comma-split it)', () => {
    const result = normalizeLlmContent({
      skills: [{ category: 'Tech', items: 'React, Node.js, TypeScript' }]
    }, '')
    expect(result.skills[0].items).toEqual(['React', 'Node.js', 'TypeScript'])
  })

  test('adds uuid id to certifications, awards, projects, custom entries', () => {
    const result = normalizeLlmContent({
      certifications: [{ name: 'AWS', issuer: 'Amazon', date: '2023' }],
      awards: [{ title: 'Hack winner', issuer: 'MIT', date: '2022' }],
      projects: [{ title: 'MyApp', description: 'Cool app', url: '' }],
      custom: [{ title: 'Volunteer', description: 'Food bank' }]
    }, '')
    expect(result.certifications[0].id).toBeTruthy()
    expect(result.awards[0].id).toBeTruthy()
    expect(result.projects[0].id).toBeTruthy()
    expect(result.custom[0].id).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
npx jest llmContentMapper --no-coverage 2>&1 | tail -20
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement llmContentMapper.js**

Create `backend/src/services/parser/llmContentMapper.js`:

```js
const { v4: uuid } = require('uuid')

const OPTIONAL_SECTIONS = ['projects', 'certifications', 'languages', 'awards', 'custom']

function str(v) { return (v != null && v !== false) ? String(v) : '' }
function arr(v) { return Array.isArray(v) ? v : [] }

function normalizePersonal(p) {
  p = p || {}
  return {
    name:     str(p.name),
    title:    str(p.title),
    email:    str(p.email),
    phone:    str(p.phone),
    location: str(p.location),
    linkedin: str(p.linkedin),
    website:  str(p.website),
    summary:  str(p.summary)
  }
}

function normalizeExperience(list) {
  return arr(list).map(e => ({
    id:        uuid(),
    company:   str(e.company),
    role:      str(e.role),
    location:  str(e.location),
    startDate: str(e.startDate),
    endDate:   str(e.endDate),
    current:   e.current === true,
    bullets:   arr(e.bullets).map(str).filter(Boolean)
  }))
}

function normalizeEducation(list) {
  return arr(list).map(e => ({
    id:          uuid(),
    institution: str(e.institution),
    degree:      str(e.degree),
    field:       str(e.field),
    startDate:   str(e.startDate),
    endDate:     str(e.endDate),
    gpa:         str(e.gpa)
  }))
}

function normalizeSkills(list) {
  return arr(list).map(sk => {
    let items = sk.items
    if (typeof items === 'string') {
      items = items.split(',').map(s => s.trim()).filter(Boolean)
    } else {
      items = arr(items).map(str).filter(Boolean)
    }
    return { id: uuid(), category: str(sk.category), items }
  })
}

function normalizeCertifications(list) {
  return arr(list).map(c => ({ id: uuid(), name: str(c.name), issuer: str(c.issuer), date: str(c.date) }))
}

function normalizeLanguages(list) {
  return arr(list).map(l => ({ id: uuid(), language: str(l.language), proficiency: str(l.proficiency) || 'Professional' }))
}

function normalizeAwards(list) {
  return arr(list).map(a => ({ id: uuid(), title: str(a.title), issuer: str(a.issuer), date: str(a.date) }))
}

function normalizeProjects(list) {
  return arr(list).map(p => ({ id: uuid(), title: str(p.title), description: str(p.description), url: str(p.url) }))
}

function normalizeCustom(list) {
  return arr(list).map(c => ({ id: uuid(), title: str(c.title), description: str(c.description) }))
}

function normalizeLlmContent(raw, rawText) {
  const llm = raw || {}

  const personal       = normalizePersonal(llm.personal)
  const experience     = normalizeExperience(llm.experience)
  const education      = normalizeEducation(llm.education)
  const skills         = normalizeSkills(llm.skills)
  const projects       = normalizeProjects(llm.projects)
  const certifications = normalizeCertifications(llm.certifications)
  const languages      = normalizeLanguages(llm.languages)
  const awards         = normalizeAwards(llm.awards)
  const custom         = normalizeCustom(llm.custom)

  const sectionOrder = ['personal']
  if (experience.length)     sectionOrder.push('experience')
  if (education.length)      sectionOrder.push('education')
  if (skills.length)         sectionOrder.push('skills')
  if (projects.length)       sectionOrder.push('projects')
  if (certifications.length) sectionOrder.push('certifications')
  if (languages.length)      sectionOrder.push('languages')
  if (awards.length)         sectionOrder.push('awards')
  if (custom.length)         sectionOrder.push('custom')

  return {
    meta: { version: '1.0', updatedAt: new Date().toISOString() },
    personal,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    awards,
    custom,
    sectionOrder,
    _raw: rawText || ''
  }
}

module.exports = { normalizeLlmContent }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
npx jest llmContentMapper --no-coverage 2>&1 | tail -20
```
Expected: 10 tests PASS

- [ ] **Step 5: Commit**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
git add src/services/parser/llmContentMapper.js src/__tests__/llmContentMapper.test.js
git commit -m "feat: add llmContentMapper — normalizes Ollama output to content schema"
```

---

### Task 3: Update upload.js — Ollama-first with regex fallback

**Files:**
- Modify: `backend/src/routes/upload.js`

The try/catch wraps the Ollama call. An `OllamaUnavailableError` (or any error from `parseWithOllama`) triggers the regex fallback. A successful Ollama result is passed through `normalizeLlmContent`. Response includes `X-Parse-Method` header (`ollama` or `regex-fallback`).

No new test file is needed — the existing `routes.test.js` already verifies the upload endpoint returns `content` with the right shape, which will still pass with the regex fallback active in tests (since Ollama won't be running in CI).

- [ ] **Step 1: Check existing routes tests pass as-is**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
npx jest routes --no-coverage 2>&1 | tail -20
```
Expected: existing tests pass (baseline confirmation)

- [ ] **Step 2: Update upload.js**

Replace the content of `backend/src/routes/upload.js` with:

```js
const express  = require('express')
const multer   = require('multer')
const { extractTextFromPdf }    = require('../services/parser/pdfParser')
const { extractTextFromDocx }   = require('../services/parser/docxParser')
const { mapToContent }          = require('../services/parser/contentMapper')
const { parseWithOllama, OllamaUnavailableError } = require('../services/parser/ollamaParser')
const { normalizeLlmContent }   = require('../services/parser/llmContentMapper')

const router  = express.Router()
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

    let content, parseMethod

    try {
      const llmRaw = await parseWithOllama(rawText)
      content     = normalizeLlmContent(llmRaw, rawText)
      parseMethod = 'ollama'
    } catch (ollamaErr) {
      if (!(ollamaErr instanceof OllamaUnavailableError)) {
        console.warn('Ollama parse failed, falling back to regex:', ollamaErr.message)
      }
      content     = mapToContent(rawText)
      parseMethod = 'regex-fallback'
    }

    res.set('X-Parse-Method', parseMethod)
    return res.json({ content })
  } catch (err) {
    console.error('Parse error:', err)
    return res.status(422).json({ error: 'Failed to parse file', code: 'PARSE_ERROR' })
  }
})

module.exports = router
```

- [ ] **Step 3: Run all backend tests**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
npx jest --no-coverage 2>&1 | tail -30
```
Expected: all tests pass (Ollama will ECONNREFUSED in test env → regex fallback → same output shape as before)

- [ ] **Step 4: Commit**

```bash
cd "d:/Games/Personal Projects/resume-builder/backend"
git add src/routes/upload.js
git commit -m "feat: upload route — try Ollama first, fall back to regex on unavailable"
```

---

## Self-Review

**Spec coverage:**
- ✅ Ollama `/api/chat` with `format: "json"` — Task 1
- ✅ `temperature: 0.1`, 120s timeout — Task 1
- ✅ `OLLAMA_MODEL` env var — Task 1
- ✅ ECONNREFUSED → `OllamaUnavailableError` — Task 1
- ✅ Normalizes LLM output (UUIDs, defaults, sectionOrder) — Task 2
- ✅ `items` as string → split by comma — Task 2
- ✅ Fallback to regex `mapToContent` on any Ollama failure — Task 3
- ✅ `X-Parse-Method` header on response — Task 3
- ✅ `_raw` preserved in output — Task 2

**Placeholder scan:** None found.

**Type consistency:** `normalizeLlmContent(llmRaw, rawText)` — `llmRaw` is the raw parsed object from Ollama (Task 1 returns it), `rawText` is the original text string. Consistent across Tasks 1, 2, 3.
