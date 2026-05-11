import { useState } from 'react'
import { useResumeStore } from '../../store/useResumeStore'
import { CATEGORIES } from '../../registry/templateRegistry'

function Thumbnail({ id }) {
  const [err, setErr] = useState(false)

  if (err) {
    return (
      <div style={{
        width: '100%', aspectRatio: '8.5 / 11',
        background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '9px', color: '#94a3b8' }}>No preview</span>
      </div>
    )
  }

  return (
    <img
      src={`/thumbnails/${id}.png`}
      alt=""
      onError={() => setErr(true)}
      style={{
        width: '100%',
        aspectRatio: '8.5 / 11',
        objectFit: 'cover',
        objectPosition: 'top',
        display: 'block',
      }}
    />
  )
}

export default function TemplateSwitcher() {
  const templateId    = useResumeStore(s => s.templateId)
  const setTemplateId = useResumeStore(s => s.setTemplateId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {CATEGORIES.map(({ id: catId, label: catLabel, templates }) => (
        <div key={catId}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: '8px' }}>
            {catLabel}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {templates.map(({ id, label }) => {
              const active = templateId === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplateId(id)}
                  style={{
                    padding: 0,
                    border: `2px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#fff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#cbd5e1' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#e2e8f0' }}
                >
                  <Thumbnail id={id} />
                  <div style={{
                    padding: '5px 4px',
                    fontSize: '11px',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#2563eb' : '#475569',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    background: active ? '#eff6ff' : '#fff',
                  }}>
                    {label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
