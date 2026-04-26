import t from '../../../templates/executive.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function ExecutiveTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text, first = false) => (
    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText, borderLeft: `3px solid ${c.headingText}`, paddingLeft: '10px', marginBottom: '12px', marginTop: first ? '0' : '24px' }}>{text}</div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  const visibleMainKeys = sectionOrder
    .filter(k => k !== 'personal' && k !== 'skills')
    .filter(k => {
      if (k === 'experience') return experience.length > 0
      if (k === 'education') return education.length > 0
      if (k === 'certifications') return certifications.length > 0
      if (k === 'languages') return languages.length > 0
      if (k === 'awards') return awards.length > 0
      if (k === 'projects') return projects.length > 0
      if (k === 'custom') return custom.length > 0
      return false
    })

  const headerContactFields = [
    { path: 'personal.email',    val: personal.email },
    { path: 'personal.phone',    val: personal.phone },
    { path: 'personal.location', val: personal.location },
    { path: 'personal.linkedin', val: personal.linkedin, isLink: true },
    { path: 'personal.website',  val: personal.website,  isLink: true },
  ].filter(f => f.val)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      <div style={{ background: c.headerBackground, color: c.headerText, padding: '40px 52px 32px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: ty.nameLetterSpacing || '1px', textTransform: 'uppercase', color: '#fff', marginBottom: '6px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: c.headerMuted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#cbd5e0', flexWrap: 'wrap' }}>
          {headerContactFields.map(f => (
            <span key={f.path}>
              {f.isLink
                ? <ContactLink path={f.path} value={f.val} />
                : <InlineEditor path={f.path} value={f.val}>{f.val}</InlineEditor>
              }
            </span>
          ))}
        </div>
      </div>

      {hasSkillItems && (
        <div style={{ background: '#f7f7fa', padding: '16px 52px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map((sk, si) =>
              (sk.items ?? []).map((item, ii) => (
                <span key={`${si}-${ii}`} style={{ background: c.headingText, color: '#e0e0f0', fontSize: '12px', fontWeight: '500', padding: '5px 12px', borderRadius: '3px' }}>
                  <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      <div style={{ padding: '28px 52px 40px' }}>
        {personal.summary && (
          <div>
            {sectionLabel('Professional Summary', true)}
            <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#333' }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => {
          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Work History', key === visibleMainKeys[0] && !personal.summary)}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', margin: '2px 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionLabel('Education', key === visibleMainKeys[0] && !personal.summary)}
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </span>
                    <span style={{ fontSize: '14px', color: '#555', marginLeft: '10px' }}>
                      <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                      {e.degree && e.field ? ': ' : ''}
                      <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                    </span>
                  </div>
                  {e.endDate && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {sectionLabel('Certifications', key === visibleMainKeys[0] && !personal.summary)}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '14px', color: '#555', marginLeft: '8px' }}>
                        <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {sectionLabel('Languages', key === visibleMainKeys[0] && !personal.summary)}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: '400', padding: '5px 12px', borderRadius: '3px' }}>
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
              {sectionLabel('Awards & Recognition', key === visibleMainKeys[0] && !personal.summary)}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '14px', color: '#555', marginLeft: '8px' }}>
                        <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {sectionLabel('Projects', key === visibleMainKeys[0] && !personal.summary)}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.65', color: '#444', marginTop: '4px' }}>
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
                    {sectionLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>, i === 0 && key === visibleMainKeys[0] && !personal.summary)}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#333', marginBottom: '2px' }}>• {line}</div>
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
