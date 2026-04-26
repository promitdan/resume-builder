import t from '../../../templates/modern-sidebar.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'
import ContactIcon from '../ContactIcon'

export default function ModernSidebarTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => (
    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.sidebarMuted, marginBottom: '8px', marginTop: '20px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      {text}
    </div>
  )

  const mainLabel = (text) => (
    <div style={{ marginBottom: '10px', marginTop: '20px' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: c.headingText, marginBottom: '6px' }}>{text}</div>
      <div style={{ height: '1px', background: c.dividerColor }} />
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])
  const hasSkills = allSkillItems.length > 0
  const hasSocial = personal.linkedin || personal.website

  const sidebar = (
    <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, color: c.sidebarText, padding: '32px 22px', boxSizing: 'border-box', flexShrink: 0, fontFamily: ty.bodyFont }}>
      {/* Name */}
      {pageIndex === 0 && (
        <>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2, marginBottom: '4px' }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
          </div>
          {personal.title && (
            <div style={{ fontSize: '12px', color: c.sidebarMuted, marginBottom: '20px', marginTop: '4px' }}>
              <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
            </div>
          )}
        </>
      )}

      {/* Details */}
      {pageIndex === 0 && (personal.email || personal.phone || personal.location) && (
        <>
          {sidebarLabel('Details')}
          <div style={{ fontSize: 'var(--resume-body)', color: c.sidebarText }}>
            {personal.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ContactIcon type="email" size={13} color={c.sidebarMuted} />
                <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
              </div>
            )}
            {personal.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ContactIcon type="phone" size={13} color={c.sidebarMuted} />
                <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
              </div>
            )}
            {personal.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ContactIcon type="location" size={13} color={c.sidebarMuted} />
                <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
              </div>
            )}
          </div>
        </>
      )}

      {/* Skills */}
      {hasSkills && (
        <div data-section="skills">
          {sidebarLabel('Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative', color: c.sidebarText }}>
                <span style={{ position: 'absolute', left: 0, color: c.sidebarMuted }}>·</span>
                <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
              </li>
            )))}
          </ul>
        </div>
      )}

      {/* Social Links */}
      {pageIndex === 0 && hasSocial && (
        <>
          {sidebarLabel('Social Links')}
          <div style={{ fontSize: 'var(--resume-body)', color: c.sidebarText }}>
            {personal.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ContactIcon type="linkedin" size={13} color={c.sidebarMuted} />
                <ContactLink path="personal.linkedin" value={personal.linkedin} />
              </div>
            )}
            {personal.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ContactIcon type="globe" size={13} color={c.sidebarMuted} />
                <ContactLink path="personal.website" value={personal.website} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Languages in sidebar */}
      {languages.length > 0 && (
        <div data-section="languages">
          {sidebarLabel('Languages')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {languages.map((lang, i) => (
              <div key={lang.id ?? i}>
                <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                {lang.proficiency && <span style={{ color: c.sidebarMuted }}> — {lang.proficiency}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const main = (
    <div data-col="right" style={{ flex: 1, background: c.mainBg, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
      {personal.summary && (
        <div data-section="summary">
          {mainLabel('Summary')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k)).map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key} data-section="experience">
            {mainLabel('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontSize: 'var(--resume-label)', color: c.mutedText, marginBottom: '2px' }}>{dateStr(e)}</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                </div>
                {e.company && (
                  <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '5px' }}>
                    <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    {e.location && <span> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                  </div>
                )}
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
                    <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )

        if (key === 'education' && education.length > 0) return (
          <div key={key} data-section="education">
            {mainLabel('Education')}
            {education.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                </div>
                {(e.degree || e.field) && (
                  <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>
                    <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                    {e.degree && e.field ? ', ' : ''}
                    <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: c.mutedText }}>
                  {[e.startDate, e.endDate].filter(Boolean).join(' — ')}
                  {e.gpa ? ` · GPA: ${e.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key} data-section="projects">
            {mainLabel('Projects')}
            {projects.map((proj, i) => (
              <div key={proj.id ?? i} data-item={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  {proj.url && <span style={{ fontWeight: 400 }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
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

        if (key === 'certifications' && certifications.length > 0) return (
          <div key={key} data-section="certifications">
            {mainLabel('Certifications')}
            {certifications.map((cert, i) => (
              <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
                <span style={{ fontWeight: 700 }}>
                  <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                </span>
                {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                {cert.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key} data-section="awards">
            {mainLabel('Achievements')}
            {awards.map((aw, i) => (
              <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
                {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
                {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                {aw.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
                {aw.description && <div style={{ marginTop: '2px' }}><RichTextEditor path={`awards.${i}.description`} value={aw.description} /></div>}
              </div>
            ))}
          </div>
        )

        if (key === 'custom' && custom.length > 0) return (
          <div key={key} data-section="custom">
            {custom.map((sec, i) => (
              <div key={sec.id ?? i} data-item={sec.id ?? i}>
                {mainLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
                <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
                  <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
                </div>
              </div>
            ))}
          </div>
        )

        return null
      })}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '1054px', fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg }}>
      {sidebar}
      {main}
    </div>
  )
}
