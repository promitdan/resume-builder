import t from '../../../templates/executive.json'

export default function ExecutiveTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text, first = false) => (
    <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText, borderLeft: `3px solid ${c.headingText}`, paddingLeft: '10px', marginBottom: '12px', marginTop: first ? '0' : '24px' }}>{text}</div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const visibleMainKeys = sectionOrder
    .filter(k => k !== 'personal' && k !== 'skills')
    .filter(k => {
      if (k === 'experience') return experience.length > 0
      if (k === 'education') return education.length > 0
      return false
    })

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: c.headerBackground, color: c.headerText, padding: '40px 52px 32px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: ty.nameLetterSpacing || '1px', textTransform: 'uppercase', color: '#fff', marginBottom: '6px' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: '13px', fontWeight: '400', color: c.headerMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>{personal.title}</div>}
        <div style={{ display: 'flex', gap: '24px', fontSize: '11px', color: '#cbd5e0', flexWrap: 'wrap' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>

      {allSkillItems.length > 0 && (
        <div style={{ background: '#f7f7fa', padding: '16px 52px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allSkillItems.map((item, i) => (
              <span key={i} style={{ background: c.headingText, color: '#e0e0f0', fontSize: '9.5px', fontWeight: '500', padding: '4px 11px', borderRadius: '3px' }}>{item}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary', true)}
            <div style={{ fontSize: '11.5px', lineHeight: '1.7', color: '#333' }}>{personal.summary}</div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History', key === visibleMainKeys[0] && !personal.summary)}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>
                      {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#4a5568', margin: '2px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: '11px', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education', key === visibleMainKeys[0] && !personal.summary)}
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.institution}</span>
                    <span style={{ fontSize: '11px', color: '#555', marginLeft: '10px' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</span>
                  </div>
                  {e.endDate && <div style={{ fontSize: '10.5px', color: '#888' }}>{e.endDate}</div>}
                </div>
              ))}
            </div>
          )

          // projects, certifications, awards, languages, custom not supported in Executive
          return null
        })}
      </div>
    </div>
  )
}
