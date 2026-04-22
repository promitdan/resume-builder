import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = [
  { id: 'classic',   label: 'Classic'   },
  { id: 'modern',    label: 'Modern'    },
  { id: 'minimal',   label: 'Minimal'   },
  { id: 'executive', label: 'Executive' },
  { id: 'creative',  label: 'Creative'  },
]

export default function TemplateSwitcher() {
  const templateId    = useResumeStore(s => s.templateId)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {TEMPLATES.map(({ id, label }) => {
        const active = templateId === id
        return (
          <button key={id} type="button" onClick={() => setTemplateId(id)}
            style={{
              padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
              background: active ? '#eff6ff' : '#fff',
              border: `1.5px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
              color: active ? '#3b82f6' : '#334155',
            }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}
