import { useResumeStore } from '../../store/useResumeStore'

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', marginBottom: '4px' }
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', color: '#555' }

function Field({ label, name, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'block', marginBottom: '20px' }}>
      <span style={labelStyle}>{label}</span>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    </label>
  )
}

export default function PersonalInfoStep() {
  const personal = useResumeStore((s) => s.content.personal)
  const updatePersonal = useResumeStore((s) => s.updatePersonal)

  const h = (e) => updatePersonal({ [e.target.name]: e.target.value })

  return (
    <div style={{ maxWidth: '600px' }}>
      <Field label="Full Name *"        name="name"     value={personal.name}     onChange={h} placeholder="Full Name (e.g. Jane Doe)" />
      <Field label="Job Title"          name="title"    value={personal.title}    onChange={h} placeholder="Job Title (e.g. Software Engineer)" />
      <Field label="Email"              name="email"    value={personal.email}    onChange={h} type="email" placeholder="Email address" />
      <Field label="Phone"              name="phone"    value={personal.phone}    onChange={h} type="tel" placeholder="Phone number" />
      <Field label="Location"           name="location" value={personal.location} onChange={h} placeholder="New York, NY" />
      <Field label="LinkedIn URL"       name="linkedin" value={personal.linkedin} onChange={h} type="url" placeholder="linkedin.com/in/janedoe" />
      <Field label="Website"            name="website"  value={personal.website}  onChange={h} type="url" placeholder="janedoe.com" />
      <label style={{ display: 'block' }}>
        <span style={labelStyle}>Professional Summary</span>
        <textarea name="summary" value={personal.summary} onChange={h} placeholder="Professional summary of your background and goals..." rows={4}
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} />
      </label>
    </div>
  )
}
