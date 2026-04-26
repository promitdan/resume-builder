import t from '../../../templates/minimal.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function MinimalTemplate({ content = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionLabel = (text, first = false) => (
    <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: '10px', marginTop: first ? '0' : '32px' }}>{text}</div>
  )

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  const contactFields = [
    { path: 'personal.email',    val: personal.email },
    { path: 'personal.phone',    val: personal.phone },
    { path: 'personal.location', val: personal.location },
    { path: 'personal.linkedin', val: personal.linkedin, isLink: true },
    { path: 'personal.website',  val: personal.website,  isLink: true },
  ].filter(f => f.val)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: ty.bodyFontSize, color: c.mainText, lineHeight: ty.bodyLineHeight, padding: '52px 64px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, letterSpacing: '-0.5px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: ty.titleFontSize, fontWeight: '400', color: '#666', marginTop: '4px', letterSpacing: '0.5px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
          {contactFields.map((f, i) => (
            <span key={f.path}>
              {f.isLink
                ? <ContactLink path={f.path} value={f.val} />
                : <InlineEditor path={f.path} value={f.val}>{f.val}</InlineEditor>
              }
              {i < contactFields.length - 1 && ' · '}
            </span>
          ))}
        </div>
      </div>

      {personal.summary && (
        <div>
          {sectionLabel('Summary')}
          <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', maxWidth: '580px' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {(() => {
        const visibleKeys = sectionOrder.filter(k => k !== 'personal').filter(k => {
          if (k === 'skills') return hasSkillItems
          if (k === 'experience') return experience.length > 0
          if (k === 'education') return education.length > 0
          if (k === 'certifications') return certifications.length > 0
          if (k === 'languages') return languages.length > 0
          if (k === 'awards') return awards.length > 0
          if (k === 'projects') return projects.length > 0
          if (k === 'custom') return custom.length > 0
          return false
        })
        return sectionOrder.filter(k => k !== 'personal').map(key => {
          if (key === 'skills' && hasSkillItems) return (
            <div key={key}>
              {sectionLabel('Skills', key === visibleKeys[0])}
              <div style={{ fontSize: '14px', color: '#555', lineHeight: '2' }}>
                {skills.map((sk, si) =>
                  (sk.items ?? []).map((item, ii) => (
                    <span key={`${si}-${ii}`}>
                      <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                      {(si < skills.length - 1 || ii < (sk.items ?? []).length - 1) && ' · '}
                    </span>
                  ))
                )}
              </div>
            </div>
          )

          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionLabel('Experience', key === visibleKeys[0])}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  {(e.role || e.location) && (
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>
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
              {sectionLabel('Education', key === visibleKeys[0])}
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {education.map((e, i) => (
                  <div key={e.id ?? i}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
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
                ))}
              </div>
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {sectionLabel('Certifications', key === visibleKeys[0])}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {' · '}<InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {sectionLabel('Languages', key === visibleKeys[0])}
              <div style={{ fontSize: '14px', color: '#555', lineHeight: '2' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency && (
                      <> (<InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor>)</>
                    )}
                    {i < languages.length - 1 && ' · '}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key}>
              {sectionLabel('Awards & Recognition', key === visibleKeys[0])}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {' · '}<InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {sectionLabel('Projects', key === visibleKeys[0])}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444', marginTop: '2px' }}>
                      <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
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
                    {sectionLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>, i === 0 && key === visibleKeys[0])}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: ty.bodyFontSize, lineHeight: '1.7', color: '#444' }}>• {line}</div>
                        ))}
                      </div>
                    </InlineEditor>
                  </div>
                )
              })}
            </div>
          )

          return null
        })
      })()}
    </div>
  )
}
