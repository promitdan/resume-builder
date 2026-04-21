import t from '../../../templates/creative.json'

export default function CreativeTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout, s = t.sections
  const sw = l.sidebarWidthPercent

  const sidebarLabel = (text) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.sidebarAccent, paddingBottom: '3px', marginBottom: '6px', marginTop: '14px', borderBottom: `1px solid ${c.dividerColor}` }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.headingText, paddingBottom: '3px', marginBottom: '6px', marginTop: '14px', borderBottom: `1px solid ${c.dividerColor}` }}>{text}</div>
  )

  const mainSections = s.mainSections || []

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize }}>
      <div style={{ background: `linear-gradient(135deg, ${c.headerGradientStart}, ${c.headerGradientEnd})`, color: '#fff', padding: '24px 20px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight }}>{personal.name}</div>
        {personal.title && <div style={{ fontSize: ty.titleFontSize, opacity: 0.9, marginTop: '3px' }}>{personal.title}</div>}
        <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '5px' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: '10in' }}>
        <div style={{ width: `${sw}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '16px', boxSizing: 'border-box' }}>
          {personal.summary && <>{sidebarLabel('About')}<div style={{ fontSize: '10px', color: c.sidebarText }}>{personal.summary}</div></>}
          {skills.length > 0 && <>{sidebarLabel('Skills')}{skills.map((sk) => (
            <div key={sk.id} style={{ marginBottom: '8px' }}>
              {sk.category && <div style={{ fontWeight: 'bold', fontSize: '10px', color: c.sidebarAccent, marginBottom: '4px' }}>{sk.category}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {sk.items.map((item, i) => (
                  <span key={i} style={{ background: c.tagBackground, color: c.tagText, fontSize: '9px', padding: '2px 6px', borderRadius: '10px' }}>{item}</span>
                ))}
              </div>
            </div>
          ))}</>}
        </div>
        <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '16px 20px', boxSizing: 'border-box' }}>
          {sectionOrder.filter((k) => k !== 'personal' && mainSections.includes(k)).map((key) => {
            if (key === 'experience' && experience.length) return (
              <div key={key}>{mainLabel('Experience')}{experience.map((e) => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <strong style={{ color: c.headingText }}>{e.role}</strong>
                  {e.company && <div style={{ color: c.mutedText, fontSize: '10px' }}>{e.company}</div>}
                  {(e.startDate || e.endDate) && <div style={{ color: c.mutedText, fontSize: '9px', marginTop: '2px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</div>}
                  {e.bullets?.filter(Boolean).map((b, i) => <div key={i} style={{ marginTop: '2px' }}>• {b}</div>)}
                </div>
              ))}</div>
            )
            if (key === 'education' && education.length) return (
              <div key={key}>{mainLabel('Education')}{education.map((e) => (
                <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                  <strong style={{ color: c.headingText }}>{e.degree} {e.field}</strong>
                  <div style={{ color: c.mutedText, fontSize: '10px' }}>{e.institution} · {e.endDate}</div>
                </div>
              ))}</div>
            )
            return null
          })}
        </div>
      </div>
    </div>
  )
}
