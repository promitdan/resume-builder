import t from '../../../templates/creative.json'

export default function CreativeTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const gradientStyle = `linear-gradient(90deg, ${c.accentStart}, ${c.accentEnd})`

  const sectionLabel = (text) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', background: gradientStyle, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>{text}</div>
      <div style={{ height: '2px', background: gradientStyle, borderRadius: '1px' }}></div>
    </div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])
  const pillColors = [
    { bg: '#ede9fe', color: '#5b21b6' },
    { bg: '#fce7f3', color: '#9d174d' },
  ]
  const borderColors = [c.accentStart, c.accentEnd]

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: `linear-gradient(135deg, ${c.accentStart}, #7c3aed, ${c.accentEnd})`, color: '#fff', padding: '40px 52px 32px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#e0d9ff', letterSpacing: '1px', marginBottom: '18px' }}>{personal.title}</div>}
        <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: '#d1c4ff', flexWrap: 'wrap' }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>☎ {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
        </div>
      </div>

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('About')}
            <div style={{ fontSize: '11.5px', lineHeight: '1.7', color: '#444' }}>{personal.summary}</div>
          </div>
        )}

        {allSkillItems.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allSkillItems.map((item, i) => {
                const p = pillColors[i % 2]
                return <span key={i} style={{ background: p.bg, color: p.color, fontSize: '10px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px' }}>{item}</span>
              })}
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Experience')}
              {experience.map((e, i) => {
                const bc = borderColors[i % 2]
                return (
                  <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing, paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                      <div style={{ fontSize: '10px', color: '#888' }}>
                        {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                      </div>
                    </div>
                    {(e.role || e.location) && (
                      <div style={{ fontSize: '11px', fontWeight: '600', color: bc, margin: '2px 0 6px' }}>
                        {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                      </div>
                    )}
                    {e.bullets?.filter(Boolean).map((b, bi) => (
                      <div key={bi} style={{ fontSize: '11px', lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {b}</div>
                    ))}
                  </div>
                )
              })}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education')}
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {education.map((e, i) => {
                  const bc = borderColors[i % 2]
                  return (
                    <div key={e.id ?? i} style={{ paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.institution}</div>
                      <div style={{ fontSize: '11px', color: '#555' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</div>
                      {e.endDate && <div style={{ fontSize: '10.5px', color: '#999' }}>{e.endDate}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )

          // projects, certifications, awards, languages, custom not supported in Creative
          return null
        })}
      </div>
    </div>
  )
}
