import t from '../../../templates/modern-banner.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'
import ContactIcon from '../ContactIcon'

export default function ModernBannerTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const leftLabel = (text) => (
    <div style={{ marginBottom: '8px', marginTop: '18px' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.headingText, marginBottom: '5px' }}>{text}</div>
      <div style={{ height: '1px', background: c.dividerColor }} />
    </div>
  )

  const rightLabel = (text) => (
    <div style={{ marginBottom: '10px', marginTop: '20px' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.headingText, marginBottom: '6px' }}>{text}</div>
      <div style={{ height: '1px', background: c.dividerColor }} />
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  /* ── Header band ── */
  const header = (
    <div data-page-header style={{ background: c.bannerBg, color: c.bannerText, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: ty.nameFont }}>
      <div>
        <div style={{ fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#ffffff', letterSpacing: '-0.3px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
        </div>
        {personal.title && (
          <div style={{ fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
      </div>
      <div style={{ fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.90)', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
        {personal.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <ContactIcon type="email" size={13} color="rgba(255,255,255,0.7)" />
            <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
          </div>
        )}
        {personal.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <ContactIcon type="phone" size={13} color="rgba(255,255,255,0.7)" />
            <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
          </div>
        )}
        {personal.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <ContactIcon type="location" size={13} color="rgba(255,255,255,0.7)" />
            <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
          </div>
        )}
        {personal.linkedin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <ContactIcon type="linkedin" size={13} color="rgba(255,255,255,0.7)" />
            <ContactLink path="personal.linkedin" value={personal.linkedin} />
          </div>
        )}
      </div>
    </div>
  )

  /* ── Left column: education, skills, languages, social ── */
  const leftCol = (
    <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, padding: '20px 22px', boxSizing: 'border-box', flexShrink: 0, borderRight: `1px solid ${c.dividerColor}`, fontFamily: ty.bodyFont }}>

      {sectionOrder.filter(k => ['education', 'skills', 'languages'].includes(k)).map(key => {

        if (key === 'education' && education.length > 0) return (
          <div key={key} data-section="education">
            {leftLabel('Education')}
            {education.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '12px', fontSize: 'var(--resume-body)' }}>
                <div style={{ fontWeight: 700, color: c.headingText }}>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                </div>
                {e.location && (
                  <div style={{ color: c.mutedText, fontSize: '12px', fontStyle: 'italic' }}>
                    <InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    {(e.startDate || e.endDate) && <span> · {[e.startDate, e.endDate].filter(Boolean).join(' - ')}</span>}
                  </div>
                )}
                {!e.location && (e.startDate || e.endDate) && (
                  <div style={{ color: c.mutedText, fontSize: '12px', fontStyle: 'italic' }}>
                    {[e.startDate, e.endDate].filter(Boolean).join(' - ')}
                  </div>
                )}
                {(e.degree || e.field) && (
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>
                    <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                    {e.degree && e.field ? ' ' : ''}
                    <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                  </div>
                )}
                {e.gpa && <div style={{ color: c.mutedText, fontSize: '12px' }}>GPA: {e.gpa}</div>}
              </div>
            ))}
          </div>
        )

        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            {leftLabel('Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.filter(sk => (sk.items ?? []).length > 0).flatMap((sk, si) =>
                (sk.items ?? []).map((item, ii) => (
                  <span key={`${si}-${ii}`} style={{ background: c.bannerBg, color: '#fff', fontSize: '12px', padding: '3px 10px', borderRadius: '12px', opacity: 0.9 }}>
                    <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                  </span>
                ))
              )}
            </div>
          </div>
        )

        if (key === 'languages' && languages.length > 0) return (
          <div key={key} data-section="languages">
            {leftLabel('Languages')}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
              {languages.map((lang, i) => (
                <div key={lang.id ?? i}>
                  <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                  {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
                </div>
              ))}
            </div>
          </div>
        )

        return null
      })}

      {/* Social links always at bottom of left col */}
      {pageIndex === 0 && (personal.linkedin || personal.website) && (
        <>
          {leftLabel('Websites & Social Links')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {personal.linkedin && (
              <div><span style={{ fontWeight: 700 }}>LinkedIn: </span><ContactLink path="personal.linkedin" value={personal.linkedin} /></div>
            )}
            {personal.website && (
              <div><span style={{ fontWeight: 700 }}>Website: </span><ContactLink path="personal.website" value={personal.website} /></div>
            )}
          </div>
        </>
      )}
    </div>
  )

  /* ── Right column: summary + most sections ── */
  const rightCol = (
    <div data-col="right" style={{ flex: 1, background: c.mainBg, padding: '20px 26px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>

      {personal.summary && (
        <div data-section="summary">
          {rightLabel('Summary')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {sectionOrder.filter(k => !['personal', 'education', 'skills', 'languages'].includes(k)).map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key} data-section="experience">
            {rightLabel('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span style={{ fontWeight: 400 }}> - <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                <div style={{ fontSize: '12px', color: c.accentColor, fontStyle: 'italic', marginBottom: '4px' }}>
                  {dateStr(e)}
                  {e.location && <span style={{ color: c.mutedText, fontStyle: 'normal' }}> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
                    <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key} data-section="projects">
            {rightLabel('Projects')}
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
            {rightLabel('Certifications')}
            {certifications.map((cert, i) => (
              <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
                <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
                {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                {cert.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key} data-section="awards">
            {rightLabel('Achievements')}
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
                {rightLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
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
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, minHeight: '1054px', background: c.mainBg }}>
      {pageIndex === 0 && header}
      <div style={{ display: 'flex', minHeight: '954px' }}>
        {leftCol}
        {rightCol}
      </div>
    </div>
  )
}
