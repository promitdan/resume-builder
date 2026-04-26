import { useResumeStore } from '../../store/useResumeStore'
import { CATEGORIES } from '../../registry/templateRegistry'

export default function TemplateSwitcher() {
  const templateId    = useResumeStore(s => s.templateId)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {CATEGORIES.map(({ id: catId, label: catLabel, templates }) => (
        <div key={catId}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: '5px' }}>
            {catLabel}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {templates.map(({ id, label }) => {
              const active = templateId === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplateId(id)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    background: active ? '#eff6ff' : 'transparent',
                    border: `1.5px solid ${active ? '#3b82f6' : 'transparent'}`,
                    color: active ? '#2563eb' : '#475569',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
