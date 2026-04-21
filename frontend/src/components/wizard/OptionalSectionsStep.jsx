import { useResumeStore } from '../../store/useResumeStore'

const SECTIONS = [
  { key: 'projects',       label: 'Projects',       desc: 'Personal or professional projects' },
  { key: 'certifications', label: 'Certifications', desc: 'Licenses and credentials' },
  { key: 'languages',      label: 'Languages',      desc: 'Spoken / written languages' },
  { key: 'awards',         label: 'Awards',         desc: 'Honors and achievements' },
  { key: 'custom',         label: 'Custom Section', desc: 'Volunteer work, publications, etc.' }
]

export default function OptionalSectionsStep() {
  const sectionOrder          = useResumeStore((s) => s.content.sectionOrder)
  const toggleOptionalSection = useResumeStore((s) => s.toggleOptionalSection)

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '20px' }}>Toggle sections to include in your resume.</p>
      {SECTIONS.map(({ key, label, desc }) => {
        const on = sectionOrder.includes(key)
        return (
          <div key={key} onClick={() => toggleOptionalSection(key, !on)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: `1px solid ${on ? '#6c63ff' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: on ? '#f8f7ff' : '#fff', transition: 'all 0.2s' }}>
            <div>
              <div style={{ fontWeight: 600, color: on ? '#6c63ff' : '#333' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{desc}</div>
            </div>
            <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: on ? '#6c63ff' : '#ddd', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
