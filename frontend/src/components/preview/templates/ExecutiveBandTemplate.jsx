import t from '../../../templates/executive-band.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function ExecutiveBandTemplate({ content = {}, paletteColors = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const Badge = ({ children }) => (
    <div style={{ display: 'inline-block', background: c.labelBg, color: c.labelText, fontSize: ty.sectionLabelSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', padding: '3px 8px', marginBottom: '10px', marginTop: '18px' }}>
      {children}
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  /* ── Left column ── */
  const leftCol = (
    <div style={{ width: `${l.sidebarWidthPercent}%`, padding: '24px 20px 40px 28px', boxSizing: 'border-box', flexShrink: 0, borderRight: `1px solid ${c.dividerColor}`, fontFamily: ty.bodyFont }}>
      <Badge>Details</Badge>
      <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
        {personal.location && <div><InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor></div>}
        {personal.phone    && <div><InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor></div>}
        {personal.email    && <div style={{ wordBreak: 'break-all' }}><InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor></div>}
      </div>

      {(personal.linkedin || personal.website) && (
        <>
          <Badge>Websites &amp; Social Links</Badge>
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {personal.linkedin && <div><span style={{ fontWeight: 700 }}>LinkedIn: </span><ContactLink path="personal.linkedin" value={personal.linkedin} /></div>}
            {personal.website  && <div><span style={{ fontWeight: 700 }}>GitHub: </span><ContactLink path="personal.website" value={personal.website} /></div>}
          </div>
        </>
      )}

      {hasSkills && (
        <>
          <Badge>Skills</Badge>
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
              <div key={sk.id ?? si} style={{ marginBottom: '2px' }}>
                {(sk.items ?? []).map((item, ii) => (
                  <span key={ii}>
                    <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                    {ii < sk.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {languages.length > 0 && (
        <>
          <Badge>Languages</Badge>
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.8' }}>
            {languages.map((lang, i) => (
              <div key={lang.id ?? i}>
                <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )

  /* ── Right column ── */
  const rightCol = (
    <div style={{ flex: 1, padding: '8px 28px 40px 20px', boxSizing: 'border-box', fontFamily: ty.bodyFont }}>
      {personal.summary && (
        <>
          <Badge>Summary</Badge>
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginBottom: '4px' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </>
      )}

      {sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k)).map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key}>
            <Badge>Experience</Badge>
            {experience.map((e, i) => (
              <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  {e.location && <span style={{ fontWeight: 400, color: c.mutedText }}>, <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
                {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.dateMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', margin: '2px 0 4px' }}>{dateStr(e)}</div>}
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
          <div key={key}>
            <Badge>Education</Badge>
            {education.map((e, i) => (
              <div key={e.id ?? i} style={{ marginBottom: '10px', fontSize: 'var(--resume-body)' }}>
                <div style={{ fontWeight: 700 }}>
                  <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                  {e.field && <span>, <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor></span>}
                </div>
                <div style={{ color: c.mutedText }}>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                  {e.location && <span>, <InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>
                {(e.startDate || e.endDate) && <div style={{ color: c.mutedText }}>{[e.startDate, e.endDate].filter(Boolean).join(' – ')}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>}
              </div>
            ))}
          </div>
        )

        if (key === 'certifications' && certifications.length > 0) return (
          <div key={key}>
            <Badge>Certifications</Badge>
            {certifications.map((cert, i) => (
              <div key={cert.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
                {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                {cert.date   && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key}>
            <Badge>Achievements</Badge>
            {awards.map((aw, i) => (
              <div key={aw.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
                {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                {aw.date   && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
                {aw.description && <div style={{ marginTop: '2px' }}><RichTextEditor path={`awards.${i}.description`} value={aw.description} /></div>}
              </div>
            ))}
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key}>
            <Badge>Projects</Badge>
            {projects.map((proj, i) => (
              <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  {proj.url && <span style={{ fontWeight: 400 }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
                </div>
                {proj.description && <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '2px' }}><RichTextEditor path={`projects.${i}.description`} value={proj.description} /></div>}
              </div>
            ))}
          </div>
        )

        if (key === 'custom' && custom.length > 0) return custom.map((sec, i) => (
          <div key={`${key}-${i}`}>
            <Badge><InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor></Badge>
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}><RichTextEditor path={`custom.${i}.description`} value={sec.description} /></div>
          </div>
        ))

        return null
      })}
    </div>
  )

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '11in' }}>
      {/* Colored band header */}
      <div style={{ background: c.bannerBg, padding: '28px 28px 22px 28px' }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.bannerText, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
        </div>
        {personal.title && <div style={{ fontSize: 'var(--resume-meta)', color: c.bannerText, opacity: 0.75, marginTop: '5px' }}><InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor></div>}
      </div>

      {/* Two columns */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {leftCol}
        {rightCol}
      </div>
    </div>
  )
}
