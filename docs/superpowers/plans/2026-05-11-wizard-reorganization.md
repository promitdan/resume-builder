# Wizard Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the linear 7-step wizard with a two-phase flow: a full-screen template gallery (Phase 1) followed by a split editor with a live preview panel (Phase 2).

**Architecture:** `BuildPage` owns a `phase` state (`'gallery' | 'editor'`). Phase 1 renders a new `TemplateGallery` component (family accordion + variant thumbnails). Phase 2 renders a rewritten `WizardLayout` (top breadcrumb bar + left scrollable form + right live `TemplatePreview`). All existing step form components are unchanged.

**Tech Stack:** React 18, Zustand, Vite, Vitest + React Testing Library, inline styles (no CSS modules)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `frontend/src/components/preview/ResumePreview.jsx` | Modify | Export `COMPONENT_MAP` so `TemplateGallery` and `WizardLayout` can look up the React component by templateId |
| `frontend/src/components/wizard/TemplateGallery.jsx` | **Create** | Phase 1 — family accordion cards, variant thumbnail picker, "Start building →" CTA |
| `frontend/src/components/wizard/WizardLayout.jsx` | Rewrite | Phase 2 shell — top bar (breadcrumb + change-template + finish), left form panel, right live preview |
| `frontend/src/pages/BuildPage.jsx` | Modify | Own `phase` state, render gallery or editor, wire handlers |
| `frontend/src/__tests__/TemplateGallery.test.jsx` | **Create** | Unit tests for gallery |
| `frontend/src/__tests__/WizardLayout.test.jsx` | Rewrite | Updated tests for new layout shape |
| `frontend/src/components/wizard/TemplatePickerStep.jsx` | Delete | Replaced by TemplateGallery |
| `frontend/src/components/wizard/PreviewStep.jsx` | Delete | Preview is always visible in Phase 2 right panel |

---

## Task 1: Export COMPONENT_MAP from ResumePreview

**Files:**
- Modify: `frontend/src/components/preview/ResumePreview.jsx:25`

- [ ] **Step 1: Add `export` to the COMPONENT_MAP declaration**

In `frontend/src/components/preview/ResumePreview.jsx`, change line 25 from:

```js
const COMPONENT_MAP = {
```

to:

```js
export const COMPONENT_MAP = {
```

- [ ] **Step 2: Verify nothing breaks**

```bash
cd frontend && npm run test -- --reporter=verbose 2>&1 | head -40
```

Expected: existing tests still pass (no import errors).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/preview/ResumePreview.jsx
git commit -m "refactor: export COMPONENT_MAP from ResumePreview"
```

---

## Task 2: Create TemplateGallery (Phase 1)

**Files:**
- Create: `frontend/src/components/wizard/TemplateGallery.jsx`
- Create: `frontend/src/__tests__/TemplateGallery.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/__tests__/TemplateGallery.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../store/useResumeStore', () => ({
  useResumeStore: (selector) => selector({
    templateId: 'classic-traditional',
    setTemplateId: vi.fn(),
  }),
}))

vi.mock('../components/landing/TemplatePreview', () => ({
  default: () => <div data-testid="template-preview" />,
}))

vi.mock('../components/preview/ResumePreview', () => ({
  COMPONENT_MAP: {
    'classic-traditional': () => <div />,
    'classic-academic':    () => <div />,
    'classic-formal':      () => <div />,
    'modern':              () => <div />,
    'modern-sidebar':      () => <div />,
    'modern-banner':       () => <div />,
    'modern-split':        () => <div />,
    'minimal':             () => <div />,
    'minimal-columns':     () => <div />,
    'minimal-boxed':       () => <div />,
    'minimal-serif':       () => <div />,
    'executive':           () => <div />,
    'executive-band':      () => <div />,
    'executive-sidebar':   () => <div />,
    'creative':            () => <div />,
    'creative-star':       () => <div />,
    'creative-minimal':    () => <div />,
  },
}))

import TemplateGallery from '../components/wizard/TemplateGallery'

describe('TemplateGallery', () => {
  it('renders all 5 family cards', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('Executive')).toBeInTheDocument()
    expect(screen.getByText('Creative')).toBeInTheDocument()
  })

  it('expands the family of the current template on mount', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    // currentTemplateId is 'classic-traditional' → Classic family should be open
    expect(screen.getByText('Traditional')).toBeInTheDocument()
  })

  it('shows variants when a different family card is clicked', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    fireEvent.click(screen.getByText('Modern'))
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
  })

  it('collapses expanded family when clicking it again', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    // Classic is expanded on mount; click it to collapse
    fireEvent.click(screen.getByText('Classic'))
    expect(screen.queryByText('Traditional')).not.toBeInTheDocument()
  })

  it('"Start building" button is enabled when a variant is pre-selected', () => {
    render(<TemplateGallery onStart={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start building/i })).not.toBeDisabled()
  })

  it('calls onStart with the selected templateId when button is clicked', () => {
    const onStart = vi.fn()
    render(<TemplateGallery onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /start building/i }))
    expect(onStart).toHaveBeenCalledWith('classic-traditional')
  })

  it('updates selected variant when a different variant is clicked', () => {
    const onStart = vi.fn()
    render(<TemplateGallery onStart={onStart} />)
    // Classic family is expanded — click Academic
    fireEvent.click(screen.getByText('Academic'))
    fireEvent.click(screen.getByRole('button', { name: /start building/i }))
    expect(onStart).toHaveBeenCalledWith('classic-academic')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail with "module not found"**

```bash
cd frontend && npx vitest run src/__tests__/TemplateGallery.test.jsx 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '../components/wizard/TemplateGallery'`

- [ ] **Step 3: Create TemplateGallery.jsx**

Create `frontend/src/components/wizard/TemplateGallery.jsx`:

```jsx
import { useState } from 'react'
import { CATEGORIES, TEMPLATE_CONFIGS } from '../../registry/templateRegistry'
import { COMPONENT_MAP } from '../preview/ResumePreview'
import TemplatePreview from '../landing/TemplatePreview'
import { useResumeStore } from '../../store/useResumeStore'

const THUMBNAIL_CONTENT = {
  meta: { version: '1.0', updatedAt: '' },
  personal: {
    name: 'Alexandra Chen',
    title: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '(415) 555-0192',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    website: '',
    summary: 'Full-stack engineer with 7 years building scalable web applications and distributed systems.',
  },
  experience: [
    {
      id: '1', company: 'Stripe', role: 'Senior Software Engineer',
      location: 'San Francisco, CA', startDate: 'Mar 2021', endDate: '',
      current: true,
      bullets: [
        'Led delivery of a real-time analytics dashboard serving 50,000+ merchants',
        'Designed a distributed rate-limiting service handling 2M+ requests/second',
      ],
    },
    {
      id: '2', company: 'Airbnb', role: 'Software Engineer II',
      location: 'San Francisco, CA', startDate: 'Jun 2018', endDate: 'Feb 2021',
      current: false,
      bullets: ['Built the host payout system processing $120M+ in monthly transactions'],
    },
  ],
  education: [
    { id: '1', institution: 'Carnegie Mellon University', degree: 'M.S.', field: 'Computer Science', startDate: '2014', endDate: '2016', gpa: '3.9' },
  ],
  skills: [
    { id: '1', category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'Java'] },
    { id: '2', category: 'Frontend',  items: ['React', 'Next.js', 'GraphQL', 'CSS'] },
  ],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: '',
}

const FAMILY_ACCENT = {
  classic:   '#1a2744',
  modern:    '#1e3a5f',
  minimal:   '#555555',
  executive: '#1a1a1a',
  creative:  '#6c63ff',
}

const navy   = '#1a2744'
const orange = '#f47c20'
const border = '#d8d2c8'
const bg     = '#f0ebe2'
const bg2    = '#e8e3d8'

export default function TemplateGallery({ onStart }) {
  const currentTemplateId = useResumeStore(s => s.templateId)
  const setTemplateId     = useResumeStore(s => s.setTemplateId)

  const initialFamily = CATEGORIES.find(c =>
    c.templates.some(t => t.id === currentTemplateId)
  )?.id ?? null

  const [expandedFamily, setExpandedFamily] = useState(initialFamily)
  const [selectedId, setSelectedId]         = useState(currentTemplateId)

  function handleFamilyClick(familyId) {
    setExpandedFamily(prev => prev === familyId ? null : familyId)
  }

  function handleVariantClick(templateId) {
    setSelectedId(templateId)
    setTemplateId(templateId)
  }

  function handleStart() {
    if (selectedId) onStart(selectedId)
  }

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 48px 20px', background: bg2,
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: navy, letterSpacing: '-0.5px' }}>
            Resume<span style={{ color: orange }}>Forge</span>
          </div>
          <div style={{ fontSize: 13, color: '#7a7060', marginTop: 3 }}>
            Choose a template to get started
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={!selectedId}
          style={{
            background: selectedId ? navy : '#c8c2b8',
            color: '#fff', fontWeight: 700, fontSize: 14,
            padding: '10px 28px', borderRadius: 8, border: 'none',
            cursor: selectedId ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (selectedId) e.currentTarget.style.background = '#243560' }}
          onMouseLeave={e => { if (selectedId) e.currentTarget.style.background = navy }}
        >
          Start building →
        </button>
      </div>

      {/* Family cards */}
      <div style={{ flex: 1, padding: '32px 48px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          {CATEGORIES.map(family => {
            const isExpanded  = expandedFamily === family.id
            const hasSelected = family.templates.some(t => t.id === selectedId)
            return (
              <div
                key={family.id}
                onClick={() => handleFamilyClick(family.id)}
                style={{
                  flex: 1, border: `2px solid ${isExpanded || hasSelected ? navy : border}`,
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  background: '#fff', transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: isExpanded ? '0 4px 16px rgba(26,39,68,0.12)' : 'none',
                }}
              >
                <div style={{
                  height: 110, background: FAMILY_ACCENT[family.id],
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.15,
                    display: 'flex', flexDirection: 'column', gap: 6, padding: 12,
                  }}>
                    <div style={{ height: 12, background: '#fff', borderRadius: 2, width: '60%' }} />
                    <div style={{ height: 5,  background: '#fff', borderRadius: 2, width: '40%' }} />
                    <div style={{ height: 4,  background: '#fff', borderRadius: 2, width: '80%', marginTop: 6 }} />
                    <div style={{ height: 4,  background: '#fff', borderRadius: 2, width: '70%' }} />
                    <div style={{ height: 4,  background: '#fff', borderRadius: 2, width: '75%' }} />
                  </div>
                </div>
                <div style={{
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontWeight: 700, fontSize: 14,
                    color: isExpanded || hasSelected ? navy : '#7a7060',
                  }}>
                    {family.label}
                  </span>
                  <span style={{ color: '#a09080', fontSize: 11 }}>
                    {family.templates.length} styles
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Variant row */}
        {expandedFamily && (() => {
          const family = CATEGORIES.find(c => c.id === expandedFamily)
          if (!family) return null
          return (
            <div style={{
              background: '#fff', borderRadius: 12, padding: '20px 24px',
              border: `1px solid ${border}`,
              boxShadow: '0 2px 12px rgba(26,39,68,0.08)',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '1px',
                textTransform: 'uppercase', color: '#a09080', marginBottom: 16,
              }}>
                {family.label} Variants
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {family.templates.map(({ id, label }) => {
                  const tplConfig     = TEMPLATE_CONFIGS[id]
                  const paletteColors = tplConfig?.palettes?.[0]?.colors ?? {}
                  const Component     = COMPONENT_MAP[id]
                  const isSelected    = id === selectedId
                  return (
                    <div
                      key={id}
                      onClick={() => handleVariantClick(id)}
                      style={{
                        width: 160, flexShrink: 0, cursor: 'pointer',
                        border: `2px solid ${isSelected ? orange : border}`,
                        borderRadius: 10, overflow: 'hidden',
                        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                        boxShadow: isSelected ? '0 4px 16px rgba(244,124,32,0.20)' : 'none',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      <div style={{ height: 200, background: '#f8f8f8', overflow: 'hidden' }}>
                        {Component && (
                          <TemplatePreview
                            Component={Component}
                            paletteColors={paletteColors}
                            content={THUMBNAIL_CONTENT}
                          />
                        )}
                      </div>
                      <div style={{
                        padding: '8px 10px',
                        background: isSelected ? '#fff7ed' : '#fff',
                        borderTop: `1px solid ${isSelected ? '#fed7aa' : '#f1f0ee'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? orange : navy }}>
                          {label}
                        </span>
                        {isSelected && (
                          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                            <circle cx="8" cy="8" r="7" fill={orange} />
                            <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd frontend && npx vitest run src/__tests__/TemplateGallery.test.jsx 2>&1 | tail -20
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wizard/TemplateGallery.jsx frontend/src/__tests__/TemplateGallery.test.jsx
git commit -m "feat: add TemplateGallery component for wizard phase 1"
```

---

## Task 3: Rewrite WizardLayout (Phase 2 shell)

**Files:**
- Rewrite: `frontend/src/components/wizard/WizardLayout.jsx`
- Rewrite: `frontend/src/__tests__/WizardLayout.test.jsx`

- [ ] **Step 1: Replace WizardLayout tests**

Overwrite `frontend/src/__tests__/WizardLayout.test.jsx` with:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../store/useResumeStore', () => ({
  useResumeStore: (selector) => selector({
    content: {
      personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
      experience: [], education: [], skills: [], projects: [],
      certifications: [], languages: [], awards: [], custom: [],
      sectionOrder: ['personal'], _raw: '',
    },
    templateId: 'classic-traditional',
    paletteIndex: 0,
  }),
}))

vi.mock('../components/landing/TemplatePreview', () => ({
  default: () => <div data-testid="template-preview" />,
}))

vi.mock('../components/preview/ResumePreview', () => ({
  COMPONENT_MAP: { 'classic-traditional': () => <div /> },
}))

vi.mock('../registry/templateRegistry', () => ({
  TEMPLATE_CONFIGS: { 'classic-traditional': { palettes: [] } },
}))

import WizardLayout from '../components/wizard/WizardLayout'

const mockSteps = [
  { title: 'Personal',   component: () => <div>Personal Step</div>   },
  { title: 'Experience', component: () => <div>Experience Step</div> },
  { title: 'Education',  component: () => <div>Education Step</div>  },
]

describe('WizardLayout', () => {
  it('renders the active step component', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Personal Step')).toBeInTheDocument()
  })

  it('renders all step labels in the top bar', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('shows "Next →" on non-last steps', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('shows "Finish →" on the last step', () => {
    render(<WizardLayout steps={mockSteps} currentStep={2} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByText('Finish →')).toBeInTheDocument()
  })

  it('calls onNext when Next/Finish is clicked', () => {
    const onNext = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={onNext} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    fireEvent.click(screen.getByText('Next →'))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onStepClick with index for a completed step', () => {
    const onStepClick = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={2} onNext={vi.fn()} onStepClick={onStepClick} onChangeTemplate={vi.fn()} />)
    fireEvent.click(screen.getByText('Personal'))
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('does not call onStepClick for a future step', () => {
    const onStepClick = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={onStepClick} onChangeTemplate={vi.fn()} />)
    fireEvent.click(screen.getByText('Education'))
    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('calls onChangeTemplate when "Change template" is clicked', () => {
    const onChangeTemplate = vi.fn()
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={onChangeTemplate} />)
    fireEvent.click(screen.getByText('Change template'))
    expect(onChangeTemplate).toHaveBeenCalled()
  })

  it('renders the live preview panel', () => {
    render(<WizardLayout steps={mockSteps} currentStep={0} onNext={vi.fn()} onStepClick={vi.fn()} onChangeTemplate={vi.fn()} />)
    expect(screen.getByTestId('template-preview')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd frontend && npx vitest run src/__tests__/WizardLayout.test.jsx 2>&1 | tail -20
```

Expected: multiple failures (old component shape).

- [ ] **Step 3: Rewrite WizardLayout.jsx**

Overwrite `frontend/src/components/wizard/WizardLayout.jsx` with:

```jsx
import { useResumeStore } from '../../store/useResumeStore'
import { COMPONENT_MAP } from '../preview/ResumePreview'
import { TEMPLATE_CONFIGS } from '../../registry/templateRegistry'
import TemplatePreview from '../landing/TemplatePreview'

const navy   = '#1a2744'
const orange = '#f47c20'

export default function WizardLayout({ steps, currentStep, onNext, onStepClick, onChangeTemplate }) {
  const content       = useResumeStore(s => s.content)
  const templateId    = useResumeStore(s => s.templateId)
  const paletteIndex  = useResumeStore(s => s.paletteIndex)

  const step = steps[currentStep]
  if (!step) return <div>Invalid step</div>

  const isLast        = currentStep === steps.length - 1
  const tpl           = TEMPLATE_CONFIGS[templateId]
  const paletteColors = tpl?.palettes?.[paletteIndex]?.colors ?? {}
  const Component     = COMPONENT_MAP[templateId]

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: 'hidden', background: '#f8fafc',
    }}>
      {/* Top bar */}
      <div style={{
        height: 52, flexShrink: 0,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16,
      }}>
        {/* Change template button */}
        <button
          onClick={onChangeTemplate}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: '1px solid #e2e8f0',
            borderRadius: 7, padding: '4px 10px 4px 6px',
            cursor: 'pointer', flexShrink: 0,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <div style={{
            width: 24, height: 32, borderRadius: 3,
            overflow: 'hidden', flexShrink: 0, background: '#f1f5f9',
          }}>
            {Component && (
              <TemplatePreview Component={Component} paletteColors={paletteColors} content={content} />
            )}
          </div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            Change template
          </span>
        </button>

        {/* Step breadcrumb */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 2, overflow: 'hidden',
        }}>
          {steps.map((s, i) => {
            const done   = i < currentStep
            const active = i === currentStep
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                {i > 0 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
                <button
                  onClick={() => done && onStepClick && onStepClick(i)}
                  style={{
                    background: 'none', border: 'none', padding: '3px 7px',
                    borderRadius: 5, cursor: done ? 'pointer' : 'default',
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: done ? '#334155' : active ? navy : '#94a3b8',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {done && (
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#22c55e', color: '#fff',
                      fontSize: 9, fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      ✓
                    </span>
                  )}
                  {s.title}
                </button>
              </div>
            )
          })}
        </div>

        {/* Progress + Finish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 80, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              height: '100%', background: orange, borderRadius: 2,
              transition: 'width 0.3s',
            }} />
          </div>
          <button
            onClick={onNext}
            style={{
              background: isLast ? orange : navy, color: '#fff',
              fontWeight: 700, fontSize: 13, padding: '7px 20px',
              borderRadius: 7, border: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLast ? '#e06910' : '#243560'}
            onMouseLeave={e => e.currentTarget.style.background = isLast ? orange : navy}
          >
            {isLast ? 'Finish →' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: form */}
        <div style={{
          flex: '0 0 55%', overflowY: 'auto',
          padding: '28px 32px', borderRight: '1px solid #e2e8f0',
        }}>
          <step.component />
        </div>

        {/* Right: live preview */}
        <div style={{
          flex: '0 0 45%', overflow: 'hidden',
          background: '#f1f5f9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '24px 20px',
        }}>
          {Component ? (
            <div style={{
              width: '100%', maxWidth: 420,
              aspectRatio: '745 / 1054',
              boxShadow: '0 4px 24px rgba(15,23,42,0.14)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <TemplatePreview Component={Component} paletteColors={paletteColors} content={content} />
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>No preview available</div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd frontend && npx vitest run src/__tests__/WizardLayout.test.jsx 2>&1 | tail -20
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/wizard/WizardLayout.jsx frontend/src/__tests__/WizardLayout.test.jsx
git commit -m "feat: rewrite WizardLayout with top-bar breadcrumb and live preview panel"
```

---

## Task 4: Update BuildPage to orchestrate phases

**Files:**
- Rewrite: `frontend/src/pages/BuildPage.jsx`

- [ ] **Step 1: Rewrite BuildPage.jsx**

Overwrite `frontend/src/pages/BuildPage.jsx` with:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardLayout         from '../components/wizard/WizardLayout'
import PersonalInfoStep     from '../components/wizard/PersonalInfoStep'
import ExperienceStep       from '../components/wizard/ExperienceStep'
import EducationStep        from '../components/wizard/EducationStep'
import SkillsStep           from '../components/wizard/SkillsStep'
import OptionalSectionsStep from '../components/wizard/OptionalSectionsStep'
import TemplateGallery      from '../components/wizard/TemplateGallery'
import { useResumeStore }   from '../store/useResumeStore'

const STEPS = [
  { title: 'Personal',   component: PersonalInfoStep     },
  { title: 'Experience', component: ExperienceStep       },
  { title: 'Education',  component: EducationStep        },
  { title: 'Skills',     component: SkillsStep           },
  { title: 'Optional',   component: OptionalSectionsStep },
]

export default function BuildPage() {
  const [phase, setPhase]             = useState('gallery')
  const [currentStep, setCurrentStep] = useState(0)
  const navigate                      = useNavigate()
  const setTemplateId                 = useResumeStore(s => s.setTemplateId)

  function handleGalleryStart(templateId) {
    setTemplateId(templateId)
    setCurrentStep(0)
    setPhase('editor')
  }

  function handleNext() {
    if (currentStep === STEPS.length - 1) navigate('/preview')
    else setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function handleStepClick(index) {
    if (index < currentStep) setCurrentStep(index)
  }

  if (phase === 'gallery') {
    return <TemplateGallery onStart={handleGalleryStart} />
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onStepClick={handleStepClick}
      onChangeTemplate={() => setPhase('gallery')}
    />
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
cd frontend && npx vitest run 2>&1 | tail -30
```

Expected: all test suites PASS. The old `TemplatePickerStep.test.jsx` may emit warnings since the component still exists — that is fine.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BuildPage.jsx
git commit -m "feat: wire BuildPage to two-phase wizard flow (gallery → editor)"
```

---

## Task 5: Remove retired components

**Files:**
- Delete: `frontend/src/components/wizard/TemplatePickerStep.jsx`
- Delete: `frontend/src/components/wizard/PreviewStep.jsx`
- Delete: `frontend/src/__tests__/TemplatePickerStep.test.jsx`

- [ ] **Step 1: Delete the retired files**

```bash
rm frontend/src/components/wizard/TemplatePickerStep.jsx
rm frontend/src/components/wizard/PreviewStep.jsx
rm frontend/src/__tests__/TemplatePickerStep.test.jsx
```

- [ ] **Step 2: Run all tests to confirm nothing imports them**

```bash
cd frontend && npx vitest run 2>&1 | tail -20
```

Expected: all tests PASS, no import errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove retired TemplatePickerStep and PreviewStep"
```
