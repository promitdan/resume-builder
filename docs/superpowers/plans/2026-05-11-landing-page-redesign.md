# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current centered single-column `LandingPage.jsx` with a full-viewport split-panel redesign: light left panel (headline, feature grid, CTAs, How it works) + dark navy right panel (fan carousel of real template components).

**Architecture:** Three focused files — `TemplatePreview` scales any template component to its container, `FanCarousel` owns all carousel state and layout, `LandingPage` is pure layout assembly. Upload logic is inlined in `LandingPage` (hidden `<input>` + `handleFile`) since it's ~15 lines and avoids adding props to `UploadDropzone`.

**Tech Stack:** React 18, React Router v6, Zustand, inline styles (project convention), ResizeObserver (native browser API)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `frontend/src/components/landing/TemplatePreview.jsx` | Scales a 745×1054 template component to fit any container via ResizeObserver |
| Create | `frontend/src/components/landing/FanCarousel.jsx` | Fan carousel: state, auto-advance, 5 real template previews, arrows, dots |
| Rewrite | `frontend/src/pages/LandingPage.jsx` | Full-viewport split layout, nav, left panel, inline upload logic |

`UploadDropzone.jsx` — **not modified**, not used in new design (logic inlined).

---

## Task 1: TemplatePreview component

**Files:**
- Create: `frontend/src/components/landing/TemplatePreview.jsx`

- [ ] **Step 1: Create the file**

```jsx
// frontend/src/components/landing/TemplatePreview.jsx
import { useRef, useState, useEffect } from 'react'

const TEMPLATE_WIDTH  = 745
const TEMPLATE_HEIGHT = 1054

export default function TemplatePreview({ Component, paletteColors, content }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / TEMPLATE_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        width: TEMPLATE_WIDTH,
        height: TEMPLATE_HEIGHT,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <Component content={content} paletteColors={paletteColors} pageIndex={0} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/TemplatePreview.jsx
git commit -m "feat: add TemplatePreview component — scales template to container via ResizeObserver"
```

---

## Task 2: FanCarousel component

**Files:**
- Create: `frontend/src/components/landing/FanCarousel.jsx`

This component imports one template per family (5 total), defines the static sample resume data, manages carousel state, and renders the fan layout.

- [ ] **Step 1: Create the file**

```jsx
// frontend/src/components/landing/FanCarousel.jsx
import { useState, useEffect, useCallback } from 'react'
import TemplatePreview from './TemplatePreview'

import ClassicTemplate   from '../preview/templates/ClassicTemplate'
import ModernTemplate    from '../preview/templates/ModernTemplate'
import ExecutiveTemplate from '../preview/templates/ExecutiveTemplate'
import CreativeTemplate  from '../preview/templates/CreativeTemplate'
import MinimalTemplate   from '../preview/templates/MinimalTemplate'

import classicTpl    from '../../templates/classic.json'
import modernTpl     from '../../templates/modern.json'
import executiveTpl  from '../../templates/executive.json'
import creativeTpl   from '../../templates/creative.json'
import minimalTpl    from '../../templates/minimal.json'

const SAMPLE = {
  personal: {
    name: 'Alexandra Chen',
    title: 'Senior Software Engineer',
    email: 'alex.chen@example.com',
    phone: '+1 (415) 555-0192',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    website: 'alexchen.dev',
    summary: 'Full-stack engineer with 7 years building scalable web systems. Led cross-functional teams delivering high-impact products at Fortune 500 enterprises.',
  },
  experience: [
    {
      id: '1', company: 'Stripe', role: 'Senior Software Engineer',
      location: 'San Francisco, CA', startDate: 'Mar 2021', endDate: '', current: true,
      bullets: [
        'Built real-time analytics dashboard serving 50,000+ merchants, cutting load time 65%',
        'Designed distributed rate-limiting service handling 2M+ requests/second',
        'Mentored 4 junior engineers, reducing bug escape rate by 40%',
      ],
    },
    {
      id: '2', company: 'Airbnb', role: 'Software Engineer II',
      location: 'San Francisco, CA', startDate: 'Jun 2018', endDate: 'Feb 2021', current: false,
      bullets: [
        'Built host payout system processing $120M+ in monthly transactions',
        'Developed ML pricing algorithm increasing booking conversions by 18%',
        'Contributed to GraphQL API migration, reducing data-fetching overhead 45%',
      ],
    },
    {
      id: '3', company: 'Vertex Labs', role: 'Software Engineer',
      location: 'New York, NY', startDate: 'Jul 2016', endDate: 'May 2018', current: false,
      bullets: [
        'Grew core product from 0 to 10,000+ daily active users in 18 months',
        'Implemented CI/CD pipeline cutting deployment time from 2 hours to 12 minutes',
      ],
    },
  ],
  education: [
    { id: '1', institution: 'Carnegie Mellon University', degree: 'M.S.', field: 'Computer Science', startDate: '2014', endDate: '2016', gpa: '3.9' },
    { id: '2', institution: 'University of Michigan', degree: 'B.S.', field: 'Computer Science', startDate: '2010', endDate: '2014', gpa: '3.8' },
  ],
  skills: [
    { id: '1', category: 'Languages',  items: ['TypeScript', 'Python', 'Go', 'Java', 'SQL'] },
    { id: '2', category: 'Frontend',   items: ['React', 'Next.js', 'GraphQL', 'CSS/Sass'] },
    { id: '3', category: 'Backend',    items: ['Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'AWS'] },
    { id: '4', category: 'Tools',      items: ['Docker', 'Terraform', 'Datadog', 'GitHub Actions'] },
  ],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'skills', 'education'],
  _raw: '',
}

const TEMPLATES = [
  { name: 'Classic',   Component: ClassicTemplate,   config: classicTpl   },
  { name: 'Modern',    Component: ModernTemplate,    config: modernTpl    },
  { name: 'Executive', Component: ExecutiveTemplate, config: executiveTpl },
  { name: 'Creative',  Component: CreativeTemplate,  config: creativeTpl  },
  { name: 'Minimal',   Component: MinimalTemplate,   config: minimalTpl   },
]

const N = TEMPLATES.length

// Maps relative position (-2..2) to fan transform styles
const FAN_STYLE = {
  '-2': { transform: 'translateX(-29vh) translateY(4vh) rotate(-14deg) scale(0.60)', filter: 'blur(5px)', zIndex: 1,  boxShadow: '0 6px 20px rgba(0,0,0,0.45)',  cursor: 'pointer' },
  '-1': { transform: 'translateX(-16vh) translateY(2vh) rotate(-7deg)  scale(0.78)', filter: 'blur(3px)', zIndex: 3,  boxShadow: '0 12px 36px rgba(0,0,0,0.55)', cursor: 'pointer' },
  '0':  { transform: 'translateX(0)     translateY(0)   rotate(0deg)   scale(1)',    filter: 'none',       zIndex: 5,  boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(244,124,32,0.4)', cursor: 'default' },
  '1':  { transform: 'translateX(16vh)  translateY(2vh) rotate(7deg)   scale(0.78)', filter: 'blur(3px)', zIndex: 3,  boxShadow: '0 12px 36px rgba(0,0,0,0.55)', cursor: 'pointer' },
  '2':  { transform: 'translateX(29vh)  translateY(4vh) rotate(14deg)  scale(0.60)', filter: 'blur(5px)', zIndex: 1,  boxShadow: '0 6px 20px rgba(0,0,0,0.45)',  cursor: 'pointer' },
}

function getPos(i, current) {
  let rel = ((i - current) % N + N) % N
  if (rel > Math.floor(N / 2)) rel -= N
  return rel  // guaranteed -2..2 for N=5
}

export default function FanCarousel() {
  const [current, setCurrent] = useState(2)  // start on Executive
  const [tplName, setTplName] = useState(TEMPLATES[2].name)

  const goTo = useCallback((idx) => {
    const next = ((idx % N) + N) % N
    setCurrent(next)
    setTplName(TEMPLATES[next].name)
  }, [])

  const move = useCallback((dir) => goTo(current + dir), [current, goTo])

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => move(1), 3500)
    return () => clearInterval(timer)
  }, [move])

  const arrowBtn = (label, onClick) => (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#6b7a99', fontSize: 22, cursor: 'pointer', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, color 0.15s',
        left: label === '‹' ? 16 : undefined,
        right: label === '›' ? 16 : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#6b7a99' }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      background: '#111827', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(244,124,32,0.10) 0%, transparent 70%)',
      }} />

      {/* Template name */}
      <div style={{
        position: 'absolute', top: 20, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: '#4a5578', textTransform: 'uppercase' }}>Template</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f47c20' }}>{tplName}</span>
      </div>

      {/* Fan stage */}
      <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {arrowBtn('‹', () => move(-1))}

        {TEMPLATES.map(({ Component, config, name }, i) => {
          const pos = getPos(i, current)
          const posStyle = FAN_STYLE[String(pos)]
          const paletteColors = config.palettes?.[0]?.colors ?? {}

          return (
            <div
              key={name}
              onClick={() => pos !== 0 && goTo(i)}
              style={{
                position: 'absolute',
                height: '75%',
                aspectRatio: '0.707',
                borderRadius: 6,
                overflow: 'hidden',
                opacity: 1,
                transition: 'transform 0.55s cubic-bezier(0.34, 1.1, 0.64, 1), filter 0.45s ease, box-shadow 0.45s ease',
                willChange: 'transform, filter',
                ...posStyle,
              }}
            >
              <TemplatePreview Component={Component} paletteColors={paletteColors} content={SAMPLE} />
            </div>
          )
        })}

        {arrowBtn('›', () => move(1))}
      </div>

      {/* Dot indicators */}
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', gap: 7, justifyContent: 'center', zIndex: 10 }}>
        {TEMPLATES.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 6, height: 6, borderRadius: '50%', cursor: 'pointer',
              background: i === current ? '#f47c20' : 'rgba(255,255,255,0.2)',
              transform: i === current ? 'scale(1.4)' : 'scale(1)',
              transition: 'background 0.2s, transform 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/FanCarousel.jsx
git commit -m "feat: add FanCarousel with real template previews, auto-advance, dots"
```

---

## Task 3: Rewrite LandingPage

**Files:**
- Rewrite: `frontend/src/pages/LandingPage.jsx`

This is the full page assembly: nav, left panel, and `FanCarousel` on the right. The "Upload & edit" secondary CTA uses a hidden `<input type="file">` and inlines the upload logic.

- [ ] **Step 1: Rewrite the file**

```jsx
// frontend/src/pages/LandingPage.jsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useResumeStore } from '../store/useResumeStore'
import FanCarousel from '../components/landing/FanCarousel'

// ── Inline SVG logo icon ──────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
      <path d="M6 28 Q18 33 30 28 L28 34 Q18 38 8 34Z" fill="#1a2744"/>
      <rect x="10" y="18" width="16" height="12" rx="2" fill="#1a2744"/>
      <rect x="11" y="5" width="14" height="18" rx="2" fill="white" stroke="#1a2744" strokeWidth="1.5"/>
      <circle cx="16" cy="10" r="2.2" fill="#2d7dd2"/>
      <line x1="13" y1="14" x2="23" y2="14" stroke="#1a2744" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="13" y1="17" x2="20" y2="17" stroke="#f47c20" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="25" y1="21" x2="32" y2="16" stroke="#f47c20" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="25" y1="21" x2="33" y2="21" stroke="#f5a623" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="25" y1="21" x2="29" y2="14" stroke="#f47c20" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Feature grid SVG icons ───────────────────────────────────────────────────
const FEATURES = [
  {
    name: '17 Templates',
    sub: '5 style families',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#1a2744"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#1a2744" opacity="0.35"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#1a2744" opacity="0.35"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#f47c20"/>
      </svg>
    ),
  },
  {
    name: 'AI Editing',
    sub: 'Smart suggestions',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <path d="M10 2L11.5 7H17L12.8 10.2L14.3 15.2L10 12L5.7 15.2L7.2 10.2L3 7H8.5L10 2Z" fill="#f47c20"/>
      </svg>
    ),
  },
  {
    name: 'PDF & DOCX',
    sub: 'One-click export',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="4" y="2" width="12" height="14" rx="2" stroke="#1a2744" strokeWidth="1.5"/>
        <path d="M10 8v5M7.5 11l2.5 2.5 2.5-2.5" stroke="#f47c20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="7" y1="6" x2="13" y2="6" stroke="#1a2744" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    name: 'Fully Private',
    sub: 'No account needed',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="4" y="9" width="12" height="9" rx="2" fill="#1a2744"/>
        <path d="M7 9V6a3 3 0 016 0v3" stroke="#1a2744" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="14" r="1.5" fill="#f47c20"/>
      </svg>
    ),
  },
]

const HIW_STEPS = [
  { title: 'Build or upload',  desc: 'Start fresh or drop in a PDF/DOCX — AI parses it instantly.' },
  { title: 'Pick a template',  desc: '17 templates, 5 families. Swap colors and fonts anytime.'     },
  { title: 'Export & apply',   desc: 'One-click PDF or DOCX. No watermarks, no paywall.'            },
]

// ── Loading overlay (shown while AI parses the uploaded file) ─────────────────
function UploadingOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 48px', textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🤖</div>
        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: '#0f172a' }}>Parsing your resume…</p>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
          AI is reading your document.<br />This may take up to a minute.
        </p>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '40%', background: '#f47c20', borderRadius: 2,
            animation: 'rf-slide 1.4s ease-in-out infinite',
          }} />
        </div>
      </div>
      <style>{`@keyframes rf-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate    = useNavigate()
  const setContent  = useResumeStore(s => s.setContent)
  const loadMockData = useResumeStore(s => s.loadMockData)
  const uploadRef   = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setUploadError('Only PDF and DOCX files are supported.')
      return
    }
    setUploadError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post('/api/upload', form)
      setContent(res.data.content)
      navigate('/preview')
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to parse file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleBuild() {
    loadMockData()
    navigate('/build')
  }

  // Colour shortcuts
  const navy   = '#1a2744'
  const orange = '#f47c20'
  const muted  = '#6b7a99'
  const border = '#e4e7ee'
  const bg     = '#f8f9fb'

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, sans-serif", background: bg, color: navy }}>

      {uploading && <UploadingOverlay />}

      {/* ── Navbar ── */}
      <nav style={{
        flexShrink: 0, height: 60, display: 'flex', alignItems: 'center',
        padding: '0 48px', background: 'rgba(248,249,251,0.97)',
        borderBottom: `1px solid ${border}`, zIndex: 100,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoIcon />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: 12, color: navy }}>Resume</span>
            <span style={{ fontWeight: 800, fontSize: 12, color: orange }}>Forge</span>
          </div>
        </a>
        <div style={{ display: 'flex', gap: 28, marginLeft: 36 }}>
          {['Templates', 'How it works'].map(l => (
            <a key={l} href="#" style={{ color: muted, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#a0aabf', textTransform: 'uppercase', marginRight: 20 }}>
          Craft · Refine · Get Hired
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="#" style={{ color: muted, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Sign in</a>
          <a href="#" style={{ background: navy, color: '#fff', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 7, textDecoration: 'none' }}>
            Get started free
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>

        {/* Left panel */}
        <div style={{
          padding: '44px 52px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', background: bg,
          borderRight: `1px solid ${border}`, overflow: 'hidden',
        }}>

          {/* Badge + headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff3e0', color: '#b45309', border: '1px solid #fed7aa',
              fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 20,
              width: 'fit-content', letterSpacing: '0.4px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: orange, flexShrink: 0, display: 'inline-block' }} />
              AI-powered · No sign-up required
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(30px, 3vw, 46px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1.5px', color: navy }}>
                Forge a resume<br />that gets you <em style={{ fontStyle: 'normal', color: orange }}>hired</em>
              </h1>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#a0aabf', textTransform: 'uppercase' }}>
                Craft. &nbsp;Refine. &nbsp;Get Hired.
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FEATURES.map(({ name, sub, icon }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#fff', border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#f1f4f9',
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: navy }}>{name}</div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleBuild}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: navy, color: '#fff', fontSize: 14, fontWeight: 700,
                padding: '12px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#243560'}
              onMouseLeave={e => e.currentTarget.style.background = navy}
            >
              Build my resume →
            </button>
            <button
              onClick={() => uploadRef.current?.click()}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'transparent', color: navy, fontSize: 14, fontWeight: 600,
                padding: '12px 16px', borderRadius: 9, border: `1.5px solid ${border}`, cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = navy}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              📄 Upload &amp; edit
            </button>
            <input
              ref={uploadRef} type="file" accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          {uploadError && (
            <p style={{ margin: 0, color: '#ef4444', fontSize: 13, fontWeight: 500 }}>{uploadError}</p>
          )}

          {/* How it works */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', color: '#a0aabf', textTransform: 'uppercase' }}>
              How it works
            </div>
            <div style={{ display: 'flex' }}>
              {HIW_STEPS.map(({ title, desc }, idx) => (
                <div key={title} style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: idx < 2 ? 12 : 0 }}>
                  {/* Circle row — connector is the flex space after the circle */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: navy, color: '#fff', fontSize: 13, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {idx + 1}
                    </div>
                    {idx < 2 && (
                      <div style={{ flex: 1, height: 1, background: border, marginLeft: 8 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: muted, lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div style={{ display: 'flex', gap: 20, paddingTop: 4, borderTop: `1px solid ${border}` }}>
            {['Free forever', 'No account needed', 'Nothing stored on our servers'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: muted }}>
                <span style={{ color: orange, fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — fan carousel */}
        <FanCarousel />

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify in browser**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` (or whatever port Vite uses). Check:
- Page fills viewport with no scrollbar
- Left panel has: badge, headline in navy/orange, 2×2 feature grid with icons, two CTAs, How It Works (circles + lines not striking through titles), trust strip
- Right panel shows dark navy background with 5 fan cards; active card is sharp, flanking cards are blurred
- Auto-advance cycles through templates every 3.5s
- Clicking a side card brings it to the front
- Arrows work
- "Build my resume" navigates to `/build`
- "Upload & edit" opens OS file dialog; uploading a PDF/DOCX shows loading overlay then navigates to `/preview`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LandingPage.jsx
git commit -m "feat: redesign landing page — split viewport, feature grid, fan carousel with real templates"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|-------------|------|
| Navy #1a2744 + Orange #f47c20 colour palette | Task 3 (inline colours) |
| 50/50 split viewport, no scroll | Task 3 (`height: 100vh; overflow: hidden; grid 1fr 1fr`) |
| Badge → H1 + tagline → features → CTAs → HIW → trust | Task 3 (left panel JSX) |
| 2×2 feature grid with icons | Task 3 (`FEATURES` array + grid layout) |
| Side-by-side CTAs (primary=build, secondary=upload) | Task 3 (CTA row + hidden input) |
| HIW: circles not striking through titles | Task 3 (connector is a `<div>` flex child, not `::after` pseudo) |
| Trust strip | Task 3 |
| Dark navy right panel with fan carousel | Tasks 2 + 3 |
| Fan cards at `height: 75%; aspect-ratio: 0.707` | Task 2 (`FAN_STYLE` + card style) |
| Active card sharp, flanking cards blurred (not opacity) | Task 2 (`filter: blur(3px/5px)`, `opacity: 1` everywhere) |
| `translateX` in `vh` units so geometry scales with viewport | Task 2 (`FAN_STYLE` values use `vh`) |
| Real template components in cards | Tasks 1 + 2 (`TemplatePreview` + `TEMPLATES`) |
| Static sample data (same as `TemplateThumbnailPage`) | Task 2 (`SAMPLE` constant) |
| First palette colours per template | Task 2 (`config.palettes?.[0]?.colors ?? {}`) |
| Auto-advance every 3.5s | Task 2 (`setInterval`) |
| Click side card to navigate | Task 2 (`onClick={() => pos !== 0 && goTo(i)}`) |
| Arrow buttons | Task 2 (`arrowBtn` helper) |
| Dot indicators | Task 2 (dot row at bottom) |
| Template name label | Task 2 (top of right panel) |
| Logo SVG (anvil + document) | Task 3 (`LogoIcon` component) |
| Nav: Templates, How it works links, tagline, Sign in, Get started free | Task 3 (nav JSX) |
| Loading overlay during upload | Task 3 (`UploadingOverlay`, shown when `uploading === true`) |

### Placeholder Scan

No TBDs, no "similar to Task N" references, no incomplete code blocks.

### Type Consistency

- `SAMPLE` shape matches `useResumeStore` content schema (confirmed from `TemplateThumbnailPage.jsx`)
- `TemplatePreview` props: `{ Component, paletteColors, content }` — used identically in `FanCarousel`
- `goTo(idx)` used in arrow click `move(dir)`, dot click `goTo(i)`, card click `goTo(i)` — all consistent
- `config.palettes?.[0]?.colors ?? {}` — same pattern as `TemplateThumbnailPage`
