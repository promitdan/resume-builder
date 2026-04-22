import { useResumeStore } from '../../store/useResumeStore'

const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   desc: 'Centered header, serif. ATS-friendly.',       accent: '#1a1a2e' },
  { id: 'modern',    name: 'Modern',    desc: 'Blue sidebar. Great for tech roles.',           accent: '#1e3a5f' },
  { id: 'minimal',   name: 'Minimal',   desc: 'Spacious and clean. Premium feel.',            accent: '#555555' },
  { id: 'executive', name: 'Executive', desc: 'Dark bleed header. For senior positions.',     accent: '#1a1a1a' },
  { id: 'creative',  name: 'Creative',  desc: 'Gradient header + pill skill tags.',           accent: '#6c63ff' },
]

const card = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }

export default function TemplatePickerStep() {
  const templateId    = useResumeStore(s => s.templateId)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  return (
    <div style={card}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>Choose a style — you can switch anytime on the preview page.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {TEMPLATES.map(t => {
          const active = templateId === t.id
          return (
            <div key={t.id} data-template={t.id} onClick={() => setTemplateId(t.id)}
              style={{ border: `2px solid ${active ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '10px', padding: '16px', cursor: 'pointer', background: active ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
              {/* Preview thumbnail */}
              <div style={{ height: '90px', borderRadius: '6px', marginBottom: '12px', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', position: 'relative' }}>{t.name.toUpperCase()}</div>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: active ? '#3b82f6' : '#0f172a' }}>{t.name}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{t.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
