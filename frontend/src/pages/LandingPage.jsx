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
            <Link to="/build" style={{ textDecoration: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '15px', padding: '12px 24px', borderRadius: '8px', display: 'inline-block' }}
              onMouseEnter={e => e.target.style.background='#2563eb'}
              onMouseLeave={e => e.target.style.background='#3b82f6'}>
              Start from scratch →
            </Link>
            <button
              onClick={() => setShowUpload(v => !v)}
              style={{ background: '#fff', color: '#334155', fontWeight: 600, fontSize: '15px', padding: '12px 24px', borderRadius: '8px', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
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
