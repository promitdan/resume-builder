# Resume Builder v2 — UI Redesign & Parsing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix inaccurate resume parsing for real-world two-column PDFs, fix post-upload navigation (→ `/preview`), and redesign the entire UI with a professional Clean Light aesthetic.

**Architecture:** Backend `contentMapper.js` gets targeted parsing fixes. Frontend gets a full visual overhaul: redesigned landing page, left-sidebar wizard layout, polished form components, and an improved preview page. No new dependencies needed.

**Tech Stack:** React + Vite + Zustand (frontend) · Express + Node (backend) · Vitest + RTL (frontend tests) · Jest (backend tests)

**Spec:** `docs/superpowers/specs/2026-04-23-ui-redesign-parsing-fix.md`

---

## File Map

```
Modified (backend):
  backend/src/services/parser/contentMapper.js   — parsing logic fixes
  backend/src/__tests__/contentMapper.test.js    — new test cases

Modified (frontend):
  frontend/index.html                             — add Inter font import
  frontend/src/components/landing/UploadDropzone.jsx   — nav fix + style
  frontend/src/pages/LandingPage.jsx              — full redesign
  frontend/src/components/landing/HeroCTA.jsx    — full redesign
  frontend/src/components/wizard/WizardLayout.jsx — left sidebar stepper
  frontend/src/pages/BuildPage.jsx               — pass onStepClick handler
  frontend/src/pages/PreviewPage.jsx             — Edit button + layout
  frontend/src/components/wizard/PersonalInfoStep.jsx  — form polish
  frontend/src/components/wizard/ExperienceStep.jsx    — form polish
  frontend/src/components/wizard/EducationStep.jsx     — form polish
  frontend/src/components/wizard/SkillsStep.jsx        — form polish
  frontend/src/components/wizard/OptionalSectionsStep.jsx — form polish
  frontend/src/components/wizard/TemplatePickerStep.jsx   — form polish
  frontend/src/components/shared/DownloadButtons.jsx   — style polish
  frontend/src/components/preview/TemplateSwitcher.jsx — style polish
  frontend/src/__tests__/WizardLayout.test.jsx   — update for new API
```

---

## Task 1: Fix contentMapper — parsing improvements

**Files:**
- Modify: `backend/src/services/parser/contentMapper.js`
- Modify: `backend/src/__tests__/contentMapper.test.js`

The existing test suite has a basic sample. Add targeted tests for the real-world patterns that were failing, then fix the implementation to pass them.

- [ ] **Step 1: Add failing tests for numbered bullets and Company/Location/Role format**

Append to `backend/src/__tests__/contentMapper.test.js` (after the existing `describe` block):

```js
describe('mapToContent — real-world patterns', () => {
  test('parses numbered bullet points (1. 2. 3.)', () => {
    const text = `
Jane Doe
jane@example.com

EXPERIENCE
Acme Corp, New York — Senior Engineer
Jan 2022 - Present
1. Led a team of 5 engineers
2. Reduced deployment time by 40%
`
    const content = mapToContent(text)
    expect(content.experience[0].bullets.length).toBeGreaterThanOrEqual(2)
    expect(content.experience[0].bullets[0]).toMatch(/Led a team/)
  })

  test('parses Company, Location — Role format correctly', () => {
    const text = `
Jane Doe
jane@example.com

EXPERIENCE
Nutanix, Bengaluru — Member of Technical Staff-4
November 2020 - Present
1. Built networking interfaces
`
    const content = mapToContent(text)
    const exp = content.experience[0]
    expect(exp.company).toBe('Nutanix')
    expect(exp.location).toBe('Bengaluru')
    expect(exp.role).toBe('Member of Technical Staff-4')
  })

  test('detects EXTRA-CURRICULARS section', () => {
    const text = `
Jane Doe
jane@example.com

SKILLS
JavaScript, React

EXTRA-CURRICULARS
Music Production
`
    const content = mapToContent(text)
    expect(content.sectionOrder).toContain('custom')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd backend && npm test -- --testPathPattern=contentMapper
```

Expected: FAIL on the 3 new tests.

- [ ] **Step 3: Fix SECTION_PATTERNS — add EXTRA-CURRICULARS**

In `backend/src/services/parser/contentMapper.js`, replace the `custom` entry in `SECTION_PATTERNS`:

```js
{ key: 'custom', regex: /^(volunteer|publications?|references?|interests?|hobbies|extra.curriculars?)/i },
```

- [ ] **Step 4: Fix bullet detection — add numbered list support**

In `parseExperience`, replace the bullet detection line:

```js
// OLD:
if (trimmed.match(/^[•\-–*]\s+/) && current) {
  current.bullets.push(trimmed.replace(/^[•\-–*]\s+/, ''))
  continue
}

// NEW:
if (trimmed.match(/^([•\-–*]|\d+\.)\s+/) && current) {
  current.bullets.push(trimmed.replace(/^([•\-–*]|\d+\.)\s+/, ''))
  continue
}
```

- [ ] **Step 5: Fix experience entry parsing — handle Company, Location — Role format**

Replace the entire experience entry heuristic block in `parseExperience` (the `if (/—|–|-|@|\bat\b/.test...` block) with:

```js
if (/[—–]/.test(trimmed) && trimmed.length < 120 && !trimmed.startsWith('•') && !/^\d+\./.test(trimmed)) {
  const parts = trimmed.split(/\s*[—–]\s*/)
  const left = (parts[0] || '').trim()
  const right = parts.slice(1).join(' — ').trim()

  let company = '', location = '', role = ''
  if (/,/.test(left)) {
    // "Company, City — Role" format
    const commaIdx = left.indexOf(',')
    company  = left.slice(0, commaIdx).trim()
    location = left.slice(commaIdx + 1).trim()
    role     = right
  } else {
    // "Role — Company" format (fallback)
    role    = left
    company = right
  }

  current = { id: uuid(), role, company, location, startDate: '', endDate: '', current: false, bullets: [] }
  entries.push(current)
}
```

Also remove the dangling `else if` that created empty entries — replace the full body of `parseExperience` with this:

```js
function parseExperience(lines) {
  const entries = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dateMatch = trimmed.match(DATE_RE)
    if (dateMatch) {
      if (current) {
        current.startDate = dateMatch[1] || ''
        current.endDate   = dateMatch[4] || ''
        current.current   = /present|current/i.test(dateMatch[4] || '')
      }
      continue
    }

    if (trimmed.match(/^([•\-–*]|\d+\.)\s+/) && current) {
      current.bullets.push(trimmed.replace(/^([•\-–*]|\d+\.)\s+/, ''))
      continue
    }

    if (/[—–]/.test(trimmed) && trimmed.length < 120 && !/^\d+\./.test(trimmed)) {
      const parts = trimmed.split(/\s*[—–]\s*/)
      const left  = (parts[0] || '').trim()
      const right = parts.slice(1).join(' — ').trim()

      let company = '', location = '', role = ''
      if (/,/.test(left)) {
        const commaIdx = left.indexOf(',')
        company  = left.slice(0, commaIdx).trim()
        location = left.slice(commaIdx + 1).trim()
        role     = right
      } else {
        role    = left
        company = right
      }

      current = { id: uuid(), role, company, location, startDate: '', endDate: '', current: false, bullets: [] }
      entries.push(current)
    }
  }

  return entries
}
```

- [ ] **Step 6: Run tests — verify all pass**

```bash
cd backend && npm test -- --testPathPattern=contentMapper
```

Expected: All tests PASS (existing 10 + 3 new = 13).

- [ ] **Step 7: Commit**

```bash
cd backend && git add src/services/parser/contentMapper.js src/__tests__/contentMapper.test.js
git commit -m "fix: improve contentMapper — numbered bullets, Company/Location/Role format, extra-curriculars"
```

---

## Task 2: Fix post-upload navigation + add Inter font

**Files:**
- Modify: `frontend/src/components/landing/UploadDropzone.jsx`
- Modify: `frontend/index.html`

- [ ] **Step 1: Change navigate target in UploadDropzone**

In `frontend/src/components/landing/UploadDropzone.jsx`, line 28, change:

```js
// OLD:
navigate('/build')

// NEW:
navigate('/preview')
```

- [ ] **Step 2: Add Inter font to index.html**

In `frontend/index.html`, add inside `<head>` before the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  input, textarea, button, select { font-family: inherit; }
</style>
```

- [ ] **Step 3: Run frontend tests — verify still passing**

```bash
cd frontend && npm test
```

Expected: All 45 tests PASS (LandingPage tests still pass since upload dropzone behavior is same, just different nav target).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/landing/UploadDropzone.jsx frontend/index.html
git commit -m "fix: navigate to /preview after upload; add Inter font globally"
```

---

## Task 3: Landing page redesign

**Files:**
- Modify: `frontend/src/pages/LandingPage.jsx`
- Modify: `frontend/src/components/landing/HeroCTA.jsx`
- Modify: `frontend/src/components/landing/UploadDropzone.jsx`
- Modify: `frontend/src/__tests__/LandingPage.test.jsx`

- [ ] **Step 1: Rewrite LandingPage.jsx**

Replace the entire file contents with:

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import UploadDropzone from '../components/landing/UploadDropzone'

export default function LandingPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.3px' }}>
          Resume<span style={{ color: '#3b82f6' }}>Builder</span>
        </span>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-block', background: '#eff6ff', color: '#3b82f6', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', marginBottom: '24px', letterSpacing: '0.5px' }}>
            FREE · NO SIGN-UP REQUIRED
          </div>

          {/* Headline */}
          <h1 style={{ margin: '0 0 16px', fontSize: '40px', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Build a resume that<br />
            <span style={{ color: '#3b82f6' }}>gets you hired</span>
          </h1>

          {/* Subtitle */}
          <p style={{ margin: '0 0 36px', fontSize: '16px', color: '#64748b', lineHeight: 1.6 }}>
            Guided wizard, 5 professional templates,<br />
            PDF &amp; DOCX export. Done in minutes.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <Link to="/build" style={{ textDecoration: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '15px', padding: '12px 24px', borderRadius: '8px', display: 'inline-block', transition: 'background 0.15s' }}
              onMouseEnter={e => e.target.style.background='#2563eb'}
              onMouseLeave={e => e.target.style.background='#3b82f6'}>
              Start from scratch →
            </Link>
            <button
              onClick={() => setShowUpload(v => !v)}
              style={{ background: '#fff', color: '#334155', fontWeight: 600, fontSize: '15px', padding: '12px 24px', borderRadius: '8px', border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.target.style.borderColor='#3b82f6'; e.target.style.color='#3b82f6' }}
              onMouseLeave={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.color='#334155' }}>
              ⬆ Upload resume
            </button>
          </div>

          {/* Upload dropzone — revealed inline */}
          {showUpload && (
            <div style={{ marginTop: '8px' }}>
              <UploadDropzone />
            </div>
          )}
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ borderTop: '1px solid #e2e8f0', background: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'center', gap: '32px', flexShrink: 0 }}>
        {['No account needed', '5 professional templates', 'Free PDF & DOCX export'].map(t => (
          <span key={t} style={{ fontSize: '13px', color: '#64748b' }}>
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>✓</span> {t}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite HeroCTA.jsx**

`HeroCTA` is no longer needed as a separate component — the hero is inline in `LandingPage.jsx`. Replace its content with a simple re-export stub so existing imports don't break:

```jsx
export default function HeroCTA() {
  return null
}
```

- [ ] **Step 3: Restyle UploadDropzone.jsx**

Replace the dropzone JSX return value (keep all the logic, only change the returned JSX):

```jsx
return (
  <div
    data-testid="upload-dropzone"
    onClick={() => !loading && inputRef.current?.click()}
    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
    onDragLeave={() => setDragging(false)}
    onDrop={onDrop}
    style={{
      border: `2px dashed ${dragging ? '#3b82f6' : '#bfdbfe'}`,
      borderRadius: '10px',
      padding: '32px 24px',
      background: dragging ? '#dbeafe' : '#eff6ff',
      cursor: loading ? 'wait' : 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
    }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
    <p style={{ margin: '0 0 4px', color: '#3b82f6', fontWeight: 600, fontSize: '15px' }}>
      {loading ? 'Parsing your resume…' : 'Drop your PDF or DOCX here'}
    </p>
    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>or click to browse</p>
    {error && (
      <p style={{ margin: '12px 0 0', color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>{error}</p>
    )}
    <input
      ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
      onChange={(e) => handleFile(e.target.files[0])}
    />
  </div>
)
```

- [ ] **Step 4: Update LandingPage tests**

Replace `frontend/src/__tests__/LandingPage.test.jsx` with:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

vi.mock('../components/landing/UploadDropzone', () => ({
  default: () => <div data-testid="upload-dropzone">Upload Zone</div>
}))

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>)
}

test('renders Start from scratch button', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i)).toBeInTheDocument()
})

test('renders Upload resume button', () => {
  renderLanding()
  expect(screen.getByText(/upload resume/i)).toBeInTheDocument()
})

test('shows upload dropzone when Upload resume is clicked', () => {
  renderLanding()
  expect(screen.queryByTestId('upload-dropzone')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText(/upload resume/i))
  expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
})

test('Start from scratch navigates to /build', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i).closest('a')).toHaveAttribute('href', '/build')
})
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern=LandingPage
```

Expected: 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/LandingPage.jsx frontend/src/components/landing/HeroCTA.jsx frontend/src/components/landing/UploadDropzone.jsx frontend/src/__tests__/LandingPage.test.jsx
git commit -m "feat: redesign landing page — focused hero, inline upload reveal"
```

---

## Task 4: WizardLayout — left sidebar stepper

**Files:**
- Modify: `frontend/src/components/wizard/WizardLayout.jsx`
- Modify: `frontend/src/pages/BuildPage.jsx`
- Modify: `frontend/src/__tests__/WizardLayout.test.jsx`

- [ ] **Step 1: Rewrite WizardLayout.jsx**

The new API: `{ steps, currentStep, onNext, onStepClick }` — `onStepClick(index)` is called when a completed step in the sidebar is clicked. `onBack` is removed (sidebar handles back by clicking an earlier step).

Replace entire file:

```jsx
export default function WizardLayout({ steps = [], currentStep = 0, onNext, onStepClick }) {
  const step   = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  if (!step) return <div>Invalid step</div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.3px' }}>
            Resume<span style={{ color: '#3b82f6' }}>Builder</span>
          </span>
        </div>

        {/* Steps */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {steps.map((s, i) => {
            const done    = i < currentStep
            const active  = i === currentStep
            const canClick = done

            return (
              <div
                key={i}
                onClick={() => canClick && onStepClick && onStepClick(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '7px', marginBottom: '2px',
                  cursor: canClick ? 'pointer' : 'default',
                  background: active ? '#eff6ff' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (canClick) e.currentTarget.style.background = '#f0f9ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? '#eff6ff' : 'transparent' }}
              >
                {/* Step circle */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  background: done ? '#3b82f6' : 'transparent',
                  border: done ? 'none' : `2px solid ${active ? '#3b82f6' : '#cbd5e1'}`,
                  color: done ? '#fff' : active ? '#3b82f6' : '#94a3b8',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {/* Step label */}
                <span style={{
                  fontSize: '13px', fontWeight: active ? 600 : 500,
                  color: done ? '#334155' : active ? '#3b82f6' : '#94a3b8',
                  lineHeight: 1.3,
                }}>
                  {s.title}
                </span>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '2px', letterSpacing: '0.3px' }}>
              STEP {currentStep + 1} OF {steps.length}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{step.title}</h2>
          </div>
          {/* Progress bar */}
          <div style={{ width: '120px', height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <step.component />
        </div>

        {/* Bottom nav */}
        <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button
            onClick={onNext}
            style={{ background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '10px 28px', borderRadius: '7px', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.background='#2563eb'}
            onMouseLeave={e => e.target.style.background='#3b82f6'}
          >
            {isLast ? 'Finish ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update WizardLayout tests**

Replace `frontend/src/__tests__/WizardLayout.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import WizardLayout from '../components/wizard/WizardLayout'

const mockSteps = [
  { title: 'Info',  component: () => <div>Info Step</div> },
  { title: 'Work',  component: () => <div>Work Step</div> },
  { title: 'Done',  component: () => <div>Done Step</div> }
]

test('renders current step component', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} />)
  expect(screen.getByText('Info Step')).toBeInTheDocument()
})

test('shows step indicator text', () => {
  render(<WizardLayout steps={mockSteps} currentStep={1} onNext={() => {}} />)
  expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
})

test('Next button calls onNext', () => {
  const onNext = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={onNext} />)
  fireEvent.click(screen.getByText(/next/i))
  expect(onNext).toHaveBeenCalled()
})

test('Next button shows Finish on last step', () => {
  render(<WizardLayout steps={mockSteps} currentStep={2} onNext={() => {}} />)
  expect(screen.getByText(/finish/i)).toBeInTheDocument()
})

test('clicking a completed step calls onStepClick with its index', () => {
  const onStepClick = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={2} onNext={() => {}} onStepClick={onStepClick} />)
  // Step 0 (Info) is completed when currentStep=2 — click its sidebar item
  fireEvent.click(screen.getByText('Info'))
  expect(onStepClick).toHaveBeenCalledWith(0)
})

test('clicking a future step does not call onStepClick', () => {
  const onStepClick = vi.fn()
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} onStepClick={onStepClick} />)
  // Step 2 (Done) is in the future when currentStep=0
  fireEvent.click(screen.getByText('Done'))
  expect(onStepClick).not.toHaveBeenCalled()
})

test('all step titles rendered in sidebar', () => {
  render(<WizardLayout steps={mockSteps} currentStep={0} onNext={() => {}} />)
  expect(screen.getByText('Info')).toBeInTheDocument()
  expect(screen.getByText('Work')).toBeInTheDocument()
  expect(screen.getByText('Done')).toBeInTheDocument()
})
```

- [ ] **Step 3: Update BuildPage.jsx to pass onStepClick**

Replace `frontend/src/pages/BuildPage.jsx`:

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
  { title: 'Personal Info',      component: PersonalInfoStep     },
  { title: 'Work Experience',    component: ExperienceStep       },
  { title: 'Education',          component: EducationStep        },
  { title: 'Skills',             component: SkillsStep           },
  { title: 'Optional Sections',  component: OptionalSectionsStep },
  { title: 'Choose Template',    component: TemplatePickerStep   },
  { title: 'Preview',            component: PreviewStep          },
]

export default function BuildPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  function handleNext() {
    if (currentStep === STEPS.length - 1) navigate('/preview')
    else setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function handleStepClick(index) {
    if (index < currentStep) setCurrentStep(index)
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onStepClick={handleStepClick}
    />
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd frontend && npm test -- --testPathPattern="WizardLayout|App"
```

Expected: All WizardLayout tests PASS (7 tests). App tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wizard/WizardLayout.jsx frontend/src/__tests__/WizardLayout.test.jsx frontend/src/pages/BuildPage.jsx
git commit -m "feat: redesign WizardLayout as left sidebar stepper with jump navigation"
```

---

## Task 5: PreviewPage redesign

**Files:**
- Modify: `frontend/src/pages/PreviewPage.jsx`
- Modify: `frontend/src/components/preview/TemplateSwitcher.jsx`
- Modify: `frontend/src/components/shared/DownloadButtons.jsx`

- [ ] **Step 1: Rewrite PreviewPage.jsx**

```jsx
import { useNavigate } from 'react-router-dom'
import { useResumeStore } from '../store/useResumeStore'
import ResumePreview from '../components/preview/ResumePreview'
import TemplateSwitcher from '../components/preview/TemplateSwitcher'
import DownloadButtons from '../components/shared/DownloadButtons'

export default function PreviewPage() {
  const content    = useResumeStore(s => s.content)
  const templateId = useResumeStore(s => s.templateId)
  const navigate   = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.3px' }}>
          Resume<span style={{ color: '#3b82f6' }}>Builder</span>
        </span>
        <button
          onClick={() => navigate('/build')}
          style={{ background: 'none', border: '1.5px solid #e2e8f0', color: '#334155', fontWeight: 600, fontSize: '13px', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back to Edit
        </button>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: '24px', padding: '28px 32px', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Resume preview — dominant */}
        <div style={{ flex: 1, overflow: 'auto', background: '#e2e8f0', borderRadius: '10px', padding: '24px', minHeight: '500px' }}>
          <ResumePreview content={content} templateId={templateId} />
        </div>

        {/* Right sidebar */}
        <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Edit Resume */}
          <button
            onClick={() => navigate('/build')}
            style={{ width: '100%', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '11px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onMouseEnter={e => e.currentTarget.style.background='#2563eb'}
            onMouseLeave={e => e.currentTarget.style.background='#3b82f6'}
          >
            ✏ Edit Resume
          </button>

          {/* Template switcher card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Template</h3>
            <TemplateSwitcher />
          </div>

          {/* Download card */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Download</h3>
            <DownloadButtons />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Restyle TemplateSwitcher.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = [
  { id: 'classic',   label: 'Classic'   },
  { id: 'modern',    label: 'Modern'    },
  { id: 'minimal',   label: 'Minimal'   },
  { id: 'executive', label: 'Executive' },
  { id: 'creative',  label: 'Creative'  },
]

export default function TemplateSwitcher() {
  const templateId    = useResumeStore(s => s.templateId)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {TEMPLATES.map(({ id, label }) => {
        const active = templateId === id
        return (
          <button key={id} onClick={() => setTemplateId(id)}
            style={{
              padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
              background: active ? '#eff6ff' : '#fff',
              border: `1.5px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
              color: active ? '#3b82f6' : '#334155',
            }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Restyle DownloadButtons.jsx**

```jsx
import { useState } from 'react'
import axios from 'axios'
import { useResumeStore } from '../../store/useResumeStore'

export default function DownloadButtons() {
  const content    = useResumeStore(s => s.content)
  const templateId = useResumeStore(s => s.templateId)
  const [loading, setLoading] = useState(null)
  const [error, setError]     = useState('')

  async function download(type) {
    setLoading(type)
    setError('')
    try {
      const { data } = await axios.post(`/api/export/${type}`, { content, templateId }, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `resume.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(`Failed to export ${type.toUpperCase()}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const btn = (type, label, bg, hover) => (
    <button onClick={() => download(type)} disabled={!!loading}
      style={{ width: '100%', background: loading === type ? '#94a3b8' : bg, color: '#fff', fontWeight: 600, fontSize: '13px', padding: '10px', borderRadius: '6px', border: 'none', cursor: loading ? 'wait' : 'pointer', marginBottom: '8px', transition: 'background 0.15s' }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = hover }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading === type ? '#94a3b8' : bg }}>
      {loading === type ? 'Generating…' : label}
    </button>
  )

  return (
    <div>
      {btn('pdf',  '⬇ Download PDF',  '#3b82f6', '#2563eb')}
      {btn('docx', '⬇ Download DOCX', '#0369a1', '#075985')}
      {error && <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '12px' }}>{error}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Run all frontend tests**

```bash
cd frontend && npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/PreviewPage.jsx frontend/src/components/preview/TemplateSwitcher.jsx frontend/src/components/shared/DownloadButtons.jsx
git commit -m "feat: redesign PreviewPage with Edit Resume button and polished sidebar"
```

---

## Task 6: Wizard step forms polish

**Files:**
- Modify: `frontend/src/components/wizard/PersonalInfoStep.jsx`
- Modify: `frontend/src/components/wizard/ExperienceStep.jsx`
- Modify: `frontend/src/components/wizard/EducationStep.jsx`
- Modify: `frontend/src/components/wizard/SkillsStep.jsx`
- Modify: `frontend/src/components/wizard/OptionalSectionsStep.jsx`
- Modify: `frontend/src/components/wizard/TemplatePickerStep.jsx`

All six steps share the same card + form styling. Define the style constants at the top of each file and apply them consistently.

Shared style constants to add at the top of each step file:

```js
const card    = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)', maxWidth: '680px' }
const input   = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '15px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const label   = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }
const field   = { marginBottom: '18px' }
const addBtn  = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn   = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '16px', background: '#fff' }
```

- [ ] **Step 1: Rewrite PersonalInfoStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const card  = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }
const inp   = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '15px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl   = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }
const fld   = { marginBottom: '18px' }

function Field({ label: labelText, name, value, onChange, type = 'text', placeholder, span }) {
  return (
    <div style={{ ...fld, ...(span ? { gridColumn: span } : {}) }}>
      <label style={lbl}>{labelText}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={inp}
        onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px #eff6ff' }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }} />
    </div>
  )
}

export default function PersonalInfoStep() {
  const personal       = useResumeStore(s => s.content.personal)
  const updatePersonal = useResumeStore(s => s.updatePersonal)
  const h = e => updatePersonal({ [e.target.name]: e.target.value })

  return (
    <div style={card}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>This information appears at the top of your resume.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Full Name *"   name="name"     value={personal.name}     onChange={h} placeholder="Jane Doe"             span="1 / -1" />
        <Field label="Job Title"     name="title"    value={personal.title}    onChange={h} placeholder="Software Engineer" />
        <Field label="Email"         name="email"    value={personal.email}    onChange={h} type="email" placeholder="jane@example.com" />
        <Field label="Phone"         name="phone"    value={personal.phone}    onChange={h} type="tel"   placeholder="+1 (555) 123-4567" />
        <Field label="Location"      name="location" value={personal.location} onChange={h} placeholder="New York, NY" />
        <Field label="LinkedIn URL"  name="linkedin" value={personal.linkedin} onChange={h} type="url"   placeholder="linkedin.com/in/jane" />
        <Field label="Website"       name="website"  value={personal.website}  onChange={h} type="url"   placeholder="janedoe.com"           span="1 / -1" />
      </div>
      <div style={fld}>
        <label style={lbl}>Professional Summary</label>
        <textarea name="summary" value={personal.summary} onChange={h}
          placeholder="Brief summary of your background, skills, and goals…"
          rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
          onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }}
          onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite ExperienceStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const card    = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }
const inp     = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '14px' }
const addBtn  = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn   = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }

const focusStyle = e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

export default function ExperienceStep() {
  const experience       = useResumeStore(s => s.content.experience)
  const addExperience    = useResumeStore(s => s.addExperience)
  const updateExperience = useResumeStore(s => s.updateExperience)
  const removeExperience = useResumeStore(s => s.removeExperience)

  const fi = (id, name, value, placeholder) => (
    <input style={inp} placeholder={placeholder} value={value}
      onChange={e => updateExperience(id, { [name]: e.target.value })}
      onFocus={focusStyle} onBlur={blurStyle} />
  )

  const handleBullet = (id, idx, value) => {
    const exp = experience.find(e => e.id === id)
    const bullets = [...(exp?.bullets || [])]
    bullets[idx] = value
    updateExperience(id, { bullets })
  }

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Add your work history, most recent first.</p>
      {experience.map((exp, i) => (
        <div key={exp.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Position {i + 1}</span>
            <button style={rmBtn} onClick={() => removeExperience(exp.id)}>Remove</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            {fi(exp.id, 'role',     exp.role,     'Job Title / Role')}
            {fi(exp.id, 'company',  exp.company,  'Company')}
            {fi(exp.id, 'location', exp.location, 'Location (optional)')}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Start (e.g. Jan 2022)" value={exp.startDate}
                onChange={e => updateExperience(exp.id, { startDate: e.target.value })} onFocus={focusStyle} onBlur={blurStyle} />
              <input style={{ ...inp, flex: 1 }} placeholder="End or Present"        value={exp.endDate}
                onChange={e => updateExperience(exp.id, { endDate: e.target.value })}   onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>
          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Bullet points</div>
            {(exp.bullets || []).map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <input style={{ ...inp, flex: 1, marginBottom: 0 }} placeholder={`Bullet ${idx + 1}`} value={b}
                  onChange={e => handleBullet(exp.id, idx, e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                <button onClick={() => updateExperience(exp.id, { bullets: exp.bullets.filter((_, j) => j !== idx) })}
                  style={{ ...rmBtn, fontSize: '16px', lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: 0 }}>
              + Add bullet
            </button>
          </div>
        </div>
      ))}
      <button style={addBtn} onClick={addExperience}>+ Add Work Experience</button>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite EducationStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const card      = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }
const inp       = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '14px' }
const addBtn    = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn     = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }

const focusStyle = e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

export default function EducationStep() {
  const education       = useResumeStore(s => s.content.education)
  const addEducation    = useResumeStore(s => s.addEducation)
  const updateEducation = useResumeStore(s => s.updateEducation)
  const removeEducation = useResumeStore(s => s.removeEducation)

  const fi = (id, name, value, placeholder) => (
    <input style={inp} placeholder={placeholder} value={value}
      onChange={e => updateEducation(id, { [name]: e.target.value })}
      onFocus={focusStyle} onBlur={blurStyle} />
  )

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Add your degrees and certifications, most recent first.</p>
      {education.map((edu, i) => (
        <div key={edu.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Entry {i + 1}</span>
            <button style={rmBtn} onClick={() => removeEducation(edu.id)}>Remove</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            {fi(edu.id, 'institution', edu.institution, 'Institution')}
            {fi(edu.id, 'degree',      edu.degree,      'Degree (e.g. B.Tech)')}
            {fi(edu.id, 'field',       edu.field,       'Field of Study')}
            {fi(edu.id, 'gpa',         edu.gpa,         'GPA / Grade (optional)')}
            <input style={{ ...inp, flex: 1 }} placeholder="Start Year" value={edu.startDate}
              onChange={e => updateEducation(edu.id, { startDate: e.target.value })} onFocus={focusStyle} onBlur={blurStyle} />
            <input style={{ ...inp, flex: 1 }} placeholder="End Year"   value={edu.endDate}
              onChange={e => updateEducation(edu.id, { endDate: e.target.value })}   onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
      ))}
      <button style={addBtn} onClick={addEducation}>+ Add Education</button>
    </div>
  )
}
```

- [ ] **Step 4: Rewrite SkillsStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'
import { v4 as uuid } from 'uuid'

const card      = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }
const inp       = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '14px' }
const addBtn    = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn     = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }
const focusStyle = e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

export default function SkillsStep() {
  const skills       = useResumeStore(s => s.content.skills)
  const updateSkills = useResumeStore(s => s.updateSkills)

  const add     = ()       => updateSkills([...skills, { id: uuid(), category: '', items: [] }])
  const remove  = id       => updateSkills(skills.filter(s => s.id !== id))
  const update  = (id, k, v) => updateSkills(skills.map(s => s.id === id ? { ...s, [k]: v } : s))
  const setItems = (id, raw) => update(id, 'items', raw.split(',').map(s => s.trim()).filter(Boolean))

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Group your skills by category. Separate items with commas.</p>
      {skills.map((sk, i) => (
        <div key={sk.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Category {i + 1}</span>
            <button style={rmBtn} onClick={() => remove(sk.id)}>Remove</button>
          </div>
          <input style={inp} placeholder="Category name (e.g. Frontend)" value={sk.category}
            onChange={e => update(sk.id, 'category', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
          <input style={{ ...inp, marginBottom: 0 }} placeholder="Skills, comma-separated (e.g. React, TypeScript, CSS)" value={sk.items.join(', ')}
            onChange={e => setItems(sk.id, e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
        </div>
      ))}
      <button style={addBtn} onClick={add}>+ Add Skill Category</button>
    </div>
  )
}
```

- [ ] **Step 5: Rewrite OptionalSectionsStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const SECTIONS = [
  { key: 'projects',       label: 'Projects',       desc: 'Personal or professional projects', icon: '💼' },
  { key: 'certifications', label: 'Certifications', desc: 'Licenses and credentials',          icon: '🏆' },
  { key: 'languages',      label: 'Languages',      desc: 'Spoken / written languages',        icon: '🌐' },
  { key: 'awards',         label: 'Awards',         desc: 'Honors and achievements',           icon: '⭐' },
  { key: 'custom',         label: 'Custom Section', desc: 'Volunteer work, publications, etc.', icon: '✚' },
]

const card = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }

export default function OptionalSectionsStep() {
  const sectionOrder          = useResumeStore(s => s.content.sectionOrder)
  const toggleOptionalSection = useResumeStore(s => s.toggleOptionalSection)

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Toggle the sections you want to include in your resume.</p>
      {SECTIONS.map(({ key, label, desc, icon }) => {
        const on = sectionOrder.includes(key)
        return (
          <div key={key} onClick={() => toggleOptionalSection(key, !on)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: `1.5px solid ${on ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: on ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: on ? '#3b82f6' : '#0f172a' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
            {/* Toggle */}
            <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: on ? '#3b82f6' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: on ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6: Rewrite TemplatePickerStep.jsx**

```jsx
import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   desc: 'Centered header, serif. ATS-friendly.',       accent: '#1a1a2e' },
  { id: 'modern',    name: 'Modern',    desc: 'Blue sidebar. Great for tech roles.',           accent: '#1e3a5f' },
  { id: 'minimal',   name: 'Minimal',   desc: 'Spacious and clean. Premium feel.',            accent: '#555555' },
  { id: 'executive', name: 'Executive', desc: 'Dark bleed header. For senior positions.',     accent: '#1a1a1a' },
  { id: 'creative',  name: 'Creative',  desc: 'Gradient header + pill skill tags.',           accent: '#6c63ff' },
]

const card = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }

export default function TemplatePickerStep() {
  const templateId    = useResumeStore(s => s.templateId)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  return (
    <div style={card}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>Choose a style — you can switch anytime on the preview page.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {TEMPLATES.map(t => {
          const active = templateId === t.id
          return (
            <div key={t.id} data-template={t.id} onClick={() => setTemplateId(t.id)}
              style={{ border: `2px solid ${active ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '10px', padding: '16px', cursor: 'pointer', background: active ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
              {/* Preview thumbnail */}
              <div style={{ height: '90px', borderRadius: '6px', marginBottom: '12px', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>{t.name.toUpperCase()}</div>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: active ? '#3b82f6' : '#0f172a' }}>{t.name}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{t.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run all tests**

```bash
cd frontend && npm test
```

Expected: All tests PASS. (The existing step tests only check behavior/store interactions, not styles, so they will pass.)

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/wizard/PersonalInfoStep.jsx frontend/src/components/wizard/ExperienceStep.jsx frontend/src/components/wizard/EducationStep.jsx frontend/src/components/wizard/SkillsStep.jsx frontend/src/components/wizard/OptionalSectionsStep.jsx frontend/src/components/wizard/TemplatePickerStep.jsx
git commit -m "feat: polish all wizard step forms — consistent card layout, focus rings, grid fields"
```

---

## Final: Run full test suite and verify

- [ ] **Run all backend tests**

```bash
cd backend && npm test
```

Expected: 35+ tests PASS (13 contentMapper + rest unchanged).

- [ ] **Run all frontend tests**

```bash
cd frontend && npm test
```

Expected: 45+ tests PASS.

- [ ] **Final commit**

```bash
git add .
git commit -m "feat: resume builder v2 — UI redesign, parsing fixes, improved upload flow"
```
