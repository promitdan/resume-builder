import t from '../../../templates/classic-academic.json'
import InlineEditor from '../InlineEditor'
import RichTextEditor from '../RichTextEditor'
import ContactLink from '../ContactLink'

const SP = t.layout.sidePadding

const DotLeader = ({ left, right, leftStyle = {}, rightStyle = {} }) => (
  <div style={{ display: 'flex', alignItems: 'baseline' }}>
    <span style={leftStyle}>{left}</span>
    <span style={{ flex: 1, borderBottom: '1px dotted #aaa', margin: '0 8px 3px', minWidth: '12px' }} />
    <span style={{ whiteSpace: 'nowrap', ...rightStyle }}>{right}</span>
  </div>
)

export default function ClassicAcademicTemplate({ content = {}, paletteColors = {} }) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = { ...t.colors, ...paletteColors }, ty = t.typography, l = t.layout

  const band = (text) => (
    <div style={{
      background: c.sectionBandBg,
      borderTop: `1px solid ${c.sectionBandBorder}`,
      borderBottom: `1px solid ${c.sectionBandBorder}`,
      textAlign: 'center',
      padding: '4px 0',
      margin: '14px 0 10px',
    }}>
      <span style={{
        fontFamily: ty.sectionLabelFont,
        fontSize: ty.sectionLabelSize,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        textDecoration: 'underline',
        color: c.headingText,
      }}>{text}</span>
    </div>
  )

  const Diamond = () => <span style={{ marginRight: '7px', fontSize: '10px' }}>❖</span>

  const hasSkillItems = skills.some(sk => (sk.items ?? []).length > 0)
  const hasLinks = personal.linkedin || personal.website

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')

  return (
    <div style={{ fontFamily: ty.bodyFont, fontSize: 'var(--resume-body)', color: c.mainText, lineHeight: ty.bodyLineHeight, background: c.mainBackground }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', padding: `28px ${SP} 12px` }}>
        <div style={{ fontFamily: ty.nameFont, fontSize: ty.nameFontSize, fontWeight: ty.nameFontWeight, letterSpacing: ty.nameLetterSpacing, color: c.headingText, marginBottom: '4px' }}>
          <InlineEditor path="personal.name" value={personal.name}>{personal.name || 'Your Name'}</InlineEditor>
        </div>
        {personal.location && (
          <div style={{ fontSize: 'var(--resume-meta)', color: c.mutedText, marginBottom: '3px' }}>
            <InlineEditor path="personal.location" value={personal.location}>{personal.location}</InlineEditor>
          </div>
        )}
        {personal.title && (
          <div style={{ fontSize: 'var(--resume-body)', fontStyle: 'italic', color: c.mutedText, marginBottom: '4px' }}>
            <InlineEditor path="personal.title" value={personal.title}>{personal.title}</InlineEditor>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', fontSize: 'var(--resume-meta)', color: c.mainText }}>
          {personal.email && <InlineEditor path="personal.email" value={personal.email}>{personal.email}</InlineEditor>}
          {personal.phone && <InlineEditor path="personal.phone" value={personal.phone}>{personal.phone}</InlineEditor>}
        </div>
      </div>

      {/* ── Links section ── */}
      {hasLinks && (
        <>
          {band('Websites and Social Links')}
          <div style={{ padding: `0 ${SP}`, marginBottom: '4px', display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '2px 12px' }}>
            {personal.linkedin && (
              <><span style={{ fontWeight: 600, fontSize: 'var(--resume-body)' }}>LinkedIn:</span>
              <ContactLink path="personal.linkedin" value={personal.linkedin} /></>
            )}
            {personal.website && (
              <><span style={{ fontWeight: 600, fontSize: 'var(--resume-body)' }}>Website:</span>
              <ContactLink path="personal.website" value={personal.website} /></>
            )}
          </div>
        </>
      )}

      {/* ── Summary ── */}
      {personal.summary && (
        <>
          {band('Summary')}
          <div style={{ padding: `0 ${SP}`, fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
            <RichTextEditor path="personal.summary" value={personal.summary} />
          </div>
        </>
      )}

      {/* ── Ordered sections ── */}
      {sectionOrder.filter(k => k !== 'personal').map(key => {

        if (key === 'experience' && experience.length > 0) return (
          <div key={key}>
            {band('Experience')}
            <div style={{ padding: `0 ${SP}` }}>
              {experience.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Diamond />
                    <span style={{ fontWeight: 700, marginRight: '2px' }}>
                      <InlineEditor path={`experience.${i}.role`} value={e.role}>{e.role}</InlineEditor>
                    </span>
                    {e.company && <span style={{ fontWeight: 700 }}>
                      {e.role ? ', ' : ''}<InlineEditor path={`experience.${i}.company`} value={e.company}>{e.company}</InlineEditor>
                    </span>}
                    <span style={{ flex: 1, borderBottom: '1px dotted #aaa', margin: '0 8px 3px', minWidth: '16px' }} />
                    <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--resume-meta)', color: c.mutedText }}>{dateStr(e)}</span>
                  </div>
                  {e.bullets?.filter(Boolean).map((b, bi) => (
                    <div key={bi} style={{ paddingLeft: '18px', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, color: c.mainText, marginTop: '3px' }}>
                      <RichTextEditor path={`experience.${i}.bullets.${bi}`} value={b} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )

        if (key === 'education' && education.length > 0) return (
          <div key={key}>
            {band('Education')}
            <div style={{ padding: `0 ${SP}` }}>
              {education.map((e, i) => (
                <div key={e.id ?? i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Diamond />
                    <span style={{ fontWeight: 700 }}>
                      <InlineEditor path={`education.${i}.institution`} value={e.institution}>{e.institution}</InlineEditor>
                    </span>
                    <span style={{ flex: 1, borderBottom: '1px dotted #aaa', margin: '0 8px 3px', minWidth: '16px' }} />
                    <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--resume-meta)', color: c.mutedText }}>
                      {[e.startDate, e.endDate].filter(Boolean).join(' — ')}
                    </span>
                  </div>
                  <div style={{ paddingLeft: '18px', fontStyle: 'italic', color: c.mutedText, fontSize: 'var(--resume-body)' }}>
                    <InlineEditor path={`education.${i}.degree`} value={e.degree}>{e.degree}</InlineEditor>
                    {e.degree && e.field ? ', ' : ''}
                    <InlineEditor path={`education.${i}.field`} value={e.field}>{e.field}</InlineEditor>
                    {e.location && <span style={{ marginLeft: '16px' }}>
                      <InlineEditor path={`education.${i}.location`} value={e.location}>{e.location}</InlineEditor>
                    </span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

        if (key === 'skills' && hasSkillItems) return (
          <div key={key}>
            {band('Skills')}
            <div style={{ padding: `0 ${SP}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 0' }}>
                {skills.map((sk, si) =>
                  (sk.items ?? []).map((item, ii) => (
                    <div key={`${si}-${ii}`} style={{ display: 'flex', alignItems: 'baseline', paddingRight: '12px' }}>
                      <span style={{ whiteSpace: 'nowrap', marginRight: '4px' }}>•</span>
                      <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--resume-body)' }}>
                        <InlineEditor path={`skills.${si}.items.${ii}`} value={item}>{item}</InlineEditor>
                      </span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #bbb', margin: '0 4px 3px', minWidth: '8px' }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )

        if (key === 'certifications' && certifications.length > 0) return (
          <div key={key}>
            {band('Certifications')}
            <div style={{ padding: `0 ${SP}` }}>
              {certifications.map((cert, i) => (
                <div key={cert.id ?? i} style={{ marginBottom: '8px' }}>
                  <DotLeader
                    left={<><Diamond /><span style={{ fontWeight: 700 }}><InlineEditor path={`certifications.${i}.name`} value={cert.name}>{cert.name}</InlineEditor></span>{cert.issuer && <span style={{ fontWeight: 400 }}>, <InlineEditor path={`certifications.${i}.issuer`} value={cert.issuer}>{cert.issuer}</InlineEditor></span>}</>}
                    right={<InlineEditor path={`certifications.${i}.date`} value={cert.date}>{cert.date}</InlineEditor>}
                    rightStyle={{ color: c.mutedText, fontSize: 'var(--resume-meta)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )

        if (key === 'awards' && awards.length > 0) return (
          <div key={key}>
            {band('Achievements')}
            <div style={{ padding: `0 ${SP}` }}>
              {awards.map((aw, i) => (
                <div key={aw.id ?? i} style={{ marginBottom: '6px', fontSize: 'var(--resume-body)' }}>
                  <RichTextEditor path={`awards.${i}.description`} value={aw.description || `${aw.title}${aw.issuer ? `, ${aw.issuer}` : ''}`} />
                </div>
              ))}
            </div>
          </div>
        )

        if (key === 'languages' && languages.length > 0) return (
          <div key={key}>
            {band('Languages')}
            <div style={{ padding: `0 ${SP}`, display: 'flex', flexWrap: 'wrap', gap: '4px 32px', fontSize: 'var(--resume-body)' }}>
              {languages.map((lang, i) => (
                <span key={lang.id ?? i}>
                  <InlineEditor path={`languages.${i}.language`} value={lang.language}>{lang.language}</InlineEditor>
                  {lang.proficiency && <span style={{ color: c.mutedText }}> ({lang.proficiency})</span>}
                </span>
              ))}
            </div>
          </div>
        )

        if (key === 'projects' && projects.length > 0) return (
          <div key={key}>
            {band('Projects')}
            <div style={{ padding: `0 ${SP}` }}>
              {projects.map((proj, i) => (
                <div key={proj.id ?? i} style={{ marginBottom: l.itemSpacing }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Diamond />
                    <span style={{ fontWeight: 700 }}>
                      <InlineEditor path={`projects.${i}.title`} value={proj.title}>{proj.title}</InlineEditor>
                    </span>
                    {proj.url && <><span style={{ flex: 1, borderBottom: '1px dotted #aaa', margin: '0 8px 3px', minWidth: '16px' }} />
                    <ContactLink path={`projects.${i}.url`} value={proj.url} style={{ fontSize: 'var(--resume-meta)', color: c.mutedText }} /></>}
                  </div>
                  {proj.description && (
                    <div style={{ paddingLeft: '18px', fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight, marginTop: '3px' }}>
                      <RichTextEditor path={`projects.${i}.description`} value={proj.description} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

        if (key === 'custom' && custom.length > 0) return custom.map((sec, i) => (
          <div key={`${key}-${i}`}>
            {band(<InlineEditor path={`custom.${i}.title`} value={sec.title}>{sec.title || 'Other'}</InlineEditor>)}
            <div style={{ padding: `0 ${SP}`, fontSize: 'var(--resume-body)', lineHeight: ty.bodyLineHeight }}>
              <RichTextEditor path={`custom.${i}.description`} value={sec.description} />
            </div>
          </div>
        ))

        return null
      })}

      <div style={{ height: '32px' }} />
    </div>
  )
}
