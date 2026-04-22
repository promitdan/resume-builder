import { useResumeStore } from '../../store/useResumeStore'

const card    = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }
const inp     = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '14px' }
const addBtn  = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn   = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }

const focusStyle = e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

export default function ExperienceStep() {
  const experience       = useResumeStore(s => s.content.experience)
  const addExperience    = useResumeStore(s => s.addExperience)
  const updateExperience = useResumeStore(s => s.updateExperience)
  const removeExperience = useResumeStore(s => s.removeExperience)

  const fi = (id, name, value, placeholder) => (
    <input style={inp} placeholder={placeholder} value={value}
      onChange={e => updateExperience(id, { [name]: e.target.value })}
      onFocus={focusStyle} onBlur={blurStyle} />
  )

  const handleBullet = (id, idx, value) => {
    const exp = experience.find(e => e.id === id)
    const bullets = [...(exp?.bullets || [])]
    bullets[idx] = value
    updateExperience(id, { bullets })
  }

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Add your work history, most recent first.</p>
      {experience.map((exp, i) => (
        <div key={exp.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Position {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeExperience(exp.id)}>Remove</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            {fi(exp.id, 'role',     exp.role,     'Job Title / Role')}
            {fi(exp.id, 'company',  exp.company,  'Company')}
            {fi(exp.id, 'location', exp.location, 'Location (optional)')}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Start (e.g. Jan 2022)" value={exp.startDate}
                onChange={e => updateExperience(exp.id, { startDate: e.target.value })} onFocus={focusStyle} onBlur={blurStyle} />
              <input style={{ ...inp, flex: 1 }} placeholder="End or Present"        value={exp.endDate}
                onChange={e => updateExperience(exp.id, { endDate: e.target.value })}   onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>
          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Bullet points</div>
            {(exp.bullets || []).map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <input style={{ ...inp, flex: 1, marginBottom: 0 }} placeholder={`Bullet ${idx + 1}`} value={b}
                  onChange={e => handleBullet(exp.id, idx, e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
                <button type="button" onClick={() => updateExperience(exp.id, { bullets: exp.bullets.filter((_, j) => j !== idx) })}
                  style={{ ...rmBtn, fontSize: '16px', lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: 0 }}>
              + Add bullet
            </button>
          </div>
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addExperience}>+ Add Work Experience</button>
    </div>
  )
}
