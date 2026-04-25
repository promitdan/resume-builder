# Rich Text Editing + AI Writing Assistance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace plain-text InlineEditor on summary and bullet fields with a TipTap rich text editor, and add a floating Slack-style toolbar with an "Ask AI" button that calls a new backend endpoint.

**Architecture:** A `RichTextEditor` component wraps TipTap's `useEditor` and renders a focus-triggered floating toolbar (`RichTextToolbar`) with Bold/Italic/Underline/Link formatting buttons and an "Ask AI" button. Clicking "Ask AI" opens `AiAssistPopover`, which POSTs plain text to `/api/ai/assist` and replaces the editor content with the result. Content is stored as HTML strings in the existing Zustand store fields — no store shape changes needed.

**Tech Stack:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`), React 18, Zustand, Express, node-fetch (already in backend), Groq API with Ollama fallback.

---

## File Map

**Create (frontend):**
- `frontend/src/components/preview/RichTextEditor.css` — ProseMirror reset styles
- `frontend/src/components/preview/RichTextEditor.jsx` — editor component, replaces InlineEditor on rich text fields
- `frontend/src/components/preview/RichTextToolbar.jsx` — floating formatting toolbar + Ask AI button
- `frontend/src/components/preview/AiAssistPopover.jsx` — AI action chips + loading/error state

**Modify (frontend):**
- `frontend/package.json` — add TipTap dependencies
- `frontend/src/components/preview/templates/ModernTemplate.jsx` — swap InlineEditor → RichTextEditor on summary, bullets, project descriptions
- `frontend/src/components/preview/templates/ClassicTemplate.jsx` — same swaps
- `frontend/src/components/preview/templates/MinimalTemplate.jsx` — same swaps
- `frontend/src/components/preview/templates/ExecutiveTemplate.jsx` — same swaps
- `frontend/src/components/preview/templates/CreativeTemplate.jsx` — same swaps

**Create (backend):**
- `backend/src/services/ai/resumeAssistant.js` — prompt builder + Groq/Ollama caller
- `backend/src/routes/assist.js` — `POST /` route handler

**Modify (backend):**
- `backend/src/index.js` — mount the assist router at `/api/ai/assist`

---

## Task 1: Install TipTap dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install the packages**

```bash
cd frontend && npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link
```

Expected output: 4 packages added, no peer dependency errors.

- [ ] **Step 2: Verify installation**

```bash
cat frontend/package.json | grep tiptap
```

Expected: four `@tiptap/` entries under `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add tiptap dependencies"
```

---

## Task 2: Create ProseMirror reset styles

**Files:**
- Create: `frontend/src/components/preview/RichTextEditor.css`

- [ ] **Step 1: Create the CSS file**

`frontend/src/components/preview/RichTextEditor.css`:
```css
.ProseMirror {
  outline: none;
}
.ProseMirror p {
  margin: 0;
}
.ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
}
```

No commit yet — committed together with the component in Task 3.

---

## Task 3: Create RichTextEditor component

**Files:**
- Create: `frontend/src/components/preview/RichTextEditor.jsx`

- [ ] **Step 1: Create the component**

`frontend/src/components/preview/RichTextEditor.jsx`:
```jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import RichTextToolbar from './RichTextToolbar'
import './RichTextEditor.css'

export default function RichTextEditor({ path, value }) {
  const setField = useResumeStore(s => s.setField)
  const [isFocused, setIsFocused] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
    ],
    content: value || '',
    onFocus: () => setIsFocused(true),
    onBlur: ({ editor }) => {
      setIsFocused(false)
      setField(path, editor.getHTML())
    },
  })

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {isFocused && (
        <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', zIndex: 100 }}>
          <RichTextToolbar editor={editor} />
        </div>
      )}
      <div
        style={{
          outline: 'none',
          padding: isFocused ? '2px 6px' : '0',
          borderLeft: isFocused ? '2px solid #3b82f6' : '2px solid transparent',
          borderRadius: '2px',
          background: isFocused ? '#eff6ff' : 'transparent',
          cursor: 'text',
          minHeight: '1em',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/preview/RichTextEditor.jsx frontend/src/components/preview/RichTextEditor.css
git commit -m "feat: add RichTextEditor component with TipTap"
```

---

## Task 4: Create RichTextToolbar component

**Files:**
- Create: `frontend/src/components/preview/RichTextToolbar.jsx`

- [ ] **Step 1: Create the component**

`frontend/src/components/preview/RichTextToolbar.jsx`:
```jsx
import { useState } from 'react'
import AiAssistPopover from './AiAssistPopover'

export default function RichTextToolbar({ editor }) {
  const [showAi, setShowAi] = useState(false)

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
    else if (url === '') editor.chain().focus().unsetLink().run()
  }

  const btn = (active) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? '#334155' : 'transparent',
    border: 'none',
    color: '#e2e8f0',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  })

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        background: '#1e293b',
        borderRadius: '8px',
        padding: '5px 8px',
        boxShadow: '0 4px 12px rgba(0,0,0,.25)',
      }}>
        <button
          title="Bold"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          style={btn(editor.isActive('bold'))}
        ><b>B</b></button>

        <button
          title="Italic"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          style={btn(editor.isActive('italic'))}
        ><i>I</i></button>

        <button
          title="Underline"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
          style={btn(editor.isActive('underline'))}
        ><u>U</u></button>

        <button
          title="Link"
          onMouseDown={(e) => { e.preventDefault(); addLink() }}
          style={btn(editor.isActive('link'))}
        >🔗</button>

        <div style={{ width: '1px', height: '18px', background: '#334155', margin: '0 4px' }} />

        <button
          title="Ask AI"
          onMouseDown={(e) => { e.preventDefault(); setShowAi(v => !v) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >✦ Ask AI</button>
      </div>

      {showAi && (
        <AiAssistPopover editor={editor} onClose={() => setShowAi(false)} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/preview/RichTextToolbar.jsx
git commit -m "feat: add RichTextToolbar with formatting buttons and Ask AI"
```

---

## Task 5: Create AiAssistPopover component

**Files:**
- Create: `frontend/src/components/preview/AiAssistPopover.jsx`

- [ ] **Step 1: Create the component**

`frontend/src/components/preview/AiAssistPopover.jsx`:
```jsx
import { useState } from 'react'
import axios from 'axios'

const ACTIONS = [
  { key: 'improve', label: '✨ Improve' },
  { key: 'concise', label: '✂️ Make concise' },
  { key: 'grammar', label: '✓ Fix grammar' },
]

export default function AiAssistPopover({ editor, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = async (action) => {
    const text = editor.getText().trim()
    if (!text) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.post('http://localhost:3001/api/ai/assist', { text, action })
      editor.commands.setContent(`<p>${data.result}</p>`)
      onClose()
    } catch {
      setError("Couldn't reach AI — try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      background: '#1e293b',
      borderRadius: '10px',
      padding: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      zIndex: 101,
      minWidth: '180px',
    }}>
      <div style={{
        fontSize: '10px',
        color: '#7c3aed',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '.08em',
        marginBottom: '8px',
      }}>✦ AI Assistant</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ACTIONS.map(({ key, label }) => (
          <button
            key={key}
            onMouseDown={(e) => { e.preventDefault(); run(key) }}
            disabled={loading}
            style={{
              background: '#334155',
              border: 'none',
              color: loading ? '#64748b' : '#cbd5e1',
              borderRadius: '6px',
              padding: '7px 12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >{loading ? '…' : label}</button>
        ))}
      </div>

      {error && (
        <div style={{ fontSize: '11px', color: '#f87171', marginTop: '8px' }}>{error}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/preview/AiAssistPopover.jsx
git commit -m "feat: add AiAssistPopover with Improve / Make concise / Fix grammar"
```

---

## Task 6: Update all five templates

All five templates have the same three field types to swap. The pattern is identical across `ModernTemplate`, `ClassicTemplate`, `MinimalTemplate`, `ExecutiveTemplate`, and `CreativeTemplate`.

**Files:**
- Modify: all five files in `frontend/src/components/preview/templates/`

- [ ] **Step 1: Update ModernTemplate.jsx**

Open `frontend/src/components/preview/templates/ModernTemplate.jsx`.

Change the import line at the top:
```jsx
// Before
import InlineEditor from '../InlineEditor'

// After — add RichTextEditor alongside InlineEditor (InlineEditor still used for other fields)
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
```

Swap **personal.summary** (line ~92):
```jsx
// Before
<InlineEditor path="personal.summary" value={personal.summary} multiline>{personal.summary}</InlineEditor>

// After
<RichTextEditor path="personal.summary" value={personal.summary} />
```

Swap **experience bullets** (line ~122):
```jsx
// Before
• <InlineEditor path={`experience.${i}.bullets.${bi}`} value={b}>{b}</InlineEditor>

// After
• <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
```

Swap **projects description** (line ~206):
```jsx
// Before
<InlineEditor path={`projects.${i}.description`} value={proj.description} multiline>{proj.description}</InlineEditor>

// After
<RichTextEditor path={`projects.${i}.description`} value={proj.description} />
```

- [ ] **Step 2: Update ClassicTemplate.jsx**

Open `frontend/src/components/preview/templates/ClassicTemplate.jsx`.

Add import:
```jsx
import RichTextEditor from '../RichTextEditor'
```

Make the same three swaps (same pattern as ModernTemplate — search for `personal.summary`, `bullets.${bi}`, `projects.${i}.description`):

```jsx
// personal.summary
<RichTextEditor path="personal.summary" value={personal.summary} />

// experience bullets
• <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />

// projects description
<RichTextEditor path={`projects.${i}.description`} value={proj.description} />
```

- [ ] **Step 3: Update MinimalTemplate.jsx**

Open `frontend/src/components/preview/templates/MinimalTemplate.jsx`.

Add import:
```jsx
import RichTextEditor from '../RichTextEditor'
```

Make the same three swaps (same pattern).

- [ ] **Step 4: Update ExecutiveTemplate.jsx**

Open `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`.

Add import:
```jsx
import RichTextEditor from '../RichTextEditor'
```

Make the same three swaps (same pattern).

- [ ] **Step 5: Update CreativeTemplate.jsx**

Open `frontend/src/components/preview/templates/CreativeTemplate.jsx`.

Add import:
```jsx
import RichTextEditor from '../RichTextEditor'
```

Make the same three swaps (same pattern).

- [ ] **Step 6: Commit all template changes**

```bash
git add frontend/src/components/preview/templates/
git commit -m "feat: replace InlineEditor with RichTextEditor on summary, bullets, and project descriptions"
```

---

## Task 7: Create backend AI assistant service

**Files:**
- Create: `backend/src/services/ai/resumeAssistant.js`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p backend/src/services/ai
```

`backend/src/services/ai/resumeAssistant.js`:
```js
const fetch = require('node-fetch')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
const TIMEOUT_MS = 30_000

const SYSTEM_PROMPTS = {
  improve: 'Rewrite this resume bullet or summary to be more impactful and professional. Use strong action verbs. Return only the improved text, no explanation.',
  concise: 'Shorten this to one tight, punchy sentence. Keep the key achievement. Return only the result, no explanation.',
  grammar: 'Fix any grammar, spelling, or punctuation errors. Return only the corrected text, no explanation.',
}

class AiUnavailableError extends Error {
  constructor(msg) { super(msg); this.name = 'AiUnavailableError' }
}

async function assistWithGroq(text, action) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[action] },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: controller.signal,
    })
    if (!res.ok) throw new AiUnavailableError(`Groq responded with ${res.status}`)
    const data = await res.json()
    return data.choices[0].message.content.trim()
  } catch (err) {
    if (err.name === 'AiUnavailableError') throw err
    throw new AiUnavailableError(err.message)
  } finally {
    clearTimeout(timer)
  }
}

async function assistWithOllama(text, action) {
  const axios = require('axios')
  const prompt = `${SYSTEM_PROMPTS[action]}\n\n${text}`
  const res = await axios.post(
    `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`,
    { model: process.env.OLLAMA_MODEL || 'llama3', prompt, stream: false },
    { timeout: TIMEOUT_MS }
  )
  return res.data.response.trim()
}

async function assist(text, action) {
  if (!SYSTEM_PROMPTS[action]) throw new Error(`Unknown action: ${action}`)
  try {
    return await assistWithGroq(text, action)
  } catch {
    return await assistWithOllama(text, action)
  }
}

module.exports = { assist }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/ai/resumeAssistant.js
git commit -m "feat: add resumeAssistant service with Groq + Ollama fallback"
```

---

## Task 8: Create assist route and wire into index.js

**Files:**
- Create: `backend/src/routes/assist.js`
- Modify: `backend/src/index.js`

- [ ] **Step 1: Create the route file**

`backend/src/routes/assist.js`:
```js
const express = require('express')
const { assist } = require('../services/ai/resumeAssistant')

const router = express.Router()

router.post('/', async (req, res) => {
  const { text, action } = req.body
  if (!text || !action) {
    return res.status(400).json({ error: 'text and action are required' })
  }
  try {
    const result = await assist(text, action)
    res.json({ result })
  } catch {
    res.status(503).json({ error: 'AI service unavailable' })
  }
})

module.exports = router
```

- [ ] **Step 2: Mount the router in index.js**

Open `backend/src/index.js`. Add after the existing require statements:
```js
const assistRouter = require('./routes/assist')
```

Add after the existing `app.use('/api/export', exportRouter)` line:
```js
app.use('/api/ai/assist', assistRouter)
```

The full relevant section of `index.js` should look like:
```js
const uploadRouter = require('./routes/upload')
const exportRouter = require('./routes/export')
const assistRouter = require('./routes/assist')

// ...

app.use('/api/upload', uploadRouter)
app.use('/api/export', exportRouter)
app.use('/api/ai/assist', assistRouter)
app.use('/api/agents', (req, res) => res.status(501).json({ error: 'Agents not yet implemented', code: 'NOT_IMPLEMENTED' }))
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/assist.js backend/src/index.js
git commit -m "feat: add POST /api/ai/assist endpoint"
```

---

## Task 9: Smoke test end-to-end

- [ ] **Step 1: Start both servers**

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

- [ ] **Step 2: Open the preview page**

Navigate to `http://localhost:5173`, upload or load a resume, go to the Preview page.

- [ ] **Step 3: Test rich text editing**

Click into a bullet point. Verify:
- Blue left-border focus indicator appears
- Floating toolbar appears above the field with B / I / U / 🔗 / ✦ Ask AI buttons
- Clicking **B** toggles bold on selected text
- Clicking **I** toggles italic
- Clicking **U** toggles underline
- Clicking **🔗** prompts for a URL and wraps selected text in a link
- Clicking outside saves the HTML to the store (check React DevTools or re-open — formatting persists)

- [ ] **Step 4: Test the summary field**

Click into the Professional Summary. Verify toolbar appears and formatting works.

- [ ] **Step 5: Test AI assistance**

Click into a bullet, click **✦ Ask AI**, click **✨ Improve**. Verify:
- Spinner/disabled state shows while loading
- Content is replaced on success
- Popover closes automatically

- [ ] **Step 6: Test AI error state**

Stop the backend server, then click **✦ Ask AI** → **✨ Improve**. Verify the error message "Couldn't reach AI — try again." appears in the popover.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: post-integration cleanup" --allow-empty
```
