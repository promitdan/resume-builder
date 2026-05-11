import { useResumeStore } from '../../../store/useResumeStore'
import t from '../../../templates/minimal-boxed.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function MinimalBoxedTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder.length  > 0 ? s.leftColumnOrder  : (t.defaultColumns?.left  ?? []))
  const rightColumnOrder = useResumeStore(s => s.rightColumnOrder.length > 0 ? s.rightColumnOrder : (t.defaultColumns?.right ?? []))

  const Rule = () => <div style={{ height: '1px', background: c.dividerColor, margin: '6px 0 10px' }} />

  const sectionHeader = (text) => (
    <div style={{ marginBottom: '2px', marginTop: '18px' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: c.headingText }}>{text}</div>
      <Rule />
    </div>
  )

  const contactLabel = (label) => (
    <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: c.mutedText, marginTop: '8px', marginBottom: '1px' }}>{label}</div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')

  const renderSection = (key, _col) => {
    if (key === 'skills') {
      if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
      return (
        <div key={key} data-section="skills">
          {sectionHeader(skills[0]?._isContinuation ? 'Skills (cont.)' : 'Skills')}
          {skills.map((sk, si) =>
            (sk.items ?? []).length > 0 && (
            <div key={sk.id ?? si} style={{ marginBottom: '4px' }}>
              {sk.label && <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: c.mutedText, marginBottom: '2px' }}>{sk.label}</div>}
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.7' }}>
                {(sk.items ?? []).map((item, ii) => (
                  <span key={ii} data-item={`sk-${si}-${ii}`}>
                    <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                    {ii < sk.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
            )
          )}
        </div>
      )
    }
    if (key === 'languages') {
      if (languages.length === 0) return null
      return (
        <div key={key} data-section="languages">
          {sectionHeader('Languages')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {languages.map((lang, i) => (
              <div key={lang.id ?? i}>
                <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                {lang.proficiency && <span style={{ color: c.mutedText }}> – {lang.proficiency}</span>}
              </div>
            ))}
          </div>
        </div>
      )
    }
    if (key === 'awards') {
      if (awards.length === 0) return null
      return (
        <div key={key} data-section="awards">
          {sectionHeader('Awards')}
          {awards.map((aw, i) => (
            <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
              {aw.title && <div style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></div>}
              {aw.issuer && <div style={{ color: c.mutedText }}><InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></div>}
              {aw.date   && <div style={{ color: c.mutedText }}><InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></div>}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'experience') {
      if (experience.length === 0) return null
      return (
        <div key={key} data-section="experience">
          {sectionHeader(experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience')}
          {experience.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              {!e._bulletContinuation && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, whiteSpace: 'nowrap', marginLeft: '8px' }}>{dateStr(e)}</div>}
              </div>
              )}
              {!e._bulletContinuation && e.location && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}><InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></div>}
              {e.bullets?.filter(Boolean).map((b, bi) => (
                <div key={bi} data-subitem={`bullet-${bi}`} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
                  <span style={{ flexShrink: 0, marginRight: '4px' }}>•</span>
                  <div style={{ flex: 1, minWidth: 0 }}><RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} /></div>
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
          {sectionHeader('Education')}
          {education.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '10px', fontSize: 'var(--resume-body)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700 }}>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                  {e.degree && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor></span>}
                  {e.field  && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor></span>}
                </div>
                {(e.startDate || e.endDate) && <div style={{ color: c.mutedText, whiteSpace: 'nowrap', marginLeft: '8px' }}>{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</div>}
              </div>
              {e.location && <div style={{ color: c.mutedText }}><InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor></div>}
              {e.gpa && <div style={{ color: c.mutedText }}>GPA: {e.gpa}</div>}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'certifications') {
      if (certifications.length === 0) return null
      return (
        <div key={key} data-section="certifications">
          {sectionHeader('Certifications')}
          {certifications.map((cert, i) => (
            <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
                {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
              </div>
              {cert.date && <span style={{ color: c.mutedText, whiteSpace: 'nowrap', marginLeft: '8px' }}><InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
            </div>
          ))}
        </div>
      )
    }
    if (key === 'projects') {
      if (projects.length === 0) return null
      return (
        <div key={key} data-section="projects">
          {sectionHeader('Projects')}
          {projects.map((proj, i) => (
            <div key={proj.id ?? i} data-item={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                {proj.url && <span style={{ fontWeight: 400 }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
              </div>
              {proj.description && <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '2px' }}><RichTextEditor path={`projects.${i}.description`} value={proj.description} /></div>}
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
              {sectionHeader(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}><RichTextEditor path={`custom.${i}.description`} value={sec.description} /></div>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  /* ── Left column ── */
  const leftCol = (
    <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, padding: '24px 20px 40px 28px', boxSizing: 'border-box', flexShrink: 0, borderRight: `1px solid ${c.dividerColor}`, fontFamily: ty.bodyFont }}>

      {pageIndex === 0 && (
        <>
          {sectionHeader('Contact')}
          {personal.email    && <>{contactLabel('Email')}<div style={{ fontSize: 'var(--resume-body)', wordBreak: 'break-all' }}><InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor></div></>}
          {personal.phone    && <>{contactLabel('Phone')}<div style={{ fontSize: 'var(--resume-body)' }}><InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor></div></>}
          {personal.location && <>{contactLabel('Location')}<div style={{ fontSize: 'var(--resume-body)' }}><InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor></div></>}
          {personal.linkedin && <>{contactLabel('LinkedIn')}<div style={{ fontSize: 'var(--resume-body)', wordBreak: 'break-all' }}><ContactLink path="personal.linkedin" value={personal.linkedin} /></div></>}
          {personal.website  && <>{contactLabel('Website')}<div style={{ fontSize: 'var(--resume-body)', wordBreak: 'break-all' }}><ContactLink path="personal.website" value={personal.website} /></div></>}
        </>
      )}

      {leftColumnOrder.map(key => renderSection(key, 'left'))}
    </div>
  )

  /* ── Right column ── */
  const rightCol = (
    <div data-col="right" style={{ flex: 1, padding: '24px 28px 40px 20px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
      {personal.summary && (
        <div data-section="summary">
          {sectionHeader('Profile')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {rightColumnOrder.map(key => renderSection(key, 'right'))}
    </div>
  )

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '1054px' }}>
      {/* Boxed name header */}
      {pageIndex === 0 && (
        <div data-page-header style={{ padding: '20px 28px', borderBottom: `2px solid ${c.mainText}` }}>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, letterSpacing: '-0.3px' }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
          </div>
          {personal.title && <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, marginTop: '3px' }}><InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor></div>}
        </div>
      )}

      {/* Two columns */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {leftCol}
        {rightCol}
      </div>
    </div>
  )
}
