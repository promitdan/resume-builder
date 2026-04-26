import t from '../../../templates/modern.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function ModernTemplate({ content = {}, paletteColors = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.sidebarAccent, borderBottom: '1px solid #2d5080', paddingBottom: '4px', marginBottom: '10px', marginTop: '18px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.headingText, borderBottom: `2px solid ${c.sidebarAccent}`, paddingBottom: '4px', marginBottom: '14px', marginTop: '20px' }}>{text}</div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  const sidebarContactFields = [
    { path: 'personal.email',    val: personal.email },
    { path: 'personal.phone',    val: personal.phone },
    { path: 'personal.location', val: personal.location },
    { path: 'personal.linkedin', val: personal.linkedin, isLink: true },
    { path: 'personal.website',  val: personal.website,  isLink: true },
  ].filter(f => f.val)

  return (
    <div style={{ display: 'flex', fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, lineHeight: ty.bodyLineHeight, minHeight: '11in' }}>
      <div style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '32px 20px', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', background: c.sidebarAccent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '700', color: '#fff', margin: '0 auto 12px' }}>
            {(personal.name || '?')[0]}
          </div>
          <div style={{ fontSize: ty.nameFontSize, fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
          </div>
          {personal.title && (
            <div style={{ fontSize: ty.titleFontSize, color: '#90b8e0', marginTop: '4px' }}>
              <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
            </div>
          )}
        </div>

        {sidebarLabel('Contact')}
        <div style={{ fontSize: '13px', lineHeight: '1.7', wordBreak: 'break-word', marginBottom: '4px' }}>
          {sidebarContactFields.map(f => (
            <div key={f.path}>
              {f.isLink
                ? <ContactLink path={f.path} value={f.val} />
                : <InlineEditor path={f.path} value={f.val}>{f.val}</InlineEditor>
              }
            </div>
          ))}
        </div>

        {hasSkillItems && <>
          {sidebarLabel('Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '4px' }}>
            {skills.map((sk, si) =>
              (sk.items ?? []).map((item, ii) => (
                <span key={`${si}-${ii}`} style={{ background: '#1a4d7a', border: '1px solid #2d6a9f', color: '#cce4ff', fontSize: '12px', padding: '4px 10px', borderRadius: '12px' }}>
                  <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                </span>
              ))
            )}
          </div>
        </>}

        {education.length > 0 && <>
          {sidebarLabel('Education')}
          {education.map((e, i) => (
            <div key={e.id ?? i} style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.7' }}>
              <div style={{ fontWeight: '600', color: '#fff' }}>
                <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
              </div>
              <div style={{ color: '#90b8e0' }}>
                <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                {e.degree && e.field ? ': ' : ''}
                <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
              </div>
              {e.endDate && (
                <div style={{ color: '#7aa0c0' }}>
                  <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                </div>
              )}
            </div>
          ))}
        </>}
      </div>

      <div style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box' }}>
        {personal.summary && (
          <div>
            {mainLabel('Professional Summary')}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginBottom: '4px' }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'education' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {mainLabel('Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
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
                    <div style={{ fontSize: '14px', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginBottom: '2px' }}>
                      <span style={{ flexShrink: 0, marginRight: '2px' }}>•</span>
                      <div style={{ flex: 1, minWidth: 0 }}><RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} /></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {mainLabel('Certifications')}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}>
                        {' · '}<InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {mainLabel('Languages')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', padding: '4px 12px', borderRadius: '12px' }}>
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
            <div key={key}>
              {mainLabel('Awards & Recognition')}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}>
                        {' · '}<InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {mainLabel('Projects')}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginTop: '2px' }}>
                      <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                      <ContactLink path={`projects.${i}.url`} value={proj.url} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key}>
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {mainLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#333', marginBottom: '2px' }}>• {line}</div>
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
