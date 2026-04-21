import { useResumeStore } from '../../store/useResumeStore'
import { v4 as uuid } from 'uuid'

const fs = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', marginBottom: '8px' }

export default function SkillsStep() {
  const skills       = useResumeStore((s) => s.content.skills)
  const updateSkills = useResumeStore((s) => s.updateSkills)

  const add    = () => updateSkills([...skills, { id: uuid(), category: '', items: [] }])
  const remove = (id) => updateSkills(skills.filter((s) => s.id !== id))
  const update = (id, field, value) => updateSkills(skills.map((s) => s.id === id ? { ...s, [field]: value } : s))
  const setItems = (id, raw) => update(id, 'items', raw.split(',').map((s) => s.trim()).filter(Boolean))

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>Group skills by category. Separate items with commas.</p>
      {skills.map((skill, i) => (
        <div key={skill.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Category {i + 1}</strong>
            <button onClick={() => remove(skill.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
          <input style={fs} placeholder="Category name (e.g. Programming Languages)" value={skill.category} onChange={(e) => update(skill.id, 'category', e.target.value)} />
          <input style={fs} placeholder="Skills, comma separated (e.g. JavaScript, React, Python)" value={skill.items.join(', ')} onChange={(e) => setItems(skill.id, e.target.value)} />
        </div>
      ))}
      <button onClick={add} style={{ padding: '10px 20px', border: '2px dashed #6c63ff', borderRadius: '6px', color: '#6c63ff', background: 'none', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
        + Add Skill Category
      </button>
    </div>
  )
}
