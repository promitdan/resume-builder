import t from '../../../templates/classic.json'

export default function ClassicTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => (
    <div style={{ fontFamily: ty.sectionLabelFont, fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.headingText, borderBottom: `1px solid ${c.dividerColor}`, paddingBottom: '3px', marginBottom: '6px', marginTop: l.sectionSpacing }}>
      {text}
    </div>
  )

  return (
    <div style={{ padding: l.pageMarginSides, fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ textAlign: t.header.alignment, paddingBottom: '12px', borderBottom: `2px solid ${c.dividerColor}`, marginBottom: '14px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, color: c.mutedText, marginTop: '3px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10px', color: c.mutedText, marginTop: '5px' }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join(' · ')}
        </div>
      </div>
      {personal.summary && <div style={{ marginBottom: '12px' }}>{personal.summary}</div>}
      {sectionOrder.filter((k) => k !== 'personal').map((key) => {
        if (key === 'experience' && experience.length) return (
          <div key={key}>{label('Experience')}{experience.map((e) => (
            <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.role}{e.role && e.company ? ' — ' : ''}{e.company}</strong>
                <span style={{ color: c.mutedText }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span>
              </div>
              {e.location && <div style={{ color: c.mutedText }}>{e.location}</div>}
              {e.bullets?.filter(Boolean).map((b, i) => <div key={i}>• {b}</div>)}
            </div>
          ))}</div>
        )
        if (key === 'education' && education.length) return (
          <div key={key}>{label('Education')}{education.map((e) => (
            <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.degree} {e.field}</strong><span style={{ color: c.mutedText }}>{e.endDate}</span>
              </div>
              <div style={{ color: c.mutedText }}>{e.institution}</div>
              {e.gpa && <div>GPA: {e.gpa}</div>}
            </div>
          ))}</div>
        )
        if (key === 'skills' && skills.length) return (
          <div key={key}>{label('Skills')}{skills.map((sk) => (
            <div key={sk.id}>{sk.category && <strong>{sk.category}: </strong>}{sk.items.join(', ')}</div>
          ))}</div>
        )
        return null
      })}
    </div>
  )
}
