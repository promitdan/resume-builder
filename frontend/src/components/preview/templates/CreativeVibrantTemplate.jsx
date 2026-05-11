import { useResumeStore } from '../../../store/useResumeStore'
import t from '../../../templates/creative-vibrant.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'
import ContactIcon from '../ContactIcon'

const CalIcon = ({ color }) => (
  <svg viewBox="0 0 12 12" fill="none" width="11" height="11" style={{ flexShrink: 0 }}>
    <rect x="1" y="2" width="10" height="9" rx="1.5" stroke={color} strokeWidth="1.2"/>
    <line x1="4" y1="1" x2="4" y2="3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="1" x2="8" y2="3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="1" y1="5" x2="11" y2="5" stroke={color} strokeWidth="1"/>
  </svg>
)

const PinIcon = ({ color }) => (
  <svg viewBox="0 0 12 12" fill="none" width="11" height="11" style={{ flexShrink: 0 }}>
    <path d="M6 1a3.5 3.5 0 013.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 016 1z" stroke={color} strokeWidth="1.2"/>
    <circle cx="6" cy="4.5" r="1.2" stroke={color} strokeWidth="1.1"/>
  </svg>
)

const StarIcon = ({ color }) => (
  <svg viewBox="0 0 14 14" fill={color} width="13" height="13" style={{ flexShrink: 0 }}>
    <path d="M7 1l1.55 3.14L12 4.74l-2.5 2.43.59 3.44L7 9l-3.09 1.62.59-3.44L2 4.74l3.45-.6z"/>
  </svg>
)

const ActivityIcon = ({ color }) => (
  <svg viewBox="0 0 14 14" fill="none" width="13" height="13" style={{ flexShrink: 0 }}>
    <path d="M2 7h2l2-4 2 8 2-4 1 0h1" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AvatarPlaceholder = ({ size, accentColor }) => (
  <svg width={size} height={size} viewBox="0 0 90 90" fill="none">
    <circle cx="45" cy="45" r="43" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
    <circle cx="45" cy="35" r="14" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5"/>
    <path d="M14 75c0-17.12 13.88-31 31-31s31 13.88 31 31" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5"/>
  </svg>
)

export default function CreativeVibrantTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [] } = content
  const leftColumnOrder  = useResumeStore(s => s.leftColumnOrder.length  > 0 ? s.leftColumnOrder  : (t.defaultColumns?.left  ?? []))
  const rightColumnOrder = useResumeStore(s => s.rightColumnOrder.length > 0 ? s.rightColumnOrder : (t.defaultColumns?.right ?? []))
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const SectionHeader = ({ children }) => (
    <div style={{ marginBottom: '10px', marginTop: '18px', paddingBottom: '5px', borderBottom: `2px solid ${c.dividerColor}` }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.sectionHeadingColor }}>
        {children}
      </div>
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' - ')

  const renderSection = (key) => {
    if (key === 'summary') {
      if (!personal.summary) return null
      return (
        <div key="summary" data-section="summary">
          <SectionHeader>Summary</SectionHeader>
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )
    }

    if (key === 'experience') {
      if (experience.length === 0) return null
      return (
        <div key="experience" data-section="experience">
          <SectionHeader>{experience[0]?._isContinuation ? 'Experience (cont.)' : 'Experience'}</SectionHeader>
          {experience.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              {!e._bulletContinuation && (
                <>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: c.mainText }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  </div>
                  {e.company && (
                    <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: c.accentColor }}>
                      <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '14px', fontSize: 'var(--resume-meta)', color: c.mutedText, marginTop: '3px', flexWrap: 'wrap' }}>
                    {dateStr(e) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalIcon color={c.mutedText} />{dateStr(e)}
                      </span>
                    )}
                    {e.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PinIcon color={c.mutedText} />
                        <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                      </span>
                    )}
                  </div>
                </>
              )}
              {e.bullets?.filter(Boolean).map((b, bi) => (
                <div key={bi} data-subitem={`bullet-${bi}`} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginTop: '2px' }}>
                  <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (key === 'skills') {
      if (!skills.some(sk => (sk.items ?? []).length > 0)) return null
      return (
        <div key="skills" data-section="skills">
          <SectionHeader>Skills</SectionHeader>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.flatMap((sk, gi) => (sk.items ?? []).map((item, ii) => (
              <span
                key={`${gi}-${ii}`}
                data-item={`sk-${gi}-${ii}`}
                style={{
                  border: `1px solid ${c.skillBorder}`, background: c.skillBg,
                  borderRadius: 4, padding: '3px 10px',
                  fontSize: 'var(--resume-meta)', color: c.mainText,
                }}
              >
                <InlineEditor path={`skills.${gi}.items.${ii}`} value={item}>{item}</InlineEditor>
              </span>
            )))}
          </div>
        </div>
      )
    }

    if (key === 'education') {
      if (education.length === 0) return null
      return (
        <div key="education" data-section="education">
          <SectionHeader>Education</SectionHeader>
          {education.map((e, i) => (
            <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: c.mainText }}>
                <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                {e.field && <span> in <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor></span>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 'var(--resume-body)', color: c.accentColor }}>
                <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
              </div>
              {(e.startDate || e.endDate) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--resume-meta)', color: c.mutedText, marginTop: '2px' }}>
                  <CalIcon color={c.mutedText} />
                  {[e.startDate, e.endDate].filter(Boolean).join(' - ')}
                  {e.gpa ? ` · GPA ${e.gpa}` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (key === 'awards') {
      if (awards.length === 0) return null
      return (
        <div key="awards" data-section="awards">
          <SectionHeader>Key Achievements</SectionHeader>
          {awards.map((aw, i) => (
            <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <div style={{ marginTop: '2px' }}><StarIcon color={c.starColor} /></div>
              <div>
                {aw.title && (
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: c.mainText }}>
                    <InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor>
                  </div>
                )}
                {aw.description && (
                  <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, lineHeight: '1.5' }}>
                    <RichTextEditor path={`awards.${i}.description`} value={aw.description} />
                  </div>
                )}
                {(aw.issuer || aw.date) && !aw.description && (
                  <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText }}>
                    {[aw.issuer, aw.date].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (key === 'certifications') {
      if (certifications.length === 0) return null
      return (
        <div key="certifications" data-section="certifications">
          <SectionHeader>Certifications</SectionHeader>
          {certifications.map((cert, i) => (
            <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--resume-body)', color: c.mainText }}>
                <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
              </div>
              {(cert.issuer || cert.date) && (
                <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText }}>
                  <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor>
                  {cert.issuer && cert.date ? ' · ' : ''}
                  <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (key === 'projects') {
      if (projects.length === 0) return null
      return (
        <div key="projects" data-section="projects">
          <SectionHeader>Projects</SectionHeader>
          {projects.map((proj, i) => (
            <div key={proj.id ?? i} data-item={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', color: c.accentColor }}>
                <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
              </div>
              {proj.url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--resume-meta)', color: c.mutedText }}>
                  <PinIcon color={c.mutedText} />
                  <ContactLink path={`projects.${i}.url`} value={proj.url} />
                </div>
              )}
              {proj.description && (
                <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginTop: '2px' }}>
                  <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
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
        <div key="languages" data-section="languages">
          <SectionHeader>Languages</SectionHeader>
          {languages.map((lang, i) => (
            <div key={lang.id ?? i} data-item={lang.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ActivityIcon color={c.accentColor} />
              <span style={{ fontSize: 'var(--resume-body)', color: c.mainText }}>
                <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                {lang.proficiency && <span style={{ color: c.mutedText }}> — {lang.proficiency}</span>}
              </span>
            </div>
          ))}
        </div>
      )
    }

    if (key === 'custom') {
      if (custom.length === 0) return null
      return (
        <div key="custom" data-section="custom">
          {custom.map((sec, i) => (
            <div key={sec.id ?? i} data-item={sec.id ?? i}>
              <SectionHeader>
                <InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>
              </SectionHeader>
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText }}>
                <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '1054px' }}>

      {/* Header */}
      {pageIndex === 0 && (
        <div data-page-header style={{ background: c.headerBg, padding: '22px 28px 20px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative watermark circles */}
          <div style={{ position: 'absolute', right: 110, bottom: -30, width: 110, height: 110, borderRadius: '50%', border: '18px solid rgba(255,255,255,0.10)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 30,  bottom: -50, width: 150, height: 150, borderRadius: '50%', border: '18px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            {/* Left: name + contacts */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.15, marginBottom: '4px' }}>
                <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
              </div>
              {personal.title && (
                <div style={{ fontSize: 'var(--resume-sub)', color: 'rgba(255,255,255,0.85)', marginBottom: '12px' }}>
                  <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* Row 1: phone + email */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px' }}>
                  {personal.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.90)' }}>
                      <ContactIcon type="phone" size={12} color="rgba(255,255,255,0.80)" />
                      <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>
                    </span>
                  )}
                  {personal.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.90)' }}>
                      <ContactIcon type="email" size={12} color="rgba(255,255,255,0.80)" />
                      <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>
                    </span>
                  )}
                </div>
                {/* Row 2: linkedin + github/website + location */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px' }}>
                  {personal.linkedin && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.90)' }}>
                      <ContactIcon type="linkedin" size={12} color="rgba(255,255,255,0.80)" />
                      <ContactLink path="personal.linkedin" value={personal.linkedin} style={{ color: 'rgba(255,255,255,0.90)' }} />
                    </span>
                  )}
                  {personal.website && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.90)' }}>
                      <ContactIcon type="globe" size={12} color="rgba(255,255,255,0.80)" />
                      <ContactLink path="personal.website" value={personal.website} style={{ color: 'rgba(255,255,255,0.90)' }} />
                    </span>
                  )}
                  {personal.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.90)' }}>
                      <ContactIcon type="location" size={12} color="rgba(255,255,255,0.80)" />
                      <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: avatar */}
            <div style={{ flexShrink: 0 }}>
              <AvatarPlaceholder size={90} />
            </div>
          </div>
        </div>
      )}

      {/* Body: two columns */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Left column */}
        <div data-col="left" style={{ width: `${l.leftWidthPercent}%`, padding: '16px 20px 40px 24px', boxSizing: 'border-box', flexShrink: 0 }}>
          {leftColumnOrder.map(key => renderSection(key))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#e8e4df', alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Right column */}
        <div data-col="right" style={{ flex: 1, padding: '16px 24px 40px 20px', boxSizing: 'border-box' }}>
          {rightColumnOrder.map(key => renderSection(key))}
        </div>
      </div>

    </div>
  )
}
