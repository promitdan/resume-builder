import t from '../../../templates/executive.json'

export default function ExecutiveTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) => (
    <div style={{ fontFamily: ty.sectionLabelFont, fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.accentColor, borderBottom: `2px solid ${c.dividerColor}`, paddingBottom: '4px', marginBottom: '8px', marginTop: l.sectionSpacing }}>
      {text}
    </div>
  )

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: c.headerBackground, color: c.headerText, padding: `20px ${l.contentPaddingSides || '0.75in'}` }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: ty.nameLetterSpacing || '0' }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, color: c.headerMuted, marginTop: '4px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10px', color: c.headerMuted, marginTop: '6px' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).join('  ·  ')}
        </div>
      </div>
      <div style={{ padding: `${l.contentPaddingTop || '24px'} ${l.contentPaddingSides || '0.75in'}` }}>
        {personal.summary && <div style={{ marginBottom: '14px', fontStyle: ty.summaryFontStyle || 'normal' }}>{personal.summary}</div>}
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
    </div>
  )
}
