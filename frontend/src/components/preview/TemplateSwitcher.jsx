import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = ['classic', 'modern', 'minimal', 'executive', 'creative']

export default function TemplateSwitcher() {
  const templateId    = useResumeStore((s) => s.templateId)
  const setTemplateId = useResumeStore((s) => s.setTemplateId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {TEMPLATES.map((t) => (
        <button key={t} onClick={() => setTemplateId(t)}
          style={{ padding: '8px 14px', borderRadius: '6px', border: templateId === t ? '2px solid #6c63ff' : '1px solid #ddd', background: templateId === t ? '#6c63ff' : '#fff', color: templateId === t ? '#fff' : '#333', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', textAlign: 'left' }}>
          {t}
        </button>
      ))}
    </div>
  )
}
