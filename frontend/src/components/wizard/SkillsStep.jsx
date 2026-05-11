import { useState } from 'react'
import { useResumeStore } from '../../store/useResumeStore'
import { v4 as uuid } from 'uuid'

const card      = { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
const inp       = { width: '100%', padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }
const entryCard = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '14px' }
const addBtn    = { width: '100%', padding: '10px', border: '2px dashed #bfdbfe', borderRadius: '8px', background: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
const rmBtn     = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '0' }
const focusStyle = e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px #eff6ff' }
const blurStyle  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }

export default function SkillsStep() {
  const skills       = useResumeStore(s => s.content.skills)
  const updateSkills = useResumeStore(s => s.updateSkills)

  // Local state for raw comma text — prevents the input from collapsing while typing "React, TypeScript"
  const [rawItems, setRawItems] = useState(() =>
    Object.fromEntries(skills.map(sk => [sk.id, sk.items.join(', ')]))
  )

  const add = () => {
    const newSkill = { id: uuid(), category: '', items: [] }
    updateSkills([...skills, newSkill])
    setRawItems(prev => ({ ...prev, [newSkill.id]: '' }))
  }

  const remove = (id) => {
    updateSkills(skills.filter(s => s.id !== id))
    setRawItems(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const update = (id, k, v) => updateSkills(skills.map(s => s.id === id ? { ...s, [k]: v } : s))

  const handleItemsChange = (id, raw) => setRawItems(prev => ({ ...prev, [id]: raw }))

  const handleItemsBlur = (id, raw) => {
    const items = raw.split(',').map(s => s.trim()).filter(Boolean)
    update(id, 'items', items)
    setRawItems(prev => ({ ...prev, [id]: items.join(', ') }))
  }

  return (
    <div style={card}>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Group your skills by category. Separate items with commas.</p>
      {skills.map((sk, i) => (
        <div key={sk.id} style={entryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Category {i + 1}</span>
            <button type="button" style={rmBtn} onClick={() => remove(sk.id)}>Remove</button>
          </div>
          <input
            style={inp}
            placeholder="Category name (e.g. Frontend)"
            value={sk.category}
            onChange={e => update(sk.id, 'category', e.target.value)}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <input
            style={{ ...inp, marginBottom: 0 }}
            placeholder="Skills, comma-separated (e.g. React, TypeScript, CSS)"
            value={rawItems[sk.id] ?? sk.items.join(', ')}
            onChange={e => handleItemsChange(sk.id, e.target.value)}
            onBlur={e => { blurStyle(e); handleItemsBlur(sk.id, e.target.value) }}
            onFocus={focusStyle}
          />
        </div>
      ))}
      <button type="button" style={addBtn} onClick={add}>+ Add Skill Category</button>
    </div>
  )
}
