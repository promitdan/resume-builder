# UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement four UX improvements: better default section ordering, a two-card landing page, free wizard step navigation when data is pre-filled, and click-to-edit inline editing on the preview page.

**Architecture:** All changes are in the React frontend except section-order fixes which also touch the Node backend's `llmContentMapper.js`. The inline editor is a new `InlineEditor` component wired into all five template files. The wizard navigation change passes a `hasContent` prop from BuildPage to WizardLayout.

**Tech Stack:** React 18, Zustand, Vite, Vitest + @testing-library/react, lodash (new dep), react-router-dom

---

## File Map

**Create:**
- `frontend/src/components/preview/InlineEditor.jsx` — click-to-edit wrapper used by all templates
- `frontend/src/__tests__/InlineEditor.test.jsx` — tests for InlineEditor

**Modify:**
- `frontend/src/store/useResumeStore.js` — fix default sectionOrder, add setField action
- `frontend/src/__tests__/useResumeStore.test.js` — update sectionOrder assertion, add setField test
- `backend/src/services/parser/llmContentMapper.js` — move skills before education in dynamic sectionOrder
- `frontend/src/templates/classic.json` — update sections.order
- `frontend/src/templates/minimal.json` — update sections.order
- `frontend/src/templates/executive.json` — update sections.order
- `frontend/src/templates/creative.json` — update sections.order
- `frontend/src/pages/LandingPage.jsx` — rewrite to two-card layout
- `frontend/src/__tests__/LandingPage.test.jsx` — update tests for new layout
- `frontend/src/components/wizard/WizardLayout.jsx` — accept hasContent prop
- `frontend/src/pages/BuildPage.jsx` — compute hasContent, pass to WizardLayout, update handleStepClick
- `frontend/src/__tests__/WizardLayout.test.jsx` — add hasContent test
- `frontend/src/components/preview/templates/ClassicTemplate.jsx` — wrap editable fields
- `frontend/src/components/preview/templates/MinimalTemplate.jsx` — wrap editable fields
- `frontend/src/components/preview/templates/ExecutiveTemplate.jsx` — wrap editable fields
- `frontend/src/components/preview/templates/CreativeTemplate.jsx` — wrap editable fields
- `frontend/src/components/preview/templates/ModernTemplate.jsx` — wrap editable fields

---

## Task 1: Fix Default Section Order

**Files:**
- Modify: `frontend/src/store/useResumeStore.js:15` and `:108`
- Modify: `frontend/src/__tests__/useResumeStore.test.js:8`
- Modify: `backend/src/services/parser/llmContentMapper.js:98-106`
- Modify: `frontend/src/templates/classic.json`
- Modify: `frontend/src/templates/minimal.json`
- Modify: `frontend/src/templates/executive.json`
- Modify: `frontend/src/templates/creative.json`

- [ ] **Step 1: Update the store test to expect the new order**

In `frontend/src/__tests__/useResumeStore.test.js`, change line 8:

```js
// OLD:
expect(result.current.content.sectionOrder).toEqual(['personal', 'experience', 'education', 'skills'])

// NEW:
expect(result.current.content.sectionOrder).toEqual(['personal', 'experience', 'skills', 'education'])
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd frontend && npm test -- --reporter=verbose 2>&1 | grep -A3 "sectionOrder"
```

Expected: FAIL — sectionOrder expected `['personal', 'experience', 'skills', 'education']` but received `['personal', 'experience', 'education', 'skills']`

- [ ] **Step 3: Update `emptyContent()` and `mockContent()` in the store**

In `frontend/src/store/useResumeStore.js`, change both occurrences of the `sectionOrder` line (lines 15 and 108):

```js
// OLD (both emptyContent and mockContent):
sectionOrder: ['personal', 'experience', 'education', 'skills'],

// NEW (both emptyContent and mockContent):
sectionOrder: ['personal', 'experience', 'skills', 'education'],
```

- [ ] **Step 4: Update `normalizeLlmContent` section order in the backend mapper**

In `backend/src/services/parser/llmContentMapper.js`, change lines 98–106:

```js
// OLD:
const sectionOrder = ['personal']
if (experience.length)     sectionOrder.push('experience')
if (education.length)      sectionOrder.push('education')
if (skills.length)         sectionOrder.push('skills')
if (projects.length)       sectionOrder.push('projects')
if (certifications.length) sectionOrder.push('certifications')
if (languages.length)      sectionOrder.push('languages')
if (awards.length)         sectionOrder.push('awards')
if (custom.length)         sectionOrder.push('custom')

// NEW:
const sectionOrder = ['personal']
if (experience.length)     sectionOrder.push('experience')
if (skills.length)         sectionOrder.push('skills')
if (education.length)      sectionOrder.push('education')
if (projects.length)       sectionOrder.push('projects')
if (certifications.length) sectionOrder.push('certifications')
if (languages.length)      sectionOrder.push('languages')
if (awards.length)         sectionOrder.push('awards')
if (custom.length)         sectionOrder.push('custom')
```

- [ ] **Step 5: Update `sections.order` in the four single-column template JSONs**

In `frontend/src/templates/classic.json`, `minimal.json`, `executive.json`, and `creative.json`, update the `sections.order` array to match:

```json
"order": ["personal", "experience", "skills", "education", "projects", "certifications", "awards", "languages", "custom"]
```

(Modern template has a sidebar/main split structure without a flat `sections.order`, skip it.)

- [ ] **Step 6: Run the tests and verify they pass**

```bash
cd frontend && npm test
```

Expected: all tests pass, including the updated sectionOrder assertion.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/store/useResumeStore.js \
        frontend/src/__tests__/useResumeStore.test.js \
        backend/src/services/parser/llmContentMapper.js \
        frontend/src/templates/classic.json \
        frontend/src/templates/minimal.json \
        frontend/src/templates/executive.json \
        frontend/src/templates/creative.json
git commit -m "fix: move skills before education in default sectionOrder"
```

---

## Task 2: Landing Page Two-Card Layout

**Files:**
- Modify: `frontend/src/pages/LandingPage.jsx`
- Modify: `frontend/src/__tests__/LandingPage.test.jsx`

- [ ] **Step 1: Update the LandingPage tests first**

Replace all content of `frontend/src/__tests__/LandingPage.test.jsx`:

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

test('renders Start from scratch card', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i)).toBeInTheDocument()
})

test('renders Upload resume card', () => {
  renderLanding()
  expect(screen.getByText(/upload resume/i)).toBeInTheDocument()
})

test('upload dropzone is always visible (no toggle needed)', () => {
  renderLanding()
  expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
})

test('Start from scratch link navigates to /build', () => {
  renderLanding()
  expect(screen.getByText(/start from scratch/i).closest('a')).toHaveAttribute('href', '/build')
})

test('renders load sample data link', () => {
  renderLanding()
  expect(screen.getByText(/load sample data/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests to see which ones fail**

```bash
cd frontend && npm test -- --reporter=verbose 2>&1 | grep -A3 "LandingPage"
```

Expected: "upload dropzone is always visible" FAILS (dropzone is hidden until button click), "Start from scratch navigates to /build" PASSES.

- [ ] **Step 3: Rewrite `LandingPage.jsx` with the two-card layout**

Replace all content of `frontend/src/pages/LandingPage.jsx`:

```jsx
import { Link, useNavigate } from 'react-router-dom'
import UploadDropzone from '../components/landing/UploadDropzone'
import { useResumeStore } from '../store/useResumeStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const loadMockData = useResumeStore(s => s.loadMockData)

  const handleLoadSample = () => {
    loadMockData()
    navigate('/preview')
  }

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
        <div style={{ width: '100%', maxWidth: '680px', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-block', background: '#eff6ff', color: '#3b82f6', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', marginBottom: '24px', letterSpacing: '0.5px' }}>
            FREE · NO SIGN-UP REQUIRED
          </div>

          {/* Headline */}
          <h1 style={{ margin: '0 0 12px', fontSize: '40px', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Build a resume that<br />
            <span style={{ color: '#3b82f6' }}>gets you hired</span>
          </h1>
          <p style={{ margin: '0 0 36px', fontSize: '16px', color: '#64748b', lineHeight: 1.6 }}>
            Guided wizard, 5 professional templates, PDF &amp; DOCX export.
          </p>

          {/* Two-card split */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            {/* Upload card */}
            <div style={{ flex: 1, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Upload resume</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>AI parses your PDF or DOCX</div>
              <UploadDropzone />
            </div>

            {/* Scratch card */}
            <div style={{ flex: 1, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px 20px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✏️</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Start from scratch</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', flex: 1 }}>Step-by-step guided builder</div>
              <Link
                to="/build"
                style={{ display: 'block', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '11px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
              >
                Begin →
              </Link>
            </div>
          </div>

          {/* Sample data link */}
          <button
            onClick={handleLoadSample}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            or load sample data to preview all templates
          </button>
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

- [ ] **Step 4: Run the tests and verify they all pass**

```bash
cd frontend && npm test -- --reporter=verbose 2>&1 | grep -A3 "LandingPage"
```

Expected: all 5 LandingPage tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/LandingPage.jsx frontend/src/__tests__/LandingPage.test.jsx
git commit -m "feat: landing page two-card split layout — upload always visible"
```

---

## Task 3: Wizard Free Navigation When Data Exists

**Files:**
- Modify: `frontend/src/components/wizard/WizardLayout.jsx`
- Modify: `frontend/src/pages/BuildPage.jsx`
- Modify: `frontend/src/__tests__/WizardLayout.test.jsx`

- [ ] **Step 1: Add a hasContent test to WizardLayout tests**

Append to `frontend/src/__tests__/WizardLayout.test.jsx`:

```jsx
test('when hasContent is true, clicking any step (including future) calls onStepClick', () => {
  const onStepClick = vi.fn()
  render(
    <WizardLayout
      steps={mockSteps}
      currentStep={0}
      onNext={() => {}}
      onStepClick={onStepClick}
      hasContent={true}
    />
  )
  // Step 2 (Done) is a future step — should be clickable when hasContent=true
  fireEvent.click(screen.getByText('Done'))
  expect(onStepClick).toHaveBeenCalledWith(2)
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd frontend && npm test -- --reporter=verbose 2>&1 | grep -A5 "hasContent"
```

Expected: FAIL — onStepClick was not called.

- [ ] **Step 3: Update WizardLayout to accept and use the `hasContent` prop**

Replace all content of `frontend/src/components/wizard/WizardLayout.jsx`:

```jsx
export default function WizardLayout({ steps = [], currentStep = 0, onNext, onStepClick, hasContent = false }) {
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
            const done     = i < currentStep
            const active   = i === currentStep
            const canClick = done || hasContent

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

- [ ] **Step 4: Update BuildPage to compute `hasContent` and update `handleStepClick`**

Replace all content of `frontend/src/pages/BuildPage.jsx`:

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
import { useResumeStore }   from '../store/useResumeStore'

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
  const navigate    = useNavigate()
  const personalName = useResumeStore(s => s.content.personal.name)
  const hasContent  = !!personalName

  function handleNext() {
    if (currentStep === STEPS.length - 1) navigate('/preview')
    else setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function handleStepClick(index) {
    if (hasContent || index < currentStep) setCurrentStep(index)
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onStepClick={handleStepClick}
      hasContent={hasContent}
    />
  )
}
```

- [ ] **Step 5: Run the tests and verify they all pass**

```bash
cd frontend && npm test
```

Expected: all tests pass, including the new hasContent test.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/wizard/WizardLayout.jsx \
        frontend/src/pages/BuildPage.jsx \
        frontend/src/__tests__/WizardLayout.test.jsx
git commit -m "feat: wizard allows free step navigation when data is pre-filled"
```

---

## Task 4: Add `setField` to Store and Install Lodash

**Files:**
- Modify: `frontend/src/store/useResumeStore.js`
- Modify: `frontend/src/__tests__/useResumeStore.test.js`

- [ ] **Step 1: Install lodash in the frontend**

```bash
cd frontend && npm install lodash
```

Expected: lodash added to `package.json` dependencies, `node_modules/lodash` present.

- [ ] **Step 2: Add a failing test for `setField`**

Append to `frontend/src/__tests__/useResumeStore.test.js`:

```js
test('setField updates a nested field by dot-notation path', () => {
  const { result } = renderHook(() => useResumeStore())
  act(() => result.current.updatePersonal({ name: 'Original' }))
  act(() => result.current.setField('personal.name', 'Updated'))
  expect(result.current.content.personal.name).toBe('Updated')
})

test('setField updates an array element by index path', () => {
  const { result } = renderHook(() => useResumeStore())
  act(() => result.current.addExperience())
  const id = result.current.content.experience[0].id
  act(() => result.current.setField('experience.0.company', 'Acme'))
  expect(result.current.content.experience[0].company).toBe('Acme')
  expect(result.current.content.experience[0].id).toBe(id) // other fields untouched
})
```

- [ ] **Step 3: Run the tests to confirm they fail**

```bash
cd frontend && npm test -- --reporter=verbose 2>&1 | grep -A3 "setField"
```

Expected: FAIL — `result.current.setField is not a function`

- [ ] **Step 4: Add `setField` action to the store**

In `frontend/src/store/useResumeStore.js`, add the import at the top and the action in the store:

```js
// Add at the very top of the file (after existing imports):
import { set as lodashSet } from 'lodash'
```

Then inside `create((set) => ({ ... }))`, add the `setField` action after `resetResume`:

```js
  setField: (path, value) =>
    set((s) => {
      const content = structuredClone(s.content)
      lodashSet(content, path, value)
      return { content }
    }),
```

- [ ] **Step 5: Run the tests and verify they all pass**

```bash
cd frontend && npm test
```

Expected: all tests pass including both new `setField` tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/store/useResumeStore.js \
        frontend/src/__tests__/useResumeStore.test.js \
        frontend/package.json \
        frontend/package-lock.json
git commit -m "feat: add setField action to store using lodash set"
```

---

## Task 5: Create InlineEditor Component

**Files:**
- Create: `frontend/src/components/preview/InlineEditor.jsx`
- Create: `frontend/src/__tests__/InlineEditor.test.jsx`

- [ ] **Step 1: Write failing tests for InlineEditor**

Create `frontend/src/__tests__/InlineEditor.test.jsx`:

```jsx
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import InlineEditor from '../components/preview/InlineEditor'
import { useResumeStore } from '../store/useResumeStore'

beforeEach(() => {
  useResumeStore.setState(useResumeStore.getInitialState())
})

function renderEditor(props = {}) {
  return render(
    <InlineEditor path="personal.name" value="Alice" {...props}>
      <span>Alice</span>
    </InlineEditor>
  )
}

test('renders children when not editing', () => {
  renderEditor()
  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('clicking the display node activates editing', () => {
  renderEditor()
  fireEvent.click(screen.getByText('Alice'))
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})

test('editing an input and pressing Enter confirms and calls setField', () => {
  const { result } = renderHook(() => useResumeStore())
  render(
    <InlineEditor path="personal.name" value="Alice">
      <span>Alice</span>
    </InlineEditor>
  )
  fireEvent.click(screen.getByText('Alice'))
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: 'Bob' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(result.current.content.personal.name).toBe('Bob')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('pressing Escape cancels without calling setField', () => {
  const { result } = renderHook(() => useResumeStore())
  render(
    <InlineEditor path="personal.name" value="Alice">
      <span>Alice</span>
    </InlineEditor>
  )
  fireEvent.click(screen.getByText('Alice'))
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: 'Bob' } })
  fireEvent.keyDown(input, { key: 'Escape' })
  expect(result.current.content.personal.name).toBe('')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('clicking confirm button saves the value', () => {
  const { result } = renderHook(() => useResumeStore())
  render(
    <InlineEditor path="personal.name" value="Alice">
      <span>Alice</span>
    </InlineEditor>
  )
  fireEvent.click(screen.getByText('Alice'))
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carol' } })
  fireEvent.click(screen.getByText('✓'))
  expect(result.current.content.personal.name).toBe('Carol')
})

test('clicking cancel button discards changes', () => {
  const { result } = renderHook(() => useResumeStore())
  render(
    <InlineEditor path="personal.name" value="Alice">
      <span>Alice</span>
    </InlineEditor>
  )
  fireEvent.click(screen.getByText('Alice'))
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Nobody' } })
  fireEvent.click(screen.getByText('✕'))
  expect(result.current.content.personal.name).toBe('')
})

test('multiline=true renders a textarea', () => {
  render(
    <InlineEditor path="personal.summary" value="Hello world" multiline>
      <div>Hello world</div>
    </InlineEditor>
  )
  fireEvent.click(screen.getByText('Hello world'))
  expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
})
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd frontend && npm test -- --reporter=verbose 2>&1 | grep -A3 "InlineEditor"
```

Expected: FAIL — module not found for `InlineEditor`.

- [ ] **Step 3: Create `InlineEditor.jsx`**

Create `frontend/src/components/preview/InlineEditor.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react'
import { useResumeStore } from '../../store/useResumeStore'

export default function InlineEditor({ path, value, multiline = false, children }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')
  const setField  = useResumeStore(s => s.setField)
  const inputRef  = useRef()
  const wrapRef   = useRef()

  function startEdit(e) {
    e.stopPropagation()
    setDraft(value ?? '')
    setEditing(true)
  }

  function confirm() {
    setField(path, draft)
    setEditing(false)
  }

  function cancel() {
    setEditing(false)
  }

  function onKeyDown(e) {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); confirm() }
    if (e.key === 'Escape') cancel()
  }

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
    function onMouseDown(e) {
      if (!wrapRef.current?.contains(e.target)) cancel()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [editing])

  const inputStyle = {
    border: '1.5px solid #3b82f6',
    borderRadius: '3px',
    padding: '2px 4px',
    outline: 'none',
    background: '#eff6ff',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    lineHeight: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : 'none',
  }

  if (!editing) {
    return (
      <span
        ref={wrapRef}
        onClick={startEdit}
        title="Click to edit"
        style={{ cursor: 'text', borderRadius: '2px', display: 'inline' }}
      >
        {children ?? value}
      </span>
    )
  }

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-block', width: multiline ? '100%' : 'auto' }}>
      {multiline ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={4}
          style={{ ...inputStyle, display: 'block', minHeight: '60px' }}
        />
      ) : (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          style={inputStyle}
        />
      )}
      <span style={{
        position: 'absolute', top: '100%', right: 0, marginTop: '2px',
        display: 'flex', gap: '4px', zIndex: 100,
        background: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0',
        padding: '2px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <button
          onClick={confirm}
          style={{ border: 'none', background: 'none', color: '#22c55e', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '2px 6px' }}
        >✓</button>
        <button
          onClick={cancel}
          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '2px 6px' }}
        >✕</button>
      </span>
    </span>
  )
}
```

- [ ] **Step 4: Run the tests and verify they all pass**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/preview/InlineEditor.jsx \
        frontend/src/__tests__/InlineEditor.test.jsx
git commit -m "feat: add InlineEditor click-to-edit component"
```

---

## Task 6: Wire InlineEditor into ClassicTemplate

**Files:**
- Modify: `frontend/src/components/preview/templates/ClassicTemplate.jsx`

The Classic template renders: centered header (name, title, contact, summary), then sections via `sectionOrder.map`. Wrap every user-authored text node with `<InlineEditor path="..." value={...}>`.

Note: skills use `skills.flatMap(sk => sk.items)` losing category+item indices — change to iterate by category index and item index so paths are accurate.

- [ ] **Step 1: Replace the full content of `ClassicTemplate.jsx`**

```jsx
import InlineEditor from '../InlineEditor'
import t from '../../../templates/classic.json'

export default function ClassicTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: '3px', color: c.headingText,
      borderBottom: `1.5px solid ${c.dividerColor}`,
      paddingBottom: '4px', marginBottom: '10px', marginTop: '18px',
    }}>{text}</div>
  )

  const contactFields = [
    { path: 'personal.email',    value: personal.email },
    { path: 'personal.phone',    value: personal.phone },
    { path: 'personal.location', value: personal.location },
    { path: 'personal.linkedin', value: personal.linkedin },
    { path: 'personal.website',  value: personal.website },
  ].filter(f => f.value)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ textAlign: 'center', padding: '36px 56px 18px', borderBottom: `2px solid ${c.dividerColor}` }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontFamily: ty.titleFont, fontStyle: 'italic', fontSize: ty.titleFontSize, color: c.mutedText, marginTop: '6px', letterSpacing: '0.5px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ fontSize: '13px', color: c.mutedText, marginTop: '8px' }}>
          {contactFields.map((f, i) => (
            <span key={f.path}>
              {i > 0 && ' · '}
              <InlineEditor path={f.path} value={f.value}>{f.value}</InlineEditor>
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '22px 56px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: c.mainText, textAlign: 'justify' }}>
              <InlineEditor path="personal.summary" value={personal.summary} multiline>{personal.summary}</InlineEditor>
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal').map(key => {
          if (key === 'skills' && skills.length > 0) {
            const hasItems = skills.some(sk => (sk.items ?? []).length > 0)
            return hasItems ? (
              <div key={key}>
                {sectionLabel('Core Competencies')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((sk, si) =>
                    (sk.items ?? []).map((item, ii) => (
                      <InlineEditor key={`${si}-${ii}`} path={`skills.${si}.items.${ii}`} value={item}>
                        <span style={{ display: 'inline-block', background: '#f2f2f2', border: `1px solid ${c.dividerColor}`, borderRadius: '3px', padding: '4px 12px', fontSize: '13px', color: '#333' }}>{item}</span>
                      </InlineEditor>
                    ))
                  )}
                </div>
              </div>
            ) : null
          }

          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '13px', color: c.mutedText, fontStyle: 'italic' }}>
                      {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: ty.bodyFontSize, fontStyle: 'italic', color: c.mainText, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.6', color: '#333', marginBottom: '3px' }}>
                      • <InlineEditor path={`experience.${i}.bullets.${bi}`} value={b}>{b}</InlineEditor>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education')}
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </div>
                    {e.endDate && (
                      <div style={{ fontSize: '13px', color: c.mutedText, fontStyle: 'italic' }}>
                        <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: ty.bodyFontSize, fontStyle: 'italic', color: c.mainText }}>
                    <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                    {e.degree && e.field ? ' ' : ''}
                    <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                  </div>
                  {e.gpa && (
                    <div style={{ fontSize: '13px', color: c.mutedText }}>
                      GPA: <InlineEditor path={`education.${i}.gpa`} value={e.gpa}>{e.gpa}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {sectionLabel('Certifications')}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '13px', fontStyle: 'italic', color: c.mainText }}>
                        {' · '}<InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: '13px', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {sectionLabel('Languages')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ display: 'inline-block', background: '#f2f2f2', border: `1px solid ${c.dividerColor}`, borderRadius: '3px', padding: '4px 12px', fontSize: '13px', color: '#333' }}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency ? (
                      <> — <InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor></>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key}>
              {sectionLabel('Awards & Recognition')}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '13px', fontStyle: 'italic', color: c.mainText }}>
                        {' · '}<InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: '13px', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {sectionLabel('Projects')}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.6', color: '#333', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.description`} value={proj.description} multiline>{proj.description}</InlineEditor>
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: c.mutedText }}>
                      <InlineEditor path={`projects.${i}.url`} value={proj.url}>{proj.url}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {sectionLabel(
                      <InlineEditor path={`custom.${i}.title`} value={sec.title || 'Other'}>{sec.title || 'Other'}</InlineEditor>
                    )}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description || ''} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.6', color: '#333', marginBottom: '3px' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run the tests and verify nothing broke**

```bash
cd frontend && npm test
```

Expected: all tests pass (ClassicTemplate has no unit tests, but ResumePreview tests should still pass).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/templates/ClassicTemplate.jsx
git commit -m "feat: inline editing wired into ClassicTemplate"
```

---

## Task 7: Wire InlineEditor into MinimalTemplate

**Files:**
- Modify: `frontend/src/components/preview/templates/MinimalTemplate.jsx`

MinimalTemplate is single-column, similar structure to ClassicTemplate. Skills are rendered as a dot-joined string `allSkillItems.join(' · ')` — change to iterate by category and item index like Classic.

- [ ] **Step 1: Replace the full content of `MinimalTemplate.jsx`**

```jsx
import InlineEditor from '../InlineEditor'
import t from '../../../templates/minimal.json'

export default function MinimalTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text, first = false) => (
    <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px', marginTop: first ? '0' : '32px' }}>{text}</div>
  )

  const contactFields = [
    { path: 'personal.email',    value: personal.email },
    { path: 'personal.phone',    value: personal.phone },
    { path: 'personal.location', value: personal.location },
    { path: 'personal.linkedin', value: personal.linkedin },
    { path: 'personal.website',  value: personal.website },
  ].filter(f => f.value)

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight, padding: '52px 64px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, letterSpacing: '-0.5px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#666', marginTop: '4px', letterSpacing: '0.5px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
          {contactFields.map((f, i) => (
            <span key={f.path}>
              {i > 0 && ' · '}
              <InlineEditor path={f.path} value={f.value}>{f.value}</InlineEditor>
            </span>
          ))}
        </div>
      </div>

      {personal.summary && (
        <div>
          {sectionLabel('Summary')}
          <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', maxWidth: '580px' }}>
            <InlineEditor path="personal.summary" value={personal.summary} multiline>{personal.summary}</InlineEditor>
          </div>
        </div>
      )}

      {(() => {
        const visibleKeys = sectionOrder.filter(k => k !== 'personal').filter(k => {
          if (k === 'skills') return hasSkillItems
          if (k === 'experience') return experience.length > 0
          if (k === 'education') return education.length > 0
          if (k === 'certifications') return certifications.length > 0
          if (k === 'languages') return languages.length > 0
          if (k === 'awards') return awards.length > 0
          if (k === 'projects') return projects.length > 0
          if (k === 'custom') return custom.length > 0
          return false
        })
        return sectionOrder.filter(k => k !== 'personal').map(key => {
          if (key === 'skills' && hasSkillItems) return (
            <div key={key}>
              {sectionLabel('Skills', key === visibleKeys[0])}
              <div style={{ fontSize: '14px', color: '#555', lineHeight: '2', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {skills.map((sk, si) =>
                  (sk.items ?? []).map((item, ii) => (
                    <span key={`${si}-${ii}`}>
                      {(si > 0 || ii > 0) && <span style={{ color: '#bbb' }}> · </span>}
                      <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                    </span>
                  ))
                )}
              </div>
            </div>
          )

          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Experience', key === visibleKeys[0])}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={b + bi} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>
                      • <InlineEditor path={`experience.${i}.bullets.${bi}`} value={b}>{b}</InlineEditor>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education', key === visibleKeys[0])}
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {education.map((e, i) => (
                  <div key={e.id ?? i}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                      {e.degree && e.field ? ': ' : ''}
                      <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                    </div>
                    {e.endDate && (
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {sectionLabel('Certifications', key === visibleKeys[0])}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {' · '}<InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {sectionLabel('Languages', key === visibleKeys[0])}
              <div style={{ fontSize: '14px', color: '#555', lineHeight: '2' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i}>
                    {i > 0 && ' · '}
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency ? (
                      <> (<InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor>)</>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key}>
              {sectionLabel('Awards & Recognition', key === visibleKeys[0])}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {' · '}<InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {sectionLabel('Projects', key === visibleKeys[0])}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.description`} value={proj.description} multiline>{proj.description}</InlineEditor>
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.url`} value={proj.url}>{proj.url}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {sectionLabel(
                      <InlineEditor path={`custom.${i}.title`} value={sec.title || 'Other'}>{sec.title || 'Other'}</InlineEditor>,
                      i === 0 && key === visibleKeys[0]
                    )}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description || ''} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })
      })()}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/templates/MinimalTemplate.jsx
git commit -m "feat: inline editing wired into MinimalTemplate"
```

---

## Task 8: Wire InlineEditor into ExecutiveTemplate

**Files:**
- Modify: `frontend/src/components/preview/templates/ExecutiveTemplate.jsx`

ExecutiveTemplate has a dark header band, a skills bar below the header (outside sectionOrder), then main content. Skills items use `allSkillItems` — change to iterate by category/item indices.

- [ ] **Step 1: Read the rest of ExecutiveTemplate to see all section types**

```bash
cd "d:/Games/Personal Projects/resume-builder" && sed -n '100,$p' frontend/src/components/preview/templates/ExecutiveTemplate.jsx
```

- [ ] **Step 2: Replace the full content of `ExecutiveTemplate.jsx`**

```jsx
import InlineEditor from '../InlineEditor'
import t from '../../../templates/executive.json'

export default function ExecutiveTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text, first = false) => (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText, borderLeft: `3px solid ${c.headingText}`, paddingLeft: '10px', marginBottom: '12px', marginTop: first ? '0' : '24px' }}>{text}</div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  const visibleMainKeys = sectionOrder
    .filter(k => k !== 'personal' && k !== 'skills')
    .filter(k => {
      if (k === 'experience') return experience.length > 0
      if (k === 'education') return education.length > 0
      if (k === 'certifications') return certifications.length > 0
      if (k === 'languages') return languages.length > 0
      if (k === 'awards') return awards.length > 0
      if (k === 'projects') return projects.length > 0
      if (k === 'custom') return custom.length > 0
      return false
    })

  const contactFields = [
    { path: 'personal.email',    value: personal.email },
    { path: 'personal.phone',    value: personal.phone },
    { path: 'personal.location', value: personal.location },
  ].filter(f => f.value)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      {/* Dark header */}
      <div style={{ background: c.headerBackground, color: c.headerText, padding: '40px 52px 32px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: ty.nameLetterSpacing || '1px', textTransform: 'uppercase', color: '#fff', marginBottom: '6px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: c.headerMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#cbd5e0', flexWrap: 'wrap' }}>
          {contactFields.map((f, i) => (
            <InlineEditor key={f.path} path={f.path} value={f.value}><span>{f.value}</span></InlineEditor>
          ))}
        </div>
      </div>

      {/* Skills bar */}
      {hasSkillItems && (
        <div style={{ background: '#f7f7fa', padding: '16px 52px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map((sk, si) =>
              (sk.items ?? []).map((item, ii) => (
                <InlineEditor key={`${si}-${ii}`} path={`skills.${si}.items.${ii}`} value={item}>
                  <span style={{ background: c.headingText, color: '#e0e0f0', fontSize: '12px', fontWeight: '500', padding: '5px 12px', borderRadius: '3px' }}>{item}</span>
                </InlineEditor>
              ))
            )}
          </div>
        </div>
      )}

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary', true)}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#333' }}>
              <InlineEditor path="personal.summary" value={personal.summary} multiline>{personal.summary}</InlineEditor>
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History', key === visibleMainKeys[0] && !personal.summary)}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>
                      {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', margin: '2px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
                      • <InlineEditor path={`experience.${i}.bullets.${bi}`} value={b}>{b}</InlineEditor>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education', key === visibleMainKeys[0] && !personal.summary)}
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </span>
                    <span style={{ fontSize: '14px', color: '#555', marginLeft: '10px' }}>
                      <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                      {e.degree && e.field ? ': ' : ''}
                      <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                    </span>
                  </div>
                  {e.endDate && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {sectionLabel('Certifications', key === visibleMainKeys[0] && !personal.summary)}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '14px', color: '#555', marginLeft: '8px' }}>
                        <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {sectionLabel('Languages', key === visibleMainKeys[0] && !personal.summary)}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency ? (
                      <> — <InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor></>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key}>
              {sectionLabel('Awards & Recognition', key === visibleMainKeys[0] && !personal.summary)}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '14px', color: '#555', marginLeft: '8px' }}>
                        <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {sectionLabel('Projects', key === visibleMainKeys[0] && !personal.summary)}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#333', marginTop: '4px' }}>
                      <InlineEditor path={`projects.${i}.description`} value={proj.description} multiline>{proj.description}</InlineEditor>
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.url`} value={proj.url}>{proj.url}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {sectionLabel(
                      <InlineEditor path={`custom.${i}.title`} value={sec.title || 'Other'}>{sec.title || 'Other'}</InlineEditor>,
                      i === 0 && key === visibleMainKeys[0] && !personal.summary
                    )}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description || ''} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/preview/templates/ExecutiveTemplate.jsx
git commit -m "feat: inline editing wired into ExecutiveTemplate"
```

---

## Task 9: Wire InlineEditor into CreativeTemplate

**Files:**
- Modify: `frontend/src/components/preview/templates/CreativeTemplate.jsx`

CreativeTemplate has a gradient header, skills rendered before sectionOrder, then sectionOrder content. Skills use `allSkillItems` — change to iterate by category/item indices.

- [ ] **Step 1: Read the rest of CreativeTemplate**

```bash
cd "d:/Games/Personal Projects/resume-builder" && sed -n '80,$p' frontend/src/components/preview/templates/CreativeTemplate.jsx
```

- [ ] **Step 2: Replace the full content of `CreativeTemplate.jsx`**

```jsx
import InlineEditor from '../InlineEditor'
import t from '../../../templates/creative.json'

export default function CreativeTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const gradientStyle = `linear-gradient(90deg, ${c.accentStart}, ${c.accentEnd})`

  const sectionLabel = (text) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', background: gradientStyle, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>{text}</div>
      <div style={{ height: '2px', background: gradientStyle, borderRadius: '1px' }}></div>
    </div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)
  const borderColors = [c.accentStart, c.accentEnd]

  const contactFields = [
    { path: 'personal.email',    value: personal.email,    icon: '✉' },
    { path: 'personal.phone',    value: personal.phone,    icon: '☎' },
    { path: 'personal.location', value: personal.location, icon: '📍' },
  ].filter(f => f.value)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      {/* Gradient header */}
      <div style={{ background: `linear-gradient(135deg, ${c.accentStart}, #7c3aed, ${c.accentEnd})`, color: '#fff', padding: '40px 52px 32px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#e0d9ff', letterSpacing: '1px', marginBottom: '18px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#d1c4ff', flexWrap: 'wrap' }}>
          {contactFields.map(f => (
            <span key={f.path}>
              {f.icon} <InlineEditor path={f.path} value={f.value}>{f.value}</InlineEditor>
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('About')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>
              <InlineEditor path="personal.summary" value={personal.summary} multiline>{personal.summary}</InlineEditor>
            </div>
          </div>
        )}

        {hasSkillItems && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map((sk, si) =>
                (sk.items ?? []).map((item, ii) => {
                  const pillColors = [{ bg: '#ede9fe', color: '#5b21b6' }, { bg: '#fce7f3', color: '#9d174d' }]
                  const p = pillColors[(si * (sk.items?.length ?? 0) + ii) % 2]
                  return (
                    <InlineEditor key={`${si}-${ii}`} path={`skills.${si}.items.${ii}`} value={item}>
                      <span style={{ background: p.bg, color: p.color, fontSize: '13px', fontWeight: '500', padding: '5px 13px', borderRadius: '20px' }}>{item}</span>
                    </InlineEditor>
                  )
                })
              )}
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Experience')}
              {experience.map((e, i) => {
                const bc = borderColors[i % 2]
                return (
                  <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing, paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                        <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </div>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                      </div>
                    </div>
                    {(e.role || e.location) && (
                      <div style={{ fontSize: '14px', fontWeight: '600', color: bc, margin: '2px 0 6px' }}>
                        <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                        {e.role && e.location ? ' · ' : ''}
                        <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                      </div>
                    )}
                    {e.bullets?.filter(Boolean).map((b, bi) => (
                      <div key={bi} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
                        • <InlineEditor path={`experience.${i}.bullets.${bi}`} value={b}>{b}</InlineEditor>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Education')}
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </div>
                    {e.endDate && (
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                    <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                    {e.degree && e.field ? ': ' : ''}
                    <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                  </div>
                  {e.gpa && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      GPA: <InlineEditor path={`education.${i}.gpa`} value={e.gpa}>{e.gpa}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Certifications')}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                        <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Languages')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency ? (
                      <> — <InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor></>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Awards & Recognition')}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                        <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Projects')}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.description`} value={proj.description} multiline>{proj.description}</InlineEditor>
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.url`} value={proj.url}>{proj.url}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {sectionLabel(
                      <InlineEditor path={`custom.${i}.title`} value={sec.title || 'Other'}>{sec.title || 'Other'}</InlineEditor>
                    )}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description || ''} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/preview/templates/CreativeTemplate.jsx
git commit -m "feat: inline editing wired into CreativeTemplate"
```

---

## Task 10: Wire InlineEditor into ModernTemplate

**Files:**
- Modify: `frontend/src/components/preview/templates/ModernTemplate.jsx`

ModernTemplate has a dark sidebar (contact, skills, education) and a white main column (experience, projects, awards, custom). The sidebar renders skills and education outside of `sectionOrder` — wrap those inline too. Read the rest of the file before editing.

- [ ] **Step 1: Read the full ModernTemplate**

```bash
cd "d:/Games/Personal Projects/resume-builder" && cat frontend/src/components/preview/templates/ModernTemplate.jsx
```

- [ ] **Step 2: Replace the full content of `ModernTemplate.jsx`**

Open `frontend/src/components/preview/templates/ModernTemplate.jsx` and replace with the following. The key changes versus the current file: add `import InlineEditor`, wrap all text nodes in `<InlineEditor path="..." value={...}>`, change `skills.flatMap` to indexed iteration.

```jsx
import InlineEditor from '../InlineEditor'
import t from '../../../templates/modern.json'

export default function ModernTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.sidebarAccent, borderBottom: '1px solid #2d5080', paddingBottom: '4px', marginBottom: '10px', marginTop: '18px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.headingText, borderBottom: `2px solid ${c.sidebarAccent}`, paddingBottom: '4px', marginBottom: '14px', marginTop: '20px' }}>{text}</div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  const contactFields = [
    { path: 'personal.email',    value: personal.email },
    { path: 'personal.phone',    value: personal.phone },
    { path: 'personal.location', value: personal.location },
  ].filter(f => f.value)

  return (
    <div style={{ display: 'flex', fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, lineHeight: ty.bodyLineHeight, minHeight: '11in' }}>
      {/* Sidebar */}
      <div style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '32px 20px', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', background: c.sidebarAccent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '700', color: '#fff', margin: '0 auto 12px' }}>
            {(personal.name || '?')[0]}
          </div>
          <div style={{ fontSize: ty.nameFontSize, fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
          </div>
          {personal.title && (
            <div style={{ fontSize: ty.titleFontSize, color: '#90b8e0', marginTop: '4px' }}>
              <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
            </div>
          )}
        </div>

        {sidebarLabel('Contact')}
        <div style={{ fontSize: '13px', lineHeight: '1.7', wordBreak: 'break-word', marginBottom: '4px' }}>
          {contactFields.map(f => (
            <div key={f.path}>
              <InlineEditor path={f.path} value={f.value}>{f.value}</InlineEditor>
            </div>
          ))}
        </div>

        {hasSkillItems && <>
          {sidebarLabel('Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '4px' }}>
            {skills.map((sk, si) =>
              (sk.items ?? []).map((item, ii) => (
                <InlineEditor key={`${si}-${ii}`} path={`skills.${si}.items.${ii}`} value={item}>
                  <span style={{ background: '#1a4d7a', border: '1px solid #2d6a9f', color: '#cce4ff', fontSize: '12px', padding: '4px 10px', borderRadius: '12px' }}>{item}</span>
                </InlineEditor>
              ))
            )}
          </div>
        </>}

        {education.length > 0 && <>
          {sidebarLabel('Education')}
          {education.map((e, i) => (
            <div key={e.id ?? i} style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.7' }}>
              <div style={{ fontWeight: '600', color: '#fff' }}>
                <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
              </div>
              <div style={{ color: '#90b8e0' }}>
                <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                {e.degree && e.field ? ': ' : ''}
                <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
              </div>
              {e.endDate && (
                <div style={{ color: '#7aa0c0' }}>
                  <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                </div>
              )}
            </div>
          ))}
        </>}
      </div>

      {/* Main column */}
      <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box' }}>
        {personal.summary && (
          <div>
            {mainLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginBottom: '4px' }}>
              <InlineEditor path="personal.summary" value={personal.summary} multiline>{personal.summary}</InlineEditor>
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'education' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {mainLabel('Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '14px', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.6', color: '#444', marginBottom: '3px' }}>
                      • <InlineEditor path={`experience.${i}.bullets.${bi}`} value={b}>{b}</InlineEditor>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {mainLabel('Certifications')}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                        <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {mainLabel('Languages')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency ? (
                      <> — <InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor></>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key}>
              {mainLabel('Awards & Recognition')}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                        <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {mainLabel('Projects')}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.description`} value={proj.description} multiline>{proj.description}</InlineEditor>
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                      <InlineEditor path={`projects.${i}.url`} value={proj.url}>{proj.url}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {mainLabel(
                      <InlineEditor path={`custom.${i}.title`} value={sec.title || 'Other'}>{sec.title || 'Other'}</InlineEditor>
                    )}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description || ''} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.6', color: '#444', marginBottom: '3px' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run the full test suite**

```bash
cd frontend && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add frontend/src/components/preview/templates/ModernTemplate.jsx
git commit -m "feat: inline editing wired into ModernTemplate — all 4 UX improvements complete"
```
