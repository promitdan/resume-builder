import t from '../../../templates/minimal.json'

export default function MinimalTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => (
    <div style={{ fontFamily: ty.sectionLabelFont, fontSize: ty.sectionLabelSize, fontWeight: ty.nameFontWeight, textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.accentColor, paddingBottom: '4px', marginBottom: '8px', marginTop: l.sectionSpacing }}>
      {text}
    </div>
  )

  return (
    <div style={{ padding: `${l.pageMarginTop} ${l.pageMarginSides}`, fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, color: c.mutedText, marginTop: '4px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10px', color: c.mutedText, marginTop: '6px' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).join('  ·  ')}
        </div>
      </div>
      {personal.summary && <div style={{ marginBottom: '16px', color: c.mutedText }}>{personal.summary}</div>}
      {sectionOrder.filter((k) => k !== 'personal').map((key) => {
        if (key === 'experience' && experience.length) return (
          <div key={key}>{label('Experience')}{experience.map((e) => (
            <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{e.role}{e.role && e.company ? '  ·  ' : ''}{e.company}</span>
                <span style={{ color: c.mutedText }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span>
              </div>
              {e.bullets?.filter(Boolean).map((b, i) => <div key={i} style={{ color: c.mutedText, marginLeft: '12px' }}>{b}</div>)}
            </div>
          ))}</div>
        )
        if (key === 'education' && education.length) return (
          <div key={key}>{label('Education')}{education.map((e) => (
            <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{e.degree} {e.field}</span><span style={{ color: c.mutedText }}>{e.endDate}</span>
              </div>
              <div style={{ color: c.mutedText }}>{e.institution}</div>
            </div>
          ))}</div>
        )
        if (key === 'skills' && skills.length) return (
          <div key={key}>{label('Skills')}{skills.map((sk) => (
            <div key={sk.id} style={{ marginBottom: '4px' }}>{sk.category && <span style={{ color: c.accentColor }}>{sk.category}: </span>}{sk.items.join(', ')}</div>
          ))}</div>
        )
        return null
      })}
    </div>
  )
}
