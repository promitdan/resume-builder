// frontend/src/pages/LandingPage.jsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useResumeStore } from '../store/useResumeStore'
import FanCarousel from '../components/landing/FanCarousel'

function LogoIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
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

const FEATURES = [
  {
    name: '17+ Templates',
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
    name: 'AI-Powered Editing',
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
    name: '100% Private',
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
  {
    title: 'Build or upload',
    desc: 'Start fresh or upload your existing resume. AI parses it instantly.',
    Icon: ({ size = 22 }) => (
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#1a2744" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 15V4" stroke="#f47c20" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 8l4-4 4 4" stroke="#f47c20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Choose a template',
    desc: 'Pick from 17+ templates. Customize colors, fonts and layout.',
    Icon: ({ size = 22 }) => (
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <rect x="3" y="3" width="8" height="11" rx="1.5" stroke="#1a2744" strokeWidth="1.8"/>
        <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="#f47c20" strokeWidth="1.8"/>
        <rect x="13" y="10" width="8" height="4" rx="1.5" stroke="#1a2744" strokeWidth="1.5" opacity="0.4"/>
        <rect x="3" y="16" width="18" height="4" rx="1.5" stroke="#1a2744" strokeWidth="1.5" opacity="0.3"/>
      </svg>
    ),
  },
  {
    title: 'Export & apply',
    desc: 'Download PDF or DOCX in one click. No watermarks. No paywall.',
    Icon: ({ size = 22 }) => (
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#1a2744" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 4v11" stroke="#f47c20" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 11l4 4 4-4" stroke="#f47c20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

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

export default function LandingPage() {
  const navigate     = useNavigate()
  const setContent   = useResumeStore(s => s.setContent)
  const loadMockData = useResumeStore(s => s.loadMockData)
  const uploadRef    = useRef(null)
  const [uploading, setUploading]     = useState(false)
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

  const navy   = '#1a2744'
  const orange = '#f47c20'
  const muted  = '#6b7a99'
  const border = '#e4e7ee'
  const bg     = '#f8f9fb'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, sans-serif", background: bg, color: navy }}>

      {uploading && <UploadingOverlay />}

      {/* Hero — full viewport */}
      <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '5fr 7fr' }}>

        <div style={{
          padding: '36px 48px', display: 'flex', flexDirection: 'column',
          gap: '30px', background: bg,
          borderRight: `1px solid ${border}`, overflow: 'hidden',
        }}>

          {/* Branding */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', width: 'fit-content' }}>
            <LogoIcon size={100} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontWeight: 800, fontSize: 24, color: navy }}>Resume</span>
              <span style={{ fontWeight: 800, fontSize: 24, color: orange }}>Forge</span>
            </div>
          </a>

          {/* Badge + Headline + Subline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 0,
              background: '#fff3e0', border: '1px solid #fed7aa',
              fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
              width: 'fit-content',
            }}>
              <span style={{ color: orange, marginRight: 5, fontSize: 13 }}>⚡</span>
              <span style={{ color: orange, letterSpacing: '0.6px' }}>AI-POWERED</span>
              <span style={{ color: '#c9a87a', margin: '0 6px' }}>·</span>
              <span style={{ color: '#a07840', letterSpacing: '0.4px' }}>NO SIGN-UP REQUIRED</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(26px, 2.8vw, 42px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1.5px', color: navy }}>
                Forge a resume<br />that gets you <em style={{ fontStyle: 'normal', color: orange }}>hired</em>
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: muted, lineHeight: 1.6, maxWidth: 400 }}>
                Create a professional resume in minutes. AI-powered suggestions, stunning templates, and one-click export.
              </p>
            </div>
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FEATURES.map(({ name, sub, icon }) => (
              <div
                key={name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#fff', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 12px',
                  transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = orange
                  e.currentTarget.style.boxShadow = `0 4px 18px rgba(244,124,32,0.12)`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = border
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleBuild}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: navy, color: '#fff', fontSize: 14, fontWeight: 700,
                  padding: '11px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
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
                  padding: '11px 16px', borderRadius: 9, border: `1.5px solid ${border}`, cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = navy}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}
              >
                <svg viewBox="0 0 20 20" fill="none" width="15" height="15" style={{ flexShrink: 0 }}>
                  <path d="M3 13v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M10 12V4M7 7l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload &amp; edit
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
          </div>

          {/* How it works */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#a0aabf', textTransform: 'uppercase' }}>
              How it works
            </div>
            <div style={{ display: 'flex' }}>
              {HIW_STEPS.map(({ title, desc, Icon }, idx) => (
                <div key={title} style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: idx < 2 ? 14 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: '#eef1f7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={22} />
                      </div>
                      <div style={{
                        position: 'absolute', top: -3, right: -3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: orange, color: '#fff',
                        fontSize: 9, fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 2px #f8f9fb',
                      }}>
                        {idx + 1}
                      </div>
                    </div>
                    {idx < 2 && (
                      <div style={{ flex: 1, height: 0, borderTop: '1.5px dashed #d0d5e4', marginLeft: 10 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 11, color: muted, lineHeight: 1.55 }}>{desc}</div>
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

        <FanCarousel />

      </div>

    </div>
  )
}
