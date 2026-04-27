import t from '../../../templates/classic.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function ClassicTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const sectionLabel = (text) => (
    <div style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'var(--resume-label)', fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: '3px', color: c.headingText,
      borderBottom: `1.5px solid ${c.dividerColor}`,
      paddingBottom: '4px', marginBottom: '10px', marginTop: '18px',
    }}>{text}</div>
  )

  const contactFields = [
    { path: 'personal.email',    val: personal.email },
    { path: 'personal.phone',    val: personal.phone },
    { path: 'personal.location', val: personal.location },
    { path: 'personal.linkedin', val: personal.linkedin, isLink: true },
    { path: 'personal.website',  val: personal.website,  isLink: true },
  ].filter(f => f.val)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      {pageIndex === 0 && (
        <div data-page-header style={{ textAlign: 'center', padding: '36px 56px 18px', borderBottom: `2px solid ${c.dividerColor}` }}>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: '3px', textTransform: 'uppercase', color: c.headingText }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name}</InlineEditor>
          </div>
          {personal.title && (
            <div style={{ fontFamily: ty.titleFont, fontStyle: 'italic', fontSize: ty.titleFontSize, color: c.mutedText, marginTop: '6px', letterSpacing: '0.5px' }}>
              <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
            </div>
          )}
          <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, marginTop: '8px' }}>
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
      )}

      <div style={{ padding: '22px 56px 40px' }}>
        {personal.summary && (
          <div data-section="summary">
            {sectionLabel('Professional Summary')}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.65', color: c.mainText, textAlign: 'justify' }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </div>
        )}

        {sectionOrder.filter(k => k !== 'personal').map(key => {
          if (key === 'skills' && skills.length > 0) {
            const hasItems = skills.some(sk => (sk.items ?? []).length > 0)
            return hasItems ? (
              <div key={key} data-section="skills">
                {sectionLabel(skills[0]?._isContinuation ? 'Core Competencies (cont.)' : 'Core Competencies')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((sk, si) =>
                    (sk.items ?? []).map((item, ii) => (
                      <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ display: 'inline-block', background: '#f2f2f2', border: `1px solid ${c.dividerColor}`, borderRadius: '3px', padding: '4px 12px', fontSize: 'var(--resume-meta)', color: '#333' }}>
                        <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                      </span>
                    ))
                  )}
                </div>
              </div>
            ) : null
          }

          if (key === 'experience' && experience.length > 0) return (
            <div key={key} data-section="experience">
              {sectionLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  {!e._bulletContinuation && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                    <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                      {e.startDate && (e.current || e.endDate) && ' – '}
                      {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                    </div>
                  </div>
                  )}
                  {!e._bulletContinuation && (e.role || e.location) && (
                    <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mainText, margin: '2px 0 5px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                      {e.role && e.location ? ' · ' : ''}
                      <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </div>
                  )}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.6', color: '#333', marginBottom: '3px' }}>
                      <span style={{ flexShrink: 0, marginRight: '2px' }}>•</span>
                      <div style={{ flex: 1, minWidth: 0 }}><RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} /></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key} data-section="education">
              {sectionLabel('Education')}
              {education.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `edu-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </div>
                    {e.endDate && (
                      <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, fontStyle: 'italic' }}>
                        <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mainText }}>
                    <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                    {e.degree && e.field ? ' ' : ''}
                    <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                  </div>
                  {e.gpa && (
                    <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText }}>
                      GPA: <InlineEditor path={`education.${i}.gpa`} value={e.gpa}>{e.gpa}</InlineEditor>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key} data-section="certifications">
              {sectionLabel('Certifications')}
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} data-item={cert.id ?? `cert-${i}`} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && (
                      <span style={{ fontSize: 'var(--resume-meta)', fontStyle: 'italic', color: c.mainText }}>
                        {' · '}<InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {cert.date && (
                    <span style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key} data-section="languages">
              {sectionLabel('Languages')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i} style={{ display: 'inline-block', background: '#f2f2f2', border: `1px solid ${c.dividerColor}`, borderRadius: '3px', padding: '4px 12px', fontSize: 'var(--resume-meta)', color: '#333' }}>
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
            <div key={key} data-section="awards">
              {sectionLabel('Awards & Recognition')}
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} data-item={aw.id ?? `award-${i}`} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: c.headingText }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>
                    {aw.issuer && (
                      <span style={{ fontSize: 'var(--resume-meta)', fontStyle: 'italic', color: c.mainText }}>
                        {' · '}<InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                      </span>
                    )}
                  </div>
                  {aw.date && (
                    <span style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, fontStyle: 'italic' }}>
                      <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key} data-section="projects">
              {sectionLabel('Projects')}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} data-item={proj.id ?? `proj-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: c.headingText }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.6', color: '#333', marginTop: '2px' }}>
                      <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                    </div>
                  )}
                  {proj.url && (
                    <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText }}>
                      <ContactLink path={`projects.${i}.url`} value={proj.url} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return (
            <div key={key} data-section="custom">
              {custom.map((sec, i) => {
                const lines = (sec.description || '').split('\n').filter(Boolean)
                return (
                  <div key={sec.id ?? i}>
                    {sectionLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
                    <InlineEditor path={`custom.${i}.description`} value={sec.description} multiline>
                      <div>
                        {lines.map((line, li) => (
                          <div key={li} style={{ fontSize: 'var(--resume-body)', lineHeight: '1.6', color: '#333', marginBottom: '3px' }}>• {line}</div>
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
