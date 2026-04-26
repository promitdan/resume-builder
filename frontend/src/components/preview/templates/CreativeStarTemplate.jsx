import t from '../../../templates/creative-star.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

const Star = ({ color = '#111' }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill={color}>
    <path d="M9 0l1.5 6.5L17 9l-6.5 1.5L9 18l-1.5-6.5L1 9l6.5-1.5z"/>
  </svg>
)

export default function CreativeStarTemplate({ content = {}, paletteColors = {}, pageIndex = 0 }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const SectionHeader = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', marginTop: '28px' }}>
      <div style={{ fontFamily: ty.sectionLabelFont, fontSize: ty.sectionLabelSize, fontWeight: ty.sectionLabelWeight, color: c.headingText }}>{children}</div>
      <Star color={c.headingText} />
    </div>
  )

  const Divider = () => <div style={{ height: '1px', background: c.dividerColor, marginBottom: '14px' }} />

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' · ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  /* ── Header: name left + details table right ── */
  const detailRows = [
    personal.phone    && { label: 'Phone',    val: personal.phone,    path: 'personal.phone',    bold: true },
    personal.email    && { label: 'Email',    val: personal.email,    path: 'personal.email',    bold: true },
    personal.location && { label: 'Location', val: personal.location, path: 'personal.location', bold: true },
  ].filter(Boolean)

  const nameParts = (personal.name || 'Your Name').split(' ')
  const firstName = nameParts[0] || ''
  const lastName  = nameParts.slice(1).join(' ') || ''

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBg, minHeight: '11in', padding: '44px 44px 52px' }}>

      {pageIndex === 0 && (
        <div data-page-header>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
            {/* Name block */}
            <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, color: c.headingText, lineHeight: 1.0 }}>
              <div><InlineEditor path="personal.name" value={personal.name}>{firstName}</InlineEditor></div>
              {lastName && <div>{lastName}</div>}
              {personal.title && <div style={{ fontSize: 'var(--resume-meta)', fontFamily: ty.bodyFont, fontWeight: 400, color: c.mutedText, marginTop: '10px' }}><InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor></div>}
            </div>

            {/* Details table */}
            {detailRows.length > 0 && (
              <div style={{ minWidth: '260px', maxWidth: '340px' }}>
                <div style={{ fontFamily: ty.sectionLabelFont, fontSize: 'var(--resume-sub)', fontWeight: 700, color: c.headingText, marginBottom: '6px' }}>Details</div>
                {detailRows.map((row, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', fontSize: 'var(--resume-body)' }}>
                      <span style={{ color: c.tableLabel }}>{row.label}</span>
                      <span style={{ fontWeight: row.bold ? 700 : 400, color: c.tableValue, marginLeft: '16px', textAlign: 'right', wordBreak: 'break-all' }}>
                        <InlineEditor path={row.path} value={row.val}>{row.val}</InlineEditor>
                      </span>
                    </div>
                    {i < detailRows.length - 1 && <div style={{ height: '1px', background: c.dividerColor }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full-width divider */}
          <div style={{ height: '1px', background: c.dividerColor, marginBottom: '4px' }} />

          {/* Websites & Social Links */}
          {(personal.linkedin || personal.website) && (
            <>
              <SectionHeader>Websites and Social Links</SectionHeader>
              <Divider />
              <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
                {personal.linkedin && <div><strong>LinkedIn: </strong><ContactLink path="personal.linkedin" value={personal.linkedin} /></div>}
                {personal.website  && <div><strong>GitHub: </strong><ContactLink path="personal.website" value={personal.website} /></div>}
              </div>
            </>
          )}
        </div>
      )}

      {/* Summary */}
      {personal.summary && (
        <div data-section="summary">
          <SectionHeader>Summary</SectionHeader>
          <Divider />
          <div style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </div>
      )}

      {/* Sections */}
      {sectionOrder.filter(k => !['personal'].includes(k)).map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key} data-section="experience">
            <SectionHeader>Experience</SectionHeader>
            <Divider />
            {experience.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `exp-${i}`} style={{ marginBottom: l.itemSpacing }}>
                {dateStr(e) && <div style={{ fontSize: '12px', color: c.mutedText, marginBottom: '2px' }}>{dateStr(e)}</div>}
                <div style={{ fontWeight: 700, fontSize: 'var(--resume-body)' }}>
                  <InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                </div>
                {e.role && <div style={{ fontSize: 'var(--resume-body)', color: c.mutedText }}>
                  <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                  {e.location && <span>, <InlineEditor path={`experience.${i}.location`} value={e.location}>{e.location}</InlineEditor></span>}
                </div>}
                {e.bullets?.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '4px' }}>
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
            <Divider />
            {education.map((e, i) => (
              <div key={e.id ?? i} data-item={e.id ?? `edu-${i}`} style={{ marginBottom: '12px', fontSize: 'var(--resume-body)' }}>
                {(e.startDate || e.endDate) && <div style={{ fontSize: '12px', color: c.mutedText, marginBottom: '2px' }}>{[e.startDate, e.endDate].filter(Boolean).join(' · ')}</div>}
                <div style={{ fontWeight: 700 }}>
                  <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                </div>
                <div style={{ color: c.mutedText }}>
                  {[e.degree, e.field].filter(Boolean).map((v, vi, arr) => (
                    <span key={vi}>{v}{vi < arr.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

        if (key === 'skills' && hasSkills) return (
          <div key={key} data-section="skills">
            <SectionHeader>Skills</SectionHeader>
            <Divider />
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
              {allSkillItems.map((item, ii) => (
                <span key={ii}>{item}{ii < allSkillItems.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
        )

        if (key === 'languages' && languages.length > 0) return (
          <div key={key} data-section="languages">
            <SectionHeader>Languages</SectionHeader>
            <Divider />
            <div style={{ fontSize: 'var(--resume-body)', lineHeight: '1.9' }}>
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
            <SectionHeader>Certifications</SectionHeader>
            <Divider />
            {certifications.map((cert, i) => (
              <div key={cert.id ?? i} data-item={cert.id ?? `cert-${i}`} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
                <div style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></div>
                {cert.issuer && <div style={{ color: c.mutedText }}><InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></div>}
                {cert.date   && <div style={{ fontSize: '12px', color: c.mutedText }}><InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor></div>}
              </div>
            ))}
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key} data-section="awards">
            <SectionHeader>Achievements</SectionHeader>
            <Divider />
            {awards.map((aw, i) => (
              <div key={aw.id ?? i} data-item={aw.id ?? `award-${i}`} style={{ marginBottom: '8px', fontSize: 'var(--resume-body)' }}>
                {aw.title && <span style={{ fontWeight: 700 }}><InlineEditor path={`awards.${i}.title`} value={aw.title}>{aw.title}</InlineEditor></span>}
                {aw.issuer && <span style={{ color: c.mutedText }}> · <InlineEditor path={`awards.${i}.issuer`} value={aw.issuer}>{aw.issuer}</InlineEditor></span>}
                {aw.date   && <span style={{ fontSize: '12px', color: c.mutedText }}> · <InlineEditor path={`awards.${i}.date`} value={aw.date}>{aw.date}</InlineEditor></span>}
                {aw.description && <div style={{ marginTop: '2px' }}><RichTextEditor path={`awards.${i}.description`} value={aw.description} /></div>}
              </div>
            ))}
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key} data-section="projects">
            <SectionHeader>Projects</SectionHeader>
            <Divider />
            {projects.map((proj, i) => (
              <div key={proj.id ?? i} data-item={proj.id ?? `proj-${i}`} style={{ marginBottom: l.itemSpacing }}>
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
              <div key={`${key}-${i}`}>
                <SectionHeader><InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor></SectionHeader>
                <Divider />
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
