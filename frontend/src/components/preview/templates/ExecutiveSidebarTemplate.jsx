import t from '../../../templates/executive-sidebar.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'
import ContactIcon from '../ContactIcon'

export default function ExecutiveSidebarTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const SectionHeader = ({ children }) => (
    <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: c.headingText, marginBottom: '8px', marginTop: '20px', paddingBottom: '4px', borderBottom: `1.5px solid ${c.dividerColor}` }}>
      {children}
    </div>
  )

  const sidebarLabel = (text) => (
    <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: c.sidebarMuted, marginBottom: '8px', marginTop: '18px' }}>{text}</div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const iconRow = (type, val, path, isLink = false) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '6px', fontSize: 'var(--resume-body)', color: c.sidebarText }}>
      <span style={{ marginTop: '1px', flexShrink: 0 }}><ContactIcon type={type} size={13} color={c.sidebarMuted} /></span>
      <span style={{ wordBreak: 'break-all' }}>
        {isLink
          ? <ContactLink path={path} value={val} />
          : <InlineEditor path={path} value={val}>{val}</InlineEditor>
        }
      </span>
    </div>
  )

  /* ── Left sidebar ── */
  const leftCol = (
    <div data-col="left" style={{ width: `${l.sidebarWidthPercent}%`, background: c.sidebarBg, padding: '24px 20px 40px 24px', boxSizing: 'border-box', flexShrink: 0, fontFamily: ty.bodyFont }}>
      {pageIndex === 0 && (
        <>
          {sidebarLabel('Details')}
          {personal.email    && iconRow('email',    personal.email,    'personal.email')}
          {personal.location && iconRow('location', personal.location, 'personal.location')}
          {personal.phone    && iconRow('phone',    personal.phone,    'personal.phone')}
          {personal.linkedin && iconRow('linkedin', personal.linkedin, 'personal.linkedin', true)}
          {personal.website  && iconRow('globe',    personal.website,  'personal.website',  true)}
        </>
      )}

      {hasSkills && (
        <div data-section="skills">
          <div style={{ height: '1px', background: c.dividerColor, margin: '16px 0' }} />
          {sidebarLabel('Skills')}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
            {allSkillItems.map((item, ii) => (
              <li key={ii} style={{ paddingLeft: '14px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {languages.length > 0 && (
        <div data-section="languages">
          <div style={{ height: '1px', background: c.dividerColor, margin: '16px 0' }} />
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

  /* ── Right column ── */
  const rightCol = (
    <div data-col="right" style={{ flex: 1, padding: '24px 28px 40px 24px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
      {personal.summary && (
        <div data-section="summary">
          <SectionHeader>Summary</SectionHeader>
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k)).map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key} data-section="experience">
            <SectionHeader>Experience</SectionHeader>
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                </div>
                {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}>{dateStr(e)}</div>}
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
            <SectionHeader>Education</SectionHeader>
            {education.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? i} style={{ marginBottom: '10px', fontSize: 'var(--resume-body)' }}>
                <div style={{ fontWeight: 700 }}>
                  <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                  {e.field && <span>, <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor></span>}
                  {e.location && <span style={{ fontWeight: 400, color: c.mutedText }}>, <InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
                <div>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                </div>
                {(e.startDate || e.endDate) && <div style={{ color: c.mutedText }}>{[e.startDate, e.endDate].filter(Boolean).join(' — ')}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>}
              </div>
            ))}
          </div>
        )

        if (key === 'certifications' && certifications.length > 0) return (
          <div key={key} data-section="certifications">
            <SectionHeader>Certifications and Licenses</SectionHeader>
            {certifications.map((cert, i) => (
              <div key={cert.id ?? i} data-item={cert.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                <InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor>
                {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                {cert.date   && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key} data-section="awards">
            <SectionHeader>Achievements</SectionHeader>
            {awards.map((aw, i) => (
              <div key={aw.id ?? i} data-item={aw.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
                {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                {aw.date   && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key} data-section="projects">
            <SectionHeader>Projects</SectionHeader>
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

        if (key === 'custom' && custom.length > 0) return (
          <div key={key} data-section="custom">
            {custom.map((sec, i) => (
              <div key={sec.id ?? i} data-item={sec.id ?? i}>
                <SectionHeader><InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor></SectionHeader>
                <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}><RichTextEditor path={`custom.${i}.description`} value={sec.description} /></div>
              </div>
            ))}
          </div>
        )

        return null
      })}
    </div>
  )

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '1054px' }}>
      {/* Dark banner header */}
      {pageIndex === 0 && (
        <div data-page-header style={{ background: c.bannerBg, padding: '22px 24px 18px' }}>
          <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.bannerText, letterSpacing: '0.3px' }}>
            <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
          </div>
          {personal.title && <div style={{ fontSize: 'var(--resume-meta)', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}><InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor></div>}
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
