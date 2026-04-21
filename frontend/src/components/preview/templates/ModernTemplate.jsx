import t from '../../../templates/modern.json'

export default function ModernTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout, s = t.sections
  const sw = l.sidebarWidthPercent

  const sidebarLabel = (text) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.sidebarAccent, borderBottom: `1px solid ${c.sidebarAccent}`, paddingBottom: '3px', marginBottom: '6px', marginTop: '14px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: ty.sectionLabelSpacing, color: c.headingText, borderBottom: `1px solid ${c.dividerColor}`, paddingBottom: '3px', marginBottom: '6px', marginTop: '14px' }}>{text}</div>
  )

  const mainSections = s.mainSections || []

  return (
    <div style={{ display: 'flex', minHeight: '11in', fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize }}>
      <div style={{ width: `${sw}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '24px 16px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: c.sidebarAccent, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>
            {(personal.name || '?')[0]}
          </div>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight }}>{personal.name}</div>
          {personal.title && <div style={{ fontSize: ty.titleFontSize, color: c.sidebarAccent, marginTop: '3px' }}>{personal.title}</div>}
        </div>
        {sidebarLabel('Contact')}
        {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => <div key={i} style={{ fontSize: '10px', marginBottom: '3px', wordBreak: 'break-all' }}>{v}</div>)}
        {skills.length > 0 && <>{sidebarLabel('Skills')}{skills.map((sk) => <div key={sk.id} style={{ marginBottom: '6px' }}><div style={{ fontWeight: 'bold', fontSize: '10px' }}>{sk.category}</div><div style={{ fontSize: '10px' }}>{sk.items.join(', ')}</div></div>)}</>}
      </div>
      <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '24px 20px', boxSizing: 'border-box' }}>
        {personal.summary && <div style={{ marginBottom: '12px' }}>{personal.summary}</div>}
        {sectionOrder.filter((k) => k !== 'personal' && mainSections.includes(k)).map((key) => {
          if (key === 'experience' && experience.length) return (
            <div key={key}>{mainLabel('Experience')}{experience.map((e) => (
              <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: c.headingText }}>{e.role}{e.role && e.company ? ' — ' : ''}{e.company}</strong>
                  <span style={{ color: c.mutedText, fontSize: '10px' }}>{e.startDate}{e.startDate ? ' – ' : ''}{e.current ? 'Present' : e.endDate}</span>
                </div>
                {e.bullets?.filter(Boolean).map((b, i) => <div key={i} style={{ marginTop: '2px' }}>– {b}</div>)}
              </div>
            ))}</div>
          )
          if (key === 'education' && education.length) return (
            <div key={key}>{mainLabel('Education')}{education.map((e) => (
              <div key={e.id} style={{ marginBottom: l.itemSpacing }}>
                <strong style={{ color: c.headingText }}>{e.degree} {e.field}</strong>
                <div style={{ color: c.mutedText }}>{e.institution} · {e.endDate}</div>
              </div>
            ))}</div>
          )
          return null
        })}
      </div>
    </div>
  )
}
