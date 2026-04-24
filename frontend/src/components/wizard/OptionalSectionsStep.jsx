import { useResumeStore } from '../../store/useResumeStore'

const SECTIONS = [
  { key: 'projects',       label: 'Projects',       desc: 'Personal or professional projects', icon: '💼' },
  { key: 'certifications', label: 'Certifications', desc: 'Licenses and credentials',          icon: '🏆' },
  { key: 'languages',      label: 'Languages',      desc: 'Spoken / written languages',        icon: '🌐' },
  { key: 'awards',         label: 'Awards',         desc: 'Honors and achievements',           icon: '⭐' },
  { key: 'custom',         label: 'Custom Section', desc: 'Volunteer work, publications, etc.', icon: '✚' },
]

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Basic']

const card    = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '680px' }
const form    = { marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', borderTop: '1px solid #e2e8f0' }
const entry   = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '10px', background: '#fff' }
const inp     = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '8px' }
const addBtn  = { width: '100%', padding: '8px', border: '2px dashed #bfdbfe', borderRadius: '6px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginTop: '4px' }
const rmBtn   = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '12px', cursor: 'pointer', padding: '0' }
const row2    = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }
const selStyle = { ...inp, marginBottom: '8px', cursor: 'pointer' }

const focusStyle = e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }
const inputProps = { onFocus: focusStyle, onBlur: blurStyle }

function ProjectsForm() {
  const projects       = useResumeStore(s => s.content.projects)
  const addProject     = useResumeStore(s => s.addProject)
  const updateProject  = useResumeStore(s => s.updateProject)
  const removeProject  = useResumeStore(s => s.removeProject)

  return (
    <div style={form}>
      {projects.map((p, i) => (
        <div key={p.id} style={entry}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Project {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeProject(p.id)}>Remove</button>
          </div>
          <input style={inp} placeholder="Project name" value={p.title}
            onChange={e => updateProject(p.id, { title: e.target.value })} {...inputProps} />
          <input style={inp} placeholder="URL (optional)" value={p.url}
            onChange={e => updateProject(p.id, { url: e.target.value })} {...inputProps} />
          <textarea style={{ ...inp, resize: 'vertical', minHeight: '60px', marginBottom: '0' }}
            placeholder="Brief description of the project"
            value={p.description}
            onChange={e => updateProject(p.id, { description: e.target.value })}
            {...inputProps}
          />
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addProject}>+ Add Project</button>
    </div>
  )
}

function CertificationsForm() {
  const certifications     = useResumeStore(s => s.content.certifications)
  const addCertification   = useResumeStore(s => s.addCertification)
  const updateCertification = useResumeStore(s => s.updateCertification)
  const removeCertification = useResumeStore(s => s.removeCertification)

  return (
    <div style={form}>
      {certifications.map((c, i) => (
        <div key={c.id} style={entry}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Certification {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeCertification(c.id)}>Remove</button>
          </div>
          <input style={inp} placeholder="Certification name" value={c.name}
            onChange={e => updateCertification(c.id, { name: e.target.value })} {...inputProps} />
          <div style={row2}>
            <input style={{ ...inp, marginBottom: 0 }} placeholder="Issuing organization" value={c.issuer}
              onChange={e => updateCertification(c.id, { issuer: e.target.value })} {...inputProps} />
            <input style={{ ...inp, marginBottom: 0 }} placeholder="Date (e.g. Jun 2023)" value={c.date}
              onChange={e => updateCertification(c.id, { date: e.target.value })} {...inputProps} />
          </div>
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addCertification}>+ Add Certification</button>
    </div>
  )
}

function LanguagesForm() {
  const languages     = useResumeStore(s => s.content.languages)
  const addLanguage   = useResumeStore(s => s.addLanguage)
  const updateLanguage = useResumeStore(s => s.updateLanguage)
  const removeLanguage = useResumeStore(s => s.removeLanguage)

  return (
    <div style={form}>
      {languages.map((l, i) => (
        <div key={l.id} style={entry}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Language {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeLanguage(l.id)}>Remove</button>
          </div>
          <div style={row2}>
            <input style={{ ...inp, marginBottom: 0 }} placeholder="Language (e.g. Spanish)" value={l.language}
              onChange={e => updateLanguage(l.id, { language: e.target.value })} {...inputProps} />
            <select style={{ ...selStyle, marginBottom: 0 }} value={l.proficiency}
              onChange={e => updateLanguage(l.id, { proficiency: e.target.value })}>
              {PROFICIENCY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addLanguage}>+ Add Language</button>
    </div>
  )
}

function AwardsForm() {
  const awards      = useResumeStore(s => s.content.awards)
  const addAward    = useResumeStore(s => s.addAward)
  const updateAward = useResumeStore(s => s.updateAward)
  const removeAward = useResumeStore(s => s.removeAward)

  return (
    <div style={form}>
      {awards.map((a, i) => (
        <div key={a.id} style={entry}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Award {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeAward(a.id)}>Remove</button>
          </div>
          <input style={inp} placeholder="Award or honor title" value={a.title}
            onChange={e => updateAward(a.id, { title: e.target.value })} {...inputProps} />
          <div style={row2}>
            <input style={{ ...inp, marginBottom: 0 }} placeholder="Issuing organization" value={a.issuer}
              onChange={e => updateAward(a.id, { issuer: e.target.value })} {...inputProps} />
            <input style={{ ...inp, marginBottom: 0 }} placeholder="Date" value={a.date}
              onChange={e => updateAward(a.id, { date: e.target.value })} {...inputProps} />
          </div>
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addAward}>+ Add Award</button>
    </div>
  )
}

function CustomForm() {
  const custom       = useResumeStore(s => s.content.custom)
  const addCustom    = useResumeStore(s => s.addCustom)
  const updateCustom = useResumeStore(s => s.updateCustom)
  const removeCustom = useResumeStore(s => s.removeCustom)

  return (
    <div style={form}>
      {custom.map((c, i) => (
        <div key={c.id} style={entry}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Entry {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => removeCustom(c.id)}>Remove</button>
          </div>
          <input style={inp} placeholder="Title or role" value={c.title}
            onChange={e => updateCustom(c.id, { title: e.target.value })} {...inputProps} />
          <textarea style={{ ...inp, resize: 'vertical', minHeight: '60px', marginBottom: 0 }}
            placeholder="Description or details"
            value={c.description}
            onChange={e => updateCustom(c.id, { description: e.target.value })}
            {...inputProps}
          />
        </div>
      ))}
      <button type="button" style={addBtn} onClick={addCustom}>+ Add Entry</button>
    </div>
  )
}

const SECTION_FORMS = {
  projects:       <ProjectsForm />,
  certifications: <CertificationsForm />,
  languages:      <LanguagesForm />,
  awards:         <AwardsForm />,
  custom:         <CustomForm />,
}

export default function OptionalSectionsStep() {
  const sectionOrder          = useResumeStore(s => s.content.sectionOrder)
  const toggleOptionalSection = useResumeStore(s => s.toggleOptionalSection)

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>
        Toggle the sections you want to include. Fill in details for enabled sections below each toggle.
      </p>
      {SECTIONS.map(({ key, label, desc, icon }) => {
        const on = sectionOrder.includes(key)
        return (
          <div key={key} style={{ marginBottom: '12px' }}>
            <div
              onClick={() => toggleOptionalSection(key, !on)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: `1.5px solid ${on ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', background: on ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: on ? '#3b82f6' : '#0f172a' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
                </div>
              </div>
              <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: on ? '#3b82f6' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: on ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
              </div>
            </div>
            {on && SECTION_FORMS[key]}
          </div>
        )
      })}
    </div>
  )
}
