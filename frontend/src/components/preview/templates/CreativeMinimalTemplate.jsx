import t from '../../../templates/creative-minimal.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

export default function CreativeMinimalTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const labelW = `${l.labelWidthPercent}%`

  const Row = ({ label, children }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ width: labelW, flexShrink: 0, paddingTop: '1px' }}>
        <span style={{ fontSize: ty.sectionLabelSize, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: c.labelColor, fontFamily: 'Arial, Helvetica, sans-serif' }}>{label}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const contactFields = [
    { path: 'personal.phone',    val: personal.phone },
    { path: 'personal.email',    val: personal.email },
    { path: 'personal.location', val: personal.location },
    { path: 'personal.linkedin', val: personal.linkedin, isLink: true },
    { path: 'personal.website',  val: personal.website,  isLink: true },
  ].filter(f => f.val)

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '1054px', padding: '44px 44px 52px' }}>

      {pageIndex === 0 && (
        <div data-page-header>
          {/* Header: name left + contact right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, lineHeight: 1.15 }}>
              <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
              {personal.title && <div style={{ fontSize: 'var(--resume-meta)', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 400, color: c.mutedText, marginTop: '6px' }}><InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor></div>}
            </div>
            <div style={{ textAlign: 'right', fontSize: 'var(--resume-body)', lineHeight: '1.9', color: c.mainText }}>
              {contactFields.map((f) => (
                <div key={f.path}>
                  {f.isLink
                    ? <ContactLink path={f.path} value={f.val} />
                    : <InlineEditor path={f.path} value={f.val}>{f.val}</InlineEditor>
                  }
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: '1px', background: c.dividerColor, marginBottom: '24px' }} />
        </div>
      )}

      {/* Sections as label + content rows */}
      {personal.summary && (
        <div data-section="summary">
          <Row label="Summary">
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
              <RichTextEditor path="personal.summary" value={personal.summary} />
            </div>
          </Row>
        </div>
      )}

      {sectionOrder.filter(k => k !== 'personal').map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key} data-section="experience">
            <Row label="Experience">
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    {e.company && <span>, <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor></span>}
                  </div>
                  {dateStr(e) && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText, marginBottom: '3px' }}>{dateStr(e)}</div>}
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
                      <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                    </div>
                  ))}
                </div>
              ))}
            </Row>
          </div>
        )

        if (key === 'education' && education.length > 0) return (
          <div key={key} data-section="education">
            <Row label="Education">
              {education.map((e, i) => (
                <div key={e.id ?? i} data-item={e.id ?? `edu-${i}`} style={{ marginBottom: '10px', fontSize: 'var(--resume-body)' }}>
                  <div style={{ fontWeight: 700 }}>
                    <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    {e.location && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                    {e.degree && <span>, <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor></span>}
                    {e.field  && <span>, <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor></span>}
                  </div>
                  {(e.startDate || e.endDate) && <div style={{ color: c.mutedText }}>{[e.startDate, e.endDate].filter(Boolean).join(' — ')}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>}
                </div>
              ))}
            </Row>
          </div>
        )

        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            <Row label="Skills">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                {allSkillItems.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 'var(--resume-body)', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span>•</span><span>{item}</span>
                  </div>
                ))}
              </div>
            </Row>
          </div>
        )

        if (key === 'languages' && languages.length > 0) return (
          <div key={key} data-section="languages">
            <Row label="Languages">
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
                {languages.map((lang, i) => (
                  <span key={lang.id ?? i}>
                    <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                    {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
                    {i < languages.length - 1 && ' · '}
                  </span>
                ))}
              </div>
            </Row>
          </div>
        )

        if (key === 'certifications' && certifications.length > 0) return (
          <div key={key} data-section="certifications">
            <Row label="Certifications">
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} data-item={cert.id ?? `cert-${i}`} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                  <span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>
                  {cert.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}
                  {cert.date   && <span style={{ color: c.mutedText }}> · <InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></span>}
                </div>
              ))}
            </Row>
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key} data-section="awards">
            <Row label="Achievements">
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} data-item={aw.id ?? `award-${i}`} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                  {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
                  {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                  {aw.date   && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
                  {aw.description && <div style={{ marginTop: '2px' }}><RichTextEditor path={`awards.${i}.description`} value={aw.description} /></div>}
                </div>
              ))}
            </Row>
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key} data-section="projects">
            <Row label="Projects">
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} data-item={proj.id ?? `proj-${i}`} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                    {proj.url && <span style={{ fontWeight: 400 }}> · <ContactLink path={`projects.${i}.url`} value={proj.url} /></span>}
                  </div>
                  {proj.description && <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '2px' }}><RichTextEditor path={`projects.${i}.description`} value={proj.description} /></div>}
                </div>
              ))}
            </Row>
          </div>
        )

        if (key === 'custom' && custom.length > 0) return (
          <div key={key} data-section="custom">
            {custom.map((sec, i) => (
              <Row key={`${key}-${i}`} label={<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>}>
                <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}><RichTextEditor path={`custom.${i}.description`} value={sec.description} /></div>
              </Row>
            ))}
          </div>
        )

        return null
      })}
    </div>
  )
}
