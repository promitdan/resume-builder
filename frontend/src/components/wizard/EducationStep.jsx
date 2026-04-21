import { useResumeStore } from '../../store/useResumeStore'

const fs = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', marginBottom: '8px' }

export default function EducationStep() {
  const education      = useResumeStore((s) => s.content.education)
  const addEducation   = useResumeStore((s) => s.addEducation)
  const updateEducation  = useResumeStore((s) => s.updateEducation)
  const removeEducation  = useResumeStore((s) => s.removeEducation)

  return (
    <div>
      {education.map((edu, i) => (
        <div key={edu.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Entry {i + 1}</strong>
            <button onClick={() => removeEducation(edu.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <input style={fs} placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} />
          <input style={fs} placeholder="Degree (e.g. B.S.)" value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} />
          <input style={fs} placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...fs, flex: 1 }} placeholder="Start Year" value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} />
            <input style={{ ...fs, flex: 1 }} placeholder="End Year"   value={edu.endDate}   onChange={(e) => updateEducation(edu.id, { endDate:   e.target.value })} />
          </div>
          <input style={fs} placeholder="GPA (optional)" value={edu.gpa} onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} />
        </div>
      ))}
      <button onClick={addEducation} style={{ padding: '10px 20px', border: '2px dashed #6c63ff', borderRadius: '6px', color: '#6c63ff', background: 'none', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
        + Add Education
      </button>
    </div>
  )
}
