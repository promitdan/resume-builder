import { useResumeStore } from '../../store/useResumeStore'
import ResumePreview from '../preview/ResumePreview'

export default function PreviewStep() {
  const content    = useResumeStore((s) => s.content)
  const templateId = useResumeStore((s) => s.templateId)

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        This is how your resume looks. Click Finish to go to the download page.
      </p>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <ResumePreview content={content} templateId={templateId} />
      </div>
    </div>
  )
}
