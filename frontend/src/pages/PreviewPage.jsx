import { useNavigate } from 'react-router-dom'
import { useResumeStore } from '../store/useResumeStore'
import ResumePreview from '../components/preview/ResumePreview'
import TemplateSwitcher from '../components/preview/TemplateSwitcher'
import DownloadButtons from '../components/shared/DownloadButtons'

export default function PreviewPage() {
  const content    = useResumeStore((s) => s.content)
  const templateId = useResumeStore((s) => s.templateId)
  const navigate   = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Resume Preview</h1>
          <button onClick={() => navigate('/build')}
            style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            Back to Edit
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '28px', alignItems: 'start' }}>
          <div style={{ overflow: 'auto' }}>
            <ResumePreview content={content} templateId={templateId} />
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem' }}>Template</h3>
            <TemplateSwitcher />
            <h3 style={{ margin: '20px 0 14px 0', fontSize: '1rem' }}>Download</h3>
            <DownloadButtons />
          </div>
        </div>
      </div>
    </div>
  )
}
