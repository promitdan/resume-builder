import t from '../../../templates/modern.json'

export default function ModernTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [], sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => (
    <div style={{ fontSize: '8.5px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.sidebarAccent, borderBottom: '1px solid #2d5080', paddingBottom: '4px', marginBottom: '10px', marginTop: '18px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: c.headingText, borderBottom: `2px solid ${c.sidebarAccent}`, paddingBottom: '4px', marginBottom: '14px', marginTop: '20px' }}>{text}</div>
  )

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  return (
    <div style={{ display: 'flex', fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, lineHeight: ty.bodyLineHeight, minHeight: '11in' }}>
      <div style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '32px 20px', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '64px', height: '64px', background: c.sidebarAccent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', color: '#fff', margin: '0 auto 12px' }}>
            {(personal.name || '?')[0]}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{personal.name}</div>
          {personal.title && <div style={{ fontSize: '11px', color: '#90b8e0', marginTop: '4px' }}>{personal.title}</div>}
        </div>

        {sidebarLabel('Contact')}
        <div style={{ fontSize: '10.5px', lineHeight: '1.7', wordBreak: 'break-word', marginBottom: '4px' }}>
          {[personal.email, personal.phone, personal.location].filter(Boolean).map((v, i) => <div key={i}>{v}</div>)}
        </div>

        {allSkillItems.length > 0 && <>
          {sidebarLabel('Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '4px' }}>
            {allSkillItems.map((item, i) => (
              <span key={i} style={{ background: '#1a4d7a', border: '1px solid #2d6a9f', color: '#cce4ff', fontSize: '9.5px', padding: '3px 9px', borderRadius: '12px' }}>{item}</span>
            ))}
          </div>
        </>}

        {education.length > 0 && <>
          {sidebarLabel('Education')}
          {education.map((e, i) => (
            <div key={e.id ?? i} style={{ marginBottom: '10px', fontSize: '10px', lineHeight: '1.7' }}>
              <div style={{ fontWeight: '600', color: '#fff' }}>{e.institution}</div>
              <div style={{ color: '#90b8e0' }}>{[e.degree, e.field].filter(Boolean).join(': ')}</div>
              {e.endDate && <div style={{ color: '#7aa0c0' }}>{e.endDate}</div>}
            </div>
          ))}
        </>}
      </div>

      <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box' }}>
        {personal.summary && (
          <div>
            {mainLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginBottom: '4px' }}>{personal.summary}</div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'education' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {mainLabel('Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: c.headingText }}>{e.company}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '11px', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                      {e.role}{e.role && e.location ? ' · ' : ''}{e.location}
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: '10.5px', lineHeight: '1.65', color: '#333', marginBottom: '2px' }}>• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          )
          // projects, awards, custom not implemented for this template
          return null
        })}
      </div>
    </div>
  )
}
