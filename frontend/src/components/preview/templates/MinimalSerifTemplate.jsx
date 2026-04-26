import t from '../../../templates/minimal-serif.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function MinimalSerifTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const Bar = () => <div style={{ width: '36px', height: '1px', background: c.headingText, margin: '6px auto 12px' }} />

  const sectionHeader = (text) => (
    <div style={{ marginBottom: '12px', marginTop: '28px', textAlign: 'center' }}>
      <div style={{ fontSize: ty.sectionLabelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: c.headingText }}>{text}</div>
      <Bar />
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  const contactFields = [
    { path: 'personal.email',    val: personal.email },
    { path: 'personal.phone',    val: personal.phone },
    { path: 'personal.location', val: personal.location },
    { path: 'personal.linkedin', val: personal.linkedin, isLink: true },
    { path: 'personal.website',  val: personal.website,  isLink: true },
  ].filter(f => f.val)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '1054px', padding: '48px 56px' }}>
      {pageIndex === 0 && (
        <div data-page-header>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, letterSpacing: '0.5px' }}>
              <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
            </div>
            {personal.title && (
              <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, marginTop: '6px', fontStyle: 'italic' }}>
                <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
              </div>
            )}
            {contactFields.length > 0 && (
              <div style={{ fontSize: '12px', color: c.mutedText, marginTop: '8px' }}>
                {contactFields.map((f, i) => (
                  <span key={f.path}>
                    {f.isLink
                      ? <ContactLink path={f.path} value={f.val} />
                      : <InlineEditor path={f.path} value={f.val}>{f.val}</InlineEditor>
                    }
                    {i < contactFields.length - 1 && <span style={{ margin: '0 6px', color: c.dividerColor }}>|</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ height: '1px', background: c.dividerColor, marginBottom: '4px' }} />
        </div>
      )}

      {personal.summary && (
        <div data-section="summary">
          {sectionHeader('Profile')}
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, textAlign: 'justify' }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {sectionOrder.filter(k => k !== 'personal').map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key} data-section="experience">
            {sectionHeader('Experience')}
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', fontStyle: 'italic' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  </div>
                  {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>{dateStr(e)}</div>}
                </div>
                <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '4px' }}>
                  {e.company && <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>}
                  {e.company && e.location ? ', ' : ''}
                  {e.location && <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor>}
                </div>
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', alignItems: 'baseline', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
                    <span style={{ flexShrink: 0, marginRight: '4px' }}>•</span>
                    <div style={{ flex: 1, minWidth: 0 }}><RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )

        if (key === 'education' && education.length > 0) return (
          <div key={key} data-section="education">
            {sectionHeader('Education')}
            {education.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `edu-${i}`} style={{ marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                </div>
                <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mutedText }}>
                  {[e.degree, e.field].filter(Boolean).join(', ')}
                  {e.degree || e.field ? ' ' : ''}
                  {(e.startDate || e.endDate) && <span>({[e.startDate, e.endDate].filter(Boolean).join(' – ')})</span>}
                </div>
                {e.gpa && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>GPA: {e.gpa}</div>}
              </div>
            ))}
          </div>
        )

        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            {sectionHeader('Skills')}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9', textAlign: 'center' }}>
              {skills.filter(sk => (sk.items ?? []).length > 0).map((sk, si) => (
                <span key={sk.id ?? si}>
                  {(sk.items ?? []).map((item, ii) => (
                    <span key={ii}>
                      <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                      {(si < skills.length - 1 || ii < sk.items.length - 1) ? ' · ' : ''}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )

        if (key === 'languages' && languages.length > 0) return (
          <div key={key} data-section="languages">
            {sectionHeader('Languages')}
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9', textAlign: 'center' }}>
              {languages.map((lang, i) => (
                <span key={lang.id ?? i}>
                  <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                  {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
                  {i < languages.length - 1 && ' · '}
                </span>
              ))}
            </div>
          </div>
        )

        if (key === 'certifications' && certifications.length > 0) return (
          <div key={key} data-section="certifications">
            {sectionHeader('Certifications')}
            {certifications.map((cert, i) => (
              <div key={cert.id ?? i} data-item={cert.id ?? `cert-${i}`} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
                  {cert.issuer && <span style={{ color: c.mutedText, fontStyle: 'italic' }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                </div>
                {cert.date && <span style={{ color: c.mutedText }}><InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key} data-section="awards">
            {sectionHeader('Awards')}
            {awards.map((aw, i) => (
              <div key={aw.id ?? i} data-item={aw.id ?? `award-${i}`} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
                  {aw.issuer && <span style={{ color: c.mutedText, fontStyle: 'italic' }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                </div>
                {aw.date && <span style={{ color: c.mutedText }}><InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
              </div>
            ))}
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key} data-section="projects">
            {sectionHeader('Projects')}
            {projects.map((proj, i) => (
              <div key={proj.id ?? i} data-item={proj.id ?? `proj-${i}`} style={{ marginBottom: l.itemSpacing }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)', fontStyle: 'italic' }}>
                  <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                  {proj.url && <span style={{ fontWeight: 400, fontStyle: 'normal' }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
                </div>
                {proj.description && <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '2px' }}><RichTextEditor path={`projects.${i}.description`} value={proj.description} /></div>}
              </div>
            ))}
          </div>
        )

        if (key === 'custom' && custom.length > 0) return (
          <div key={key} data-section="custom">
            {custom.map((sec, i) => (
              <div key={`${key}-${i}`}>
                {sectionHeader(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
                <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}><RichTextEditor path={`custom.${i}.description`} value={sec.description} /></div>
              </div>
            ))}
          </div>
        )

        return null
      })}
    </div>
  )
}
