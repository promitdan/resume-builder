import { useResumeStore } from '../../store/useResumeStore'

const fs = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', marginBottom: '8px' }

export default function ExperienceStep() {
  const experience       = useResumeStore((s) => s.content.experience)
  const addExperience    = useResumeStore((s) => s.addExperience)
  const updateExperience = useResumeStore((s) => s.updateExperience)
  const removeExperience = useResumeStore((s) => s.removeExperience)

  function field(id, name, value, placeholder) {
    return <input style={fs} placeholder={placeholder} value={value} onChange={(e) => updateExperience(id, { [name]: e.target.value })} />
  }

  function handleBullet(id, idx, value) {
    const exp = experience.find((e) => e.id === id)
    const bullets = [...(exp?.bullets || [])]
    bullets[idx] = value
    updateExperience(id, { bullets })
  }

  return (
    <div>
      {experience.map((exp, i) => (
        <div key={exp.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Entry {i + 1}</strong>
            <button onClick={() => removeExperience(exp.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          {field(exp.id, 'role',      exp.role,      'Job Title / Role')}
          {field(exp.id, 'company',   exp.company,   'Company')}
          {field(exp.id, 'location',  exp.location,  'Location (optional)')}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...fs, flex: 1 }} placeholder="Start Date (e.g. Jan 2022)" value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} />
            <input style={{ ...fs, flex: 1 }} placeholder="End Date or Present"        value={exp.endDate}   onChange={(e) => updateExperience(exp.id, { endDate:   e.target.value })} />
          </div>
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#555' }}>Bullet Points</div>
            {(exp.bullets || []).map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input style={{ ...fs, flex: 1, marginBottom: 0 }} placeholder={`Bullet ${idx + 1}`} value={b} onChange={(e) => handleBullet(exp.id, idx, e.target.value)} />
                <button onClick={() => { const bullets = exp.bullets.filter((_, i) => i !== idx); updateExperience(exp.id, { bullets }) }} style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })} style={{ fontSize: '0.85rem', color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add bullet</button>
          </div>
        </div>
      ))}
      <button onClick={addExperience} style={{ padding: '10px 20px', border: '2px dashed #6c63ff', borderRadius: '6px', color: '#6c63ff', background: 'none', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
        + Add Work Experience
      </button>
    </div>
  )
}
