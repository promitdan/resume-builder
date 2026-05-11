import { useResumeStore } from '../../../store/useResumeStore'
import t from '../../../templates/modern.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'
import ContactIcon from '../ContactIcon'

export default function ModernTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder.length  > 0 ? s.leftColumnOrder  : (t.defaultColumns?.left  ?? []))
  const rightColumnOrder = useResumeStore(s => s.rightColumnOrder.length > 0 ? s.rightColumnOrder : (t.defaultColumns?.right ?? []))

  const sidebarLabel = (text) => (
    <div style={{ fontSize: 'var(--resume-label)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.sidebarAccent, borderBottom: '1px solid #2d5080', paddingBottom: '4px', marginBottom: '10px', marginTop: '18px' }}>{text}</div>
  )

  const mainLabel = (text) => (
    <div style={{ fontSize: 'var(--resume-label)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c.headingText, borderBottom: `2px solid ${c.sidebarAccent}`, paddingBottom: '4px', marginBottom: '14px', marginTop: '20px' }}>{text}</div>
  )

  const renderSection = (key, col) => {
    const textColor  = col === 'left' ? c.sidebarText : c.mainText
    const mutedColor = col === 'left' ? c.sidebarText : '#888'

    if (key === 'skills') {
      if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
      const pillBg    = col === 'left' ? 'rgba(255,255,255,0.22)' : '#f1f5f9'
      const pillBorder = col === 'left' ? '1.5px solid rgba(255,255,255,0.55)' : '1px solid #e2e8f0'
      const pillColor  = col === 'left' ? '#ffffff' : '#64748b'
      return (
        <div key={key} data-section="skills">
          {col === 'left' ? sidebarLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills') : mainLabel(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '4px' }}>
            {skills.map((sk, si) =>
              (sk.items ?? []).map((item, ii) => (
                <span key={`${si}-${ii}`} data-item={`sk-${si}-${ii}`} style={{ background: pillBg, border: pillBorder, color: pillColor, fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: 500 }}>
                  <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                </span>
              ))
            )}
          </div>
        </div>
      )
    }
    if (key === 'education') {
      if (education.length === 0) return null
      return (
        <div key={key} data-section="education">
          {col === 'left' ? sidebarLabel('Education') : mainLabel('Education')}
          {education.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '10px', fontSize: 'var(--resume-meta)', lineHeight: '1.7' }}>
              <div style={{ fontWeight: '600', color: col === 'left' ? '#fff' : c.headingText }}>
                <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
              </div>
              <div style={{ color: col === 'left' ? '#90b8e0' : '#64748b' }}>
                <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                {e.degree && e.field ? ': ' : ''}
                <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
              </div>
              {e.endDate && (
                <div style={{ color: col === 'left' ? '#7aa0c0' : mutedColor }}>
                  <InlineEditor path={`education.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'languages') {
      if (languages.length === 0) return null
      return (
        <div key={key} data-section="languages">
          {col === 'left' ? sidebarLabel('Languages') : mainLabel('Languages')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {languages.map((lang, i) => (
              <span key={lang.id ?? i} data-item={lang.id ?? i} style={{ background: col === 'left' ? 'rgba(255,255,255,0.22)' : '#f1f5f9', border: col === 'left' ? '1.5px solid rgba(255,255,255,0.55)' : '1px solid #e2e8f0', color: col === 'left' ? '#ffffff' : '#64748b', fontSize: 'var(--resume-meta)', padding: '4px 12px', borderRadius: '12px' }}>
                <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                {lang.proficiency && (
                  <> — <InlineEditor path={`languages.${i}.proficiency`} value={lang.proficiency}>{lang.proficiency}</InlineEditor></>
                )}
              </span>
            ))}
          </div>
        </div>
      )
    }
    if (key === 'experience') {
      if (experience.length === 0) return null
      return (
        <div key={key} data-section="experience">
          {col === 'left' ? sidebarLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History') : mainLabel(experience[0]?._isContinuation ? 'Work History (cont.)' : 'Work History')}
          {experience.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              {!e._bulletContinuation && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: textColor }}>
                  <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                </div>
                <div style={{ fontSize: 'var(--resume-meta)', color: mutedColor }}>
                  <InlineEditor path={`experience.${i}.startDate`} value={e.startDate}>{e.startDate}</InlineEditor>
                  {e.startDate && (e.current || e.endDate) && ' – '}
                  {e.current ? 'Present' : <InlineEditor path={`experience.${i}.endDate`} value={e.endDate}>{e.endDate}</InlineEditor>}
                </div>
              </div>
              )}
              {!e._bulletContinuation && (e.role || e.location) && (
                <div style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: c.sidebarAccent, margin: '2px 0 5px' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.role && e.location ? ' · ' : ''}
                  <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                </div>
              )}
              {e.bullets?.filter(Boolean).map((b, bi) => (
                <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: '1.65', color: col === 'left' ? textColor : '#333', marginBottom: '2px' }}>
                  <span style={{ flexShrink: 0, marginRight: '2px' }}>•</span>
                  <div style={{ flex: 1, minWidth: 0 }}><RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} /></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'certifications') {
      if (certifications.length === 0) return null
      return (
        <div key={key} data-section="certifications">
          {col === 'left' ? sidebarLabel('Certifications') : mainLabel('Certifications')}
          {certifications.map((cert, i) => (
            <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: textColor }}>
                  <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                </span>
                {cert.issuer && (
                  <span style={{ fontSize: 'var(--resume-meta)', color: mutedColor, fontStyle: 'italic' }}>
                    {' · '}<InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                  </span>
                )}
              </div>
              {cert.date && (
                <span style={{ fontSize: 'var(--resume-meta)', color: mutedColor }}>
                  <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                </span>
              )}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'awards') {
      if (awards.length === 0) return null
      return (
        <div key={key} data-section="awards">
          {col === 'left' ? sidebarLabel('Awards & Recognition') : mainLabel('Awards & Recognition')}
          {awards.map((aw, i) => (
            <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: 'var(--resume-body)', fontWeight: '600', color: textColor }}>
                  <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                </span>
                {aw.issuer && (
                  <span style={{ fontSize: 'var(--resume-meta)', color: mutedColor, fontStyle: 'italic' }}>
                    {' · '}<InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor>
                  </span>
                )}
              </div>
              {aw.date && (
                <span style={{ fontSize: 'var(--resume-meta)', color: mutedColor }}>
                  <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor>
                </span>
              )}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'projects') {
      if (projects.length === 0) return null
      return (
        <div key={key} data-section="projects">
          {col === 'left' ? sidebarLabel('Projects') : mainLabel('Projects')}
          {projects.map((proj, i) => (
            <div key={proj.id ?? i} data-item={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ fontSize: 'var(--resume-sub)', fontWeight: '700', color: textColor }}>
                <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
              </div>
              {proj.description && (
                <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.65', color: col === 'left' ? textColor : '#333', marginTop: '2px' }}>
                  <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                </div>
              )}
              {proj.url && (
                <div style={{ fontSize: 'var(--resume-meta)', color: mutedColor, marginTop: '2px' }}>
                  <ContactLink path={`projects.${i}.url`} value={proj.url} />
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'custom') {
      if (custom.length === 0) return null
      return (
        <div key={key} data-section="custom">
          {custom.map((sec, i) => {
            const lines = (sec.description || '').split('\n').filter(Boolean)
            return (
              <div key={sec.id ?? i} data-item={sec.id ?? i}>
                {col === 'left' ? sidebarLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>) : mainLabel(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
                <InlineEditor path={`custom.${i}.description`} value={sec.description} multiline>
                  <div>
                    {lines.map((line, li) => (
                      <div key={li} style={{ fontSize: 'var(--resume-body)', lineHeight: '1.65', color: col === 'left' ? textColor : '#333', marginBottom: '2px' }}>• {line}</div>
                    ))}
                  </div>
                </InlineEditor>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ display: 'flex', fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, minHeight: '1054px' }}>
      <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBackground, color: c.sidebarText, padding: '32px 20px', boxSizing: 'border-box', flexShrink: 0 }}>
        {pageIndex === 0 && (
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
        )}

        {pageIndex === 0 && sidebarLabel('Contact')}
        {pageIndex === 0 && <div style={{ fontSize: 'var(--resume-meta)', marginBottom: '4px' }}>
          {personal.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', wordBreak: 'break-all' }}>
              <ContactIcon type="email" size={13} color={c.sidebarAccent} />
              <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
            </div>
          )}
          {personal.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="phone" size={13} color={c.sidebarAccent} />
              <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
            </div>
          )}
          {personal.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ContactIcon type="location" size={13} color={c.sidebarAccent} />
              <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
            </div>
          )}
          {personal.linkedin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', wordBreak: 'break-all' }}>
              <ContactIcon type="linkedin" size={13} color={c.sidebarAccent} />
              <ContactLink path="personal.linkedin" value={personal.linkedin} />
            </div>
          )}
          {personal.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', wordBreak: 'break-all' }}>
              <ContactIcon type="globe" size={13} color={c.sidebarAccent} />
              <ContactLink path="personal.website" value={personal.website} />
            </div>
          )}
        </div>}

        {leftColumnOrder.map(key => renderSection(key, 'left'))}
      </div>

      <div data-col="right" style={{ flex: 1, background: c.mainBackground, color: c.mainText, padding: '32px 28px', boxSizing: 'border-box' }}>
        {personal.summary && (
          <div data-section="summary">
            {mainLabel('Professional Summary')}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.65', color: '#333', marginBottom: '4px' }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </div>
        )}

        {rightColumnOrder.map(key => renderSection(key, 'right'))}
      </div>
    </div>
  )
}
