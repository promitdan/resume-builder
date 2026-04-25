import t from '../../../templates/creative.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'

export default function CreativeTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const gradientStyle = `linear-gradient(90deg, ${c.accentStart}, ${c.accentEnd})`

  const sectionLabel = (text) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', background: gradientStyle, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>{text}</div>
      <div style={{ height: '2px', background: gradientStyle, borderRadius: '1px' }}></div>
    </div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)
  const pillColors = [
    { bg: '#ede9fe', color: '#5b21b6' },
    { bg: '#fce7f3', color: '#9d174d' },
  ]
  const borderColors = [c.accentStart, c.accentEnd]

  const headerContactFields = [
    { path: 'personal.email', val: personal.email, icon: '✉' },
    { path: 'personal.phone', val: personal.phone, icon: '☎' },
    { path: 'personal.location', val: personal.location, icon: '📍' },
  ].filter(f => f.val)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: `linear-gradient(135deg, ${c.accentStart}, #7c3aed, ${c.accentEnd})`, color: '#fff', padding: '40px 52px 32px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#e0d9ff', letterSpacing: '1px', marginBottom: '18px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#d1c4ff', flexWrap: 'wrap' }}>
          {headerContactFields.map(f => (
            <span key={f.path}>{f.icon} <InlineEditor path={f.path} value={f.val}>{f.val}</InlineEditor></span>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('About')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </div>
        )}

        {hasSkillItems && (
          <div style={{ marginBottom: '24px' }}>
            {sectionLabel('Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.map((sk, si) =>
                (sk.items ?? []).map((item, ii) => {
                  const flatIdx = skills.slice(0, si).reduce((acc, s) => acc + (s.items ?? []).length, 0) + ii
                  const p = pillColors[flatIdx % 2]
                  return (
                    <span key={`${si}-${ii}`} style={{ background: p.bg, color: p.color, fontSize: '13px', fontWeight: '500', padding: '5px 13px', borderRadius: '20px' }}>
                      <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                    </span>
                  )
                })
              )}
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
                      <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                        <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      </div>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                        {e.startDate && (e.current || e.endDate) && ' – '}
                        {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                      </div>
                    </div>
                    {(e.role || e.location) && (
                      <div style={{ fontSize: '14px', fontWeight: '600', color: bc, margin: '2px 0 6px' }}>
                        <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                        {e.role && e.location ? ' · ' : ''}
                        <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                      </div>
                    )}
                    {e.bullets?.filter(Boolean).map((b, bi) => (
                      <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>
                        <span style={{ flexShrink: 0, marginRight: '2px' }}>•</span>
                        <div style={{ flex: 1, minWidth: 0 }}><RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} /></div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Education')}
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {education.map((e, i) => {
                  const bc = borderColors[i % 2]
                  return (
                    <div key={e.id ?? i} style={{ paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                        <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                      </div>
                      <div style={{ fontSize: '14px', color: '#555' }}>
                        <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                        {e.degree && e.field ? ': ' : ''}
                        <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                      </div>
                      {e.endDate && (
                        <div style={{ fontSize: '13px', color: '#999' }}>
                          <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Certifications')}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ marginBottom: '8px', paddingLeft: '14px', borderLeft: `3px solid ${borderColors[i % 2]}` }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                  </div>
                  {cert.issuer && (
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                    </div>
                  )}
                  {cert.date && (
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Languages')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', fontWeight: '400', padding: '5px 13px', borderRadius: '20px' }}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency && (
                      <> — <InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor></>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Awards & Recognition')}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ marginBottom: '8px', paddingLeft: '14px', borderLeft: `3px solid ${borderColors[i % 2]}` }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                  </div>
                  {aw.issuer && (
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                    </div>
                  )}
                  {aw.date && (
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key} style={{ marginBottom: '24px' }}>
              {sectionLabel('Projects')}
              {projects.map((proj, i) => {
                const bc = borderColors[i % 2]
                return (
                  <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing, paddingLeft: '14px', borderLeft: `3px solid ${bc}` }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                    </div>
                    {proj.description && (
                      <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginTop: '2px' }}>
                        <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                      </div>
                    )}
                    {proj.url && (
                      <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                        <InlineEditor path={`projects.${i}.url`} value={proj.url}>{proj.url}</InlineEditor>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i} style={{ marginBottom: '24px' }}>
                    {sectionLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginBottom: '2px' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })}
      </div>
    </div>
  )
}
