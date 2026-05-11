import { useResumeStore } from '../../store/useResumeStore'

const card  = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
const inp   = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '15px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl   = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }
const fld   = { marginBottom: '18px' }

function Field({ label: labelText, name, value, onChange, type = 'text', placeholder, span }) {
  return (
    <div style={{ ...fld, ...(span ? { gridColumn: span } : {}) }}>
      <label style={lbl}>{labelText}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={inp}
        onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px #eff6ff' }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }} />
    </div>
  )
}

export default function PersonalInfoStep() {
  const personal       = useResumeStore(s => s.content.personal)
  const updatePersonal = useResumeStore(s => s.updatePersonal)
  const h = e => updatePersonal({ [e.target.name]: e.target.value })

  return (
    <div style={card}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>This information appears at the top of your resume.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Full Name *"   name="name"     value={personal.name}     onChange={h} placeholder="Full Name (e.g. Jane Doe)"             span="1 / -1" />
        <Field label="Job Title"     name="title"    value={personal.title}    onChange={h} placeholder="Job Title (e.g. Software Engineer)" />
        <Field label="Email"         name="email"    value={personal.email}    onChange={h} type="email" placeholder="Email (e.g. jane@example.com)" />
        <Field label="Phone"         name="phone"    value={personal.phone}    onChange={h} type="tel"   placeholder="Phone number" />
        <Field label="Location"      name="location" value={personal.location} onChange={h} placeholder="New York, NY" />
        <Field label="LinkedIn URL"  name="linkedin" value={personal.linkedin} onChange={h} type="url"   placeholder="linkedin.com/in/jane" />
        <Field label="Website"       name="website"  value={personal.website}  onChange={h} type="url"   placeholder="janedoe.com"           span="1 / -1" />
      </div>
      <div style={fld}>
        <label style={lbl}>Professional Summary</label>
        <textarea name="summary" value={personal.summary} onChange={h}
          placeholder="Professional summary of your background and goals…"
          rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
          onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }}
          onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }} />
      </div>
    </div>
  )
}
