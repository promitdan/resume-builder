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
          type="button"
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
            type="button"
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
