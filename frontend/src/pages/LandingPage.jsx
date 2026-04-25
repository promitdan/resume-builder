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
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', flex: 1 }}>Step-by-step guided builder</div>
              <Link
                to="/build"
                style={{ display: 'block', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '11px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
              >
                Start from scratch →
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
