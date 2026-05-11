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
    iconBg: '#ede9fe',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#7c3aed"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#7c3aed" opacity="0.4"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#7c3aed" opacity="0.4"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#7c3aed"/>
      </svg>
    ),
  },
  {
    name: 'AI-Powered Editing',
    sub: 'Smart suggestions',
    iconBg: '#fff7ed',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <path d="M10 2L11.5 7H17L12.8 10.2L14.3 15.2L10 12L5.7 15.2L7.2 10.2L3 7H8.5L10 2Z" fill="#f47c20"/>
      </svg>
    ),
  },
  {
    name: 'PDF & DOCX',
    sub: 'One-click export',
    iconBg: '#dcfce7',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="4" y="2" width="12" height="14" rx="2" stroke="#16a34a" strokeWidth="1.5"/>
        <path d="M10 7v5M7.5 10l2.5 2.5 2.5-2.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="7" y1="5" x2="13" y2="5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    name: '100% Private',
    sub: 'No account needed',
    iconBg: '#dbeafe',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="4" y="9" width="12" height="9" rx="2" fill="#2563eb"/>
        <path d="M7 9V6a3 3 0 016 0v3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="14" r="1.5" fill="#fff"/>
      </svg>
    ),
  },
]

const HIW_STEPS = [
  {
    title: 'Build or upload',
    desc: 'Start fresh or upload your existing resume. AI parses it instantly.',
    circleBg: '#ede9fe',
    badgeColor: '#7c3aed',
    Icon: ({ size = 22 }) => (
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 15V4" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 8l4-4 4 4" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Choose a template',
    desc: 'Pick from 17+ templates. Customize colors, fonts and layout.',
    circleBg: '#fff7ed',
    badgeColor: '#f47c20',
    Icon: ({ size = 22 }) => (
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <rect x="3" y="3" width="8" height="11" rx="1.5" stroke="#f47c20" strokeWidth="1.8"/>
        <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="#f47c20" strokeWidth="1.8"/>
        <rect x="13" y="10" width="8" height="4" rx="1.5" stroke="#f47c20" strokeWidth="1.5" opacity="0.5"/>
        <rect x="3" y="16" width="18" height="4" rx="1.5" stroke="#f47c20" strokeWidth="1.5" opacity="0.4"/>
      </svg>
    ),
  },
  {
    title: 'Export & apply',
    desc: 'Download PDF or DOCX in one click. No watermarks. No paywall.',
    circleBg: '#ccfbf1',
    badgeColor: '#0d9488',
    Icon: ({ size = 22 }) => (
      <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 4v11" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 11l4 4 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
    navigate('/build')
  }

  function handleLoadMock() {
    loadMockData()
    navigate('/build')
  }

  const navy   = '#1a2744'
  const orange = '#f47c20'
  const muted  = '#7a7060'
  const border = '#d8d2c8'
  const bg     = '#f0ebe2'
  const bg2    = '#e8e3d8'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, sans-serif", background: bg, color: navy }}>

      {uploading && <UploadingOverlay />}

      {/* Hero — full viewport */}
      <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '7fr 10fr' }}>

        <div style={{
          padding: '28px 40px', display: 'flex', flexDirection: 'column',
          gap: '18px', background: bg2,
          borderRight: `1px solid ${border}`, overflow: 'hidden',
        }}>

          {/* Branding */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', width: 'fit-content' }}>
            <LogoIcon size={72} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: navy }}>Resume</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: orange }}>Forge</span>
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
            {FEATURES.map(({ name, sub, icon, iconBg }) => (
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
                  background: iconBg,
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

              {/* Upload card */}
              <div
                onClick={() => uploadRef.current?.click()}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
                  background: '#fff', borderRadius: 12, padding: '14px 14px 12px',
                  border: `1.5px solid ${border}`, cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: '0 1px 4px rgba(26,39,68,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#a09080'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,39,68,0.10)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = border
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,39,68,0.06)'
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                        <path d="M3 13v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round"/>
                        <path d="M10 12V4M7 7l3-3 3 3" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: navy }}>Upload existing resume</span>
                  </div>
                  <span style={{ fontSize: 10, color: muted, background: bg, borderRadius: 20, padding: '2px 7px', border: `1px solid ${border}` }}>~5 sec</span>
                </div>
                {/* Description */}
                <p style={{ margin: 0, fontSize: 10.5, color: muted, lineHeight: 1.5 }}>
                  AI parses your PDF or DOCX, then improves structure and keywords.
                </p>
                {/* Drop zone */}
                <div style={{
                  border: `1.5px dashed ${border}`, borderRadius: 8,
                  background: bg, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '12px 8px', gap: 4,
                }}>
                  <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
                    <rect x="6" y="2" width="20" height="28" rx="3" fill="#fff" stroke={border} strokeWidth="1.5"/>
                    <path d="M11 10h10M11 14h10M11 18h6" stroke={border} strokeWidth="1.2" strokeLinecap="round"/>
                    <rect x="16" y="18" width="12" height="12" rx="3" fill="#dcfce7"/>
                    <path d="M22 22v4M20 24h4" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <div style={{ fontSize: 11, fontWeight: 600, color: navy, textAlign: 'center' }}>Drop PDF or DOCX here</div>
                  <div style={{ fontSize: 10, color: muted }}>or click to browse — max 10 MB</div>
                </div>
              </div>

              {/* Build card */}
              <div
                onClick={handleBuild}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
                  background: '#fff', borderRadius: 12, padding: '14px 14px 12px',
                  border: `1.5px solid ${border}`, cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: '0 1px 4px rgba(26,39,68,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#a09080'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,39,68,0.10)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = border
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,39,68,0.06)'
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                        <path d="M4 4h12v12H4z" stroke={orange} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                        <path d="M7 8h6M7 11h4" stroke={orange} strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: navy }}>Start from scratch</span>
                  </div>
                  <span style={{ fontSize: 10, color: muted, background: bg, borderRadius: 20, padding: '2px 7px', border: `1px solid ${border}` }}>~4 min</span>
                </div>
                {/* Description */}
                <p style={{ margin: 0, fontSize: 10.5, color: muted, lineHeight: 1.5 }}>
                  Step-by-step wizard with prompts that strengthen each bullet point.
                </p>
                {/* Steps preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '2px 0' }}>
                  {['Fill in your details', 'Pick a template', 'Export PDF or DOCX'].map((label, i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: i === 0 ? orange : bg2,
                        color: i === 0 ? '#fff' : muted,
                        fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: bg2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: i === 0 ? orange : i === 1 ? `${orange}55` : 'transparent',
                          width: i === 0 ? '70%' : i === 1 ? '40%' : '0%',
                        }} />
                      </div>
                      <span style={{ fontSize: 9.5, color: i === 0 ? navy : muted, fontWeight: i === 0 ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                    </div>
                  ))}
                </div>
                {/* CTA button */}
                <button
                  onClick={handleBuild}
                  style={{
                    width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                    background: navy, color: '#fff', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', marginTop: 2,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#243560'}
                  onMouseLeave={e => e.currentTarget.style.background = navy}
                >
                  Start building →
                </button>
                {import.meta.env.DEV && (
                  <button
                    onClick={handleLoadMock}
                    style={{
                      width: '100%', padding: '7px', borderRadius: 8,
                      border: `1.5px dashed ${border}`,
                      background: 'transparent', color: muted, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = navy; e.currentTarget.style.color = navy }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}
                  >
                    🧪 Test with mock data
                  </button>
                )}
              </div>

              <input ref={uploadRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            {uploadError && <p style={{ margin: 0, color: '#ef4444', fontSize: 13, fontWeight: 500 }}>{uploadError}</p>}
          </div>

          {/* How it works */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#a0aabf', textTransform: 'uppercase' }}>
              How it works
            </div>
            <div style={{ display: 'flex' }}>
              {HIW_STEPS.map(({ title, desc, Icon, circleBg, badgeColor }, idx) => (
                <div key={title} style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: idx < 2 ? 14 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: circleBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={22} />
                      </div>
                      <div style={{
                        position: 'absolute', top: -3, right: -3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: badgeColor, color: '#fff',
                        fontSize: 9, fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 2px #e8e3d8',
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
