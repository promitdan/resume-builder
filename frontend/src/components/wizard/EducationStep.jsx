import { useResumeStore } from '../../store/useResumeStore'

const card      = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
const inp       = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '14px' }
const addBtn    = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn     = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }

const focusStyle = e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

export default function EducationStep() {
  const education       = useResumeStore(s => s.content.education)
  const addEducation    = useResumeStore(s => s.addEducation)
  const updateEducation = useResumeStore(s => s.updateEducation)
  const removeEducation = useResumeStore(s => s.removeEducation)

  const fi = (id, name, value, placeholder) => (
    <input style={inp} placeholder={placeholder} value={value}
      onChange={e => updateEducation(id, { [name]: e.target.value })}
      onFocus={focusStyle} onBlur={blurStyle} />
  )

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Add your degrees and certifications, most recent first.</p>
      {education.map((edu, i) => (
        <div key={edu.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Entry {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeEducation(edu.id)}>Remove</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            {fi(edu.id, 'institution', edu.institution, 'Institution')}
            {fi(edu.id, 'degree',      edu.degree,      'Degree (e.g. B.Tech)')}
            {fi(edu.id, 'field',       edu.field,       'Field of Study')}
            {fi(edu.id, 'gpa',         edu.gpa,         'GPA / Grade (optional)')}
            <input style={{ ...inp, flex: 1 }} placeholder="Start Year" value={edu.startDate}
              onChange={e => updateEducation(edu.id, { startDate: e.target.value })} onFocus={focusStyle} onBlur={blurStyle} />
            <input style={{ ...inp, flex: 1 }} placeholder="End Year"   value={edu.endDate}
              onChange={e => updateEducation(edu.id, { endDate: e.target.value })}   onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addEducation}>+ Add Education</button>
    </div>
  )
}
