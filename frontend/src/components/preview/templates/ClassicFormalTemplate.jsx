import t from '../../../templates/classic-formal.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function ClassicFormalTemplate({ content = {}, paletteColors = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const SP  = l.sidePadding
  const IND = l.contentIndent

  const sectionHeader = (text) => (
    <div style={{
      fontFamily: ty.sectionLabelFont,
      fontSize: ty.sectionLabelSize,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: c.headingText,
      marginBottom: '8px',
      marginTop: l.sectionSpacing,
    }}>{text}</div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBackground }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: `32px ${SP} 0` }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, marginBottom: '6px', letterSpacing: '0.5px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
        </div>
        {personal.location && (
          <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, marginBottom: '4px' }}>
            <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
          </div>
        )}
        {personal.title && (
          <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mutedText, marginBottom: '6px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: 'var(--resume-meta)', color: c.mainText, marginBottom: '14px' }}>
          {personal.email && <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>}
          {personal.phone && <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>}
          {personal.linkedin && <ContactLink path="personal.linkedin" value={personal.linkedin} />}
          {personal.website && <ContactLink path="personal.website" value={personal.website} />}
        </div>
        {/* Dotted divider */}
        <div style={{ borderTop: `1px dotted ${c.dividerColor}`, marginBottom: '4px' }} />
      </div>

      {/* ── Body ── */}
      <div style={{ padding: `0 ${SP} 40px` }}>

        {personal.summary && (
          <>
            {sectionHeader('Summary')}
            <div style={{ paddingLeft: IND, fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </>
        )}

        {sectionOrder.filter(k => k !== 'personal').map(key => {

          if (key === 'experience' && experience.length > 0) return (
            <div key={key}>
              {sectionHeader('Experience')}
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ paddingLeft: IND, marginBottom: l.itemSpacing }}>
                  {/* ROLE | date */}
                  <div style={{ fontFamily: ty.bodyFont, fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '2px' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    </span>
                    {e.role && dateStr(e) && (
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> | {dateStr(e)}</span>
                    )}
                  </div>
                  {/* Company */}
                  {e.company && (
                    <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '4px' }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                      {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                    </div>
                  )}
                  {/* Bullets / description */}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginBottom: '2px' }}>
                      <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )

          if (key === 'education' && education.length > 0) return (
            <div key={key}>
              {sectionHeader('Education')}
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ paddingLeft: IND, marginBottom: '10px' }}>
                  {/* Institution - Location | Degree */}
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    {e.location && <span style={{ fontWeight: 400 }}> - <InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                    {e.degree && <span> | <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor></span>}
                  </div>
                  {/* Field | Years */}
                  <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>
                    {e.field && <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>}
                    {e.field && (e.startDate || e.endDate) && ' | '}
                    {[e.startDate, e.endDate].filter(Boolean).join(' - ')}
                    {e.gpa && <span> · GPA: {e.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          )

          if (key === 'skills' && hasSkillItems) return (
            <div key={key}>
              {sectionHeader('Skills')}
              <div style={{ paddingLeft: IND }}>
                {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
                  <div key={sk.id ?? si} style={{ marginBottom: '4px', fontSize: 'var(--resume-body)' }}>
                    {sk.category && (
                      <span style={{ fontWeight: 700 }}>{sk.category}: </span>
                    )}
                    <span>
                      {(sk.items ?? []).map((item, ii) => (
                        <span key={ii}>
                          <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                          {ii < sk.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )

          if (key === 'certifications' && certifications.length > 0) return (
            <div key={key}>
              {sectionHeader('Certifications')}
              <div style={{ paddingLeft: IND }}>
                {certifications.map((cert, i) => (
                  <div key={cert.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                    <span style={{ fontWeight: 700 }}>
                      <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                    </span>
                    {cert.issuer && <span style={{ color: c.mutedText }}> | <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                    {cert.date && <span style={{ color: c.mutedText }}> | <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
                  </div>
                ))}
              </div>
            </div>
          )

          if (key === 'awards' && awards.length > 0) return (
            <div key={key}>
              {sectionHeader('Achievements')}
              <div style={{ paddingLeft: IND }}>
                {awards.map((aw, i) => (
                  <div key={aw.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                    {aw.title && <span style={{ fontWeight: 700 }}>
                      <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                    </span>}
                    {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                    {aw.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
                    {aw.description && (
                      <div style={{ color: c.mainText, marginTop: '2px' }}>
                        <RichTextEditor path={`awards.${i}.description`} value={aw.description} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )

          if (key === 'languages' && languages.length > 0) return (
            <div key={key}>
              {sectionHeader('Languages')}
              <div style={{ paddingLeft: IND, fontSize: 'var(--resume-body)' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
                    {i < languages.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )

          if (key === 'projects' && projects.length > 0) return (
            <div key={key}>
              {sectionHeader('Projects')}
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ paddingLeft: IND, marginBottom: l.itemSpacing }}>
                  <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                    {proj.url && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> | <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
                  </div>
                  {proj.description && (
                    <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '3px' }}>
                      <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )

          if (key === 'custom' && custom.length > 0) return custom.map((sec, i) => (
            <div key={`${key}-${i}`}>
              {sectionHeader(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
              <div style={{ paddingLeft: IND, fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
                <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
              </div>
            </div>
          ))

          return null
        })}
      </div>
    </div>
  )
}
