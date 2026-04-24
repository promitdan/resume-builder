import t from '../../../templates/minimal.json'

export default function MinimalTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px', marginTop: '32px' }}>{text}</div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight, padding: '52px 64px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, letterSpacing: '-0.5px' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#666', marginTop: '4px', letterSpacing: '0.5px' }}>{personal.title}</div>}
        <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join(' · ')}
        </div>
      </div>

      {personal.summary && (
        <div>
          {sectionLabel('Summary')}
          <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', maxWidth: '580px' }}>{personal.summary}</div>
        </div>
      )}

      {sectionOrder.filter(k => k !== 'personal').map(key => {
        if (key === 'skills' && allSkillItems.length > 0) return (
          <div key={key}>
            {sectionLabel('Skills')}
            <div style={{ fontSize: '11px', color: '#555', lineHeight: '2' }}>
              {allSkillItems.join(' · ')}
            </div>
          </div>
        )

        if (key === 'experience' && experience.length > 0) return (
          <div key={key}>
            {sectionLabel('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: c.headingText }}>{e.company}</div>
                  <div style={{ fontSize: '10.5px', color: '#999' }}>
                    {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                  </div>
                </div>
                {(e.role || e.location) && (
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                  </div>
                )}
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>• {b}</div>
                ))}
              </div>
            ))}
          </div>
        )

        if (key === 'education' && education.length > 0) return (
          <div key={key}>
            {sectionLabel('Education')}
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {education.map((e, i) => (
                <div key={e.id ?? i}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: c.headingText }}>{e.institution}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</div>
                  {e.endDate && <div style={{ fontSize: '10.5px', color: '#999' }}>{e.endDate}</div>}
                </div>
              ))}
            </div>
          </div>
        )

        return null
      })}
    </div>
  )
}
