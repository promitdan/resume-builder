import { useResumeStore } from '../../store/useResumeStore'

const SECTIONS = [
  { key: 'projects',       label: 'Projects',       desc: 'Personal or professional projects', icon: '💼' },
  { key: 'certifications', label: 'Certifications', desc: 'Licenses and credentials',          icon: '🏆' },
  { key: 'languages',      label: 'Languages',      desc: 'Spoken / written languages',        icon: '🌐' },
  { key: 'awards',         label: 'Awards',         desc: 'Honors and achievements',           icon: '⭐' },
  { key: 'custom',         label: 'Custom Section', desc: 'Volunteer work, publications, etc.', icon: '✚' },
]

const card = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }

export default function OptionalSectionsStep() {
  const sectionOrder          = useResumeStore(s => s.content.sectionOrder)
  const toggleOptionalSection = useResumeStore(s => s.toggleOptionalSection)

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Toggle the sections you want to include in your resume.</p>
      {SECTIONS.map(({ key, label, desc, icon }) => {
        const on = sectionOrder.includes(key)
        return (
          <div key={key} onClick={() => toggleOptionalSection(key, !on)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: `1.5px solid ${on ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: on ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: on ? '#3b82f6' : '#0f172a' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
            {/* Toggle switch */}
            <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: on ? '#3b82f6' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: on ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
