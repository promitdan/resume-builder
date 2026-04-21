import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   desc: 'Centered header, serif. ATS-safe.' },
  { id: 'modern',    name: 'Modern',    desc: 'Two-column sidebar. Great for tech.' },
  { id: 'minimal',   name: 'Minimal',   desc: 'Spacious, clean, premium feel.' },
  { id: 'executive', name: 'Executive', desc: 'Dark bold header. Senior roles.' },
  { id: 'creative',  name: 'Creative',  desc: 'Gradient header, pill skill tags.' }
]

export default function TemplatePickerStep() {
  const templateId    = useResumeStore((s) => s.templateId)
  const setTemplateId = useResumeStore((s) => s.setTemplateId)

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '24px' }}>Choose a style — you can change it anytime on the preview page.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        {TEMPLATES.map((t) => (
          <div key={t.id} data-template={t.id} onClick={() => setTemplateId(t.id)}
            style={{ border: templateId === t.id ? '3px solid #6c63ff' : '1px solid #ddd', borderRadius: '8px', padding: '14px', cursor: 'pointer', background: templateId === t.id ? '#f8f7ff' : '#fff', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ width: '100%', height: '90px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#aaa' }}>
              Preview
            </div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: templateId === t.id ? '#6c63ff' : '#1a1a2e' }}>{t.name}</h4>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#888', lineHeight: 1.4 }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
