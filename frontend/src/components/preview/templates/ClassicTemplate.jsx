import t from '../../../templates/classic.json'

export default function ClassicTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '9px', fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: '3px', color: c.headingText,
      borderBottom: `1.5px solid ${c.dividerColor}`,
      paddingBottom: '4px', marginBottom: '10px', marginTop: '18px',
    }}>{text}</div>
  )

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ textAlign: 'center', padding: '36px 56px 18px', borderBottom: `2px solid ${c.headingText}` }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText }}>{personal.name}</div>
        {personal.title && <div style={{ fontStyle: 'italic', fontSize: ty.titleFontSize, color: '#555', marginTop: '6px', letterSpacing: '0.5px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10.5px', color: '#666', marginTop: '8px' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join(' · ')}
        </div>
      </div>

      <div style={{ padding: '22px 56px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', textAlign: 'justify' }}>{personal.summary}</div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal').map(key => {
          if (key === 'skills' && skills.length > 0) {
            const allItems = skills.flatMap(sk => sk.items)
            return allItems.length > 0 ? (
              <div key={key}>
                {sectionLabel('Core Competencies')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {allItems.map((item, i) => (
                    <span key={i} style={{ background: '#f2f2f2', border: '1px solid #ccc', borderRadius: '3px', padding: '3px 10px', fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#333' }}>{item}</span>
                  ))}
                </div>
              </div>
            ) : null
          }

          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History')}
              {experience.map(e => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                    <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                      {e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: ty.bodyFontSize, fontStyle: 'italic', color: '#444', margin: '2px 0 5px' }}>
                      {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ fontSize: '10.5px', lineHeight: '1.6', color: '#333', fontFamily: 'Inter, sans-serif', marginBottom: '3px' }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education')}
              {education.map(e => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.institution}</div>
                    <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>{e.endDate}</div>
                  </div>
                  <div style={{ fontSize: ty.bodyFontSize, fontStyle: 'italic', color: '#444' }}>
                    {[e.degree, e.field].filter(Boolean).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
