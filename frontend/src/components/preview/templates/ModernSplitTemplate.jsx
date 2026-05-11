import t from '../../../templates/modern-split.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'
import ContactIcon from '../ContactIcon'
import { useResumeStore } from '../../../store/useResumeStore'

export default function ModernSplitTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [] } = content
  const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder.length  > 0 ? s.leftColumnOrder  : (t.defaultColumns?.left  ?? []))
  const rightColumnOrder = useResumeStore(s => s.rightColumnOrder.length > 0 ? s.rightColumnOrder : (t.defaultColumns?.right ?? []))
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const sidebarLabel = (text) => (
    <div style={{ marginBottom: '8px', marginTop: '20px' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.headingText, marginBottom: '5px' }}>{text}</div>
      <div style={{ height: '1px', background: c.dividerColor }} />
    </div>
  )

  const mainLabel = (text) => (
    <div style={{ marginBottom: '10px', marginTop: '20px' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.headingText, marginBottom: '6px' }}>{text}</div>
      <div style={{ height: '1px', background: c.dividerColor }} />
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
  const hasSocial = personal.linkedin || personal.website

  const renderSection = (key, col) => {
    const label = col === 'left' ? sidebarLabel : mainLabel

    if (key === 'skills') {
      if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
      return (
        <div key={key} data-section="skills">
          {label(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {skills.flatMap((sk, si) => (sk.items ?? []).map((item, ii) => (
              <li key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ paddingLeft: '14px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
              </li>
            )))}
          </ul>
        </div>
      )
    }

    if (key === 'languages') {
      if (languages.length === 0) return null
      return (
        <div key={key} data-section="languages">
          {label('Languages')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {languages.map((lang, i) => (
              <div key={lang.id ?? i}>
                <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (key === 'experience') {
      if (experience.length === 0) return null
      return (
        <div key={key} data-section="experience">
          {label(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
          {experience.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              {!e._bulletContinuation && (
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', marginBottom: '1px' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span style={{ fontWeight: 700 }}>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
              )}
              {!e._bulletContinuation && (
                <div style={{ fontSize: '12px', color: c.accentColor, fontStyle: 'italic', marginBottom: '5px' }}>
                  {dateStr(e)}
                  {e.location && <span style={{ color: c.mutedText, fontStyle: 'normal' }}> · <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
              )}
              {e.bullets?.filter(Boolean).map((b, bi) => (
                <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '2px' }}>
                  <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (key === 'education') {
      if (education.length === 0) return null
      return (
        <div key={key} data-section="education">
          {label('Education')}
          {education.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '12px', fontSize: 'var(--resume-body)' }}>
              <div style={{ fontWeight: 700 }}>
                {[e.degree, e.field, e.institution].filter(Boolean).map((v, idx, arr) => (
                  <span key={idx}>{v}{idx < arr.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
              <div style={{ color: c.mutedText, fontSize: '12px' }}>
                {[e.startDate, e.endDate].filter(Boolean).join(' — ')}
                {e.gpa ? ` · GPA: ${e.gpa}` : ''}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (key === 'projects') {
      if (projects.length === 0) return null
      return (
        <div key={key} data-section="projects">
          {label('Projects')}
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
    }

    if (key === 'certifications') {
      if (certifications.length === 0) return null
      return (
        <div key={key} data-section="certifications">
          {label('Certifications')}
          {certifications.map((cert, i) => (
            <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
              <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
              {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
              {cert.date && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
            </div>
          ))}
        </div>
      )
    }

    if (key === 'awards') {
      if (awards.length === 0) return null
      return (
        <div key={key} data-section="awards">
          {label('Achievements')}
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
    }

    if (key === 'custom') {
      if (custom.length === 0) return null
      return (
        <div key={key} data-section="custom">
          {custom.map((sec, i) => (
            <div key={sec.id ?? i} data-item={sec.id ?? i}>
              {label(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
                <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  /* ── Left sidebar ── */
  const sidebar = (
    <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, padding: '28px 20px', boxSizing: 'border-box', flexShrink: 0, fontFamily: ty.bodyFont }}>
      {leftColumnOrder.map(key => renderSection(key, 'left'))}
      {pageIndex === 0 && hasSocial && (
        <>
          {sidebarLabel('Websites & Social Links')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {personal.linkedin && (
              <div>
                <span style={{ fontWeight: 700 }}>LinkedIn: </span>
                <ContactLink path="personal.linkedin" value={personal.linkedin} />
              </div>
            )}
            {personal.website && (
              <div>
                <span style={{ fontWeight: 700 }}>Website: </span>
                <ContactLink path="personal.website" value={personal.website} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  /* ── Right main ── */
  const main = (
    <div data-col="right" style={{ flex: 1, background: c.mainBg, padding: '28px 28px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
      {pageIndex === 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '10px' }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
          </div>
          {personal.title && (
            <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '8px' }}>
              <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: 'var(--resume-meta)', color: c.mainText, marginBottom: '12px' }}>
            {personal.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ContactIcon type="email" size={13} color={c.mutedText} />
                <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
              </span>
            )}
            {personal.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ContactIcon type="location" size={13} color={c.mutedText} />
                <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
              </span>
            )}
            {personal.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ContactIcon type="phone" size={13} color={c.mutedText} />
                <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
              </span>
            )}
            {personal.linkedin && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ContactIcon type="linkedin" size={13} color={c.mutedText} />
                <ContactLink path="personal.linkedin" value={personal.linkedin} />
              </span>
            )}
            {personal.website && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ContactIcon type="globe" size={13} color={c.mutedText} />
                <ContactLink path="personal.website" value={personal.website} />
              </span>
            )}
          </div>
          <div style={{ height: '1px', background: c.dividerColor }} />
        </div>
      )}
      {personal.summary && (
        <div data-section="summary">
          {mainLabel('Summary')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}
      {rightColumnOrder.map(key => renderSection(key, 'right'))}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '1054px', fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight }}>
      {sidebar}
      {main}
    </div>
  )
}
