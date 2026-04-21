const fs   = require('fs')
const path = require('path')

function loadTemplate(templateId) {
  const file = path.join(__dirname, '../../templates', `${templateId}.json`)
  if (!fs.existsSync(file)) throw new Error(`Unknown template: ${templateId}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderContact(personal) {
  return [personal.email, personal.phone, personal.location, personal.linkedin, personal.website]
    .filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')
}

function renderBullets(bullets = [], bulletStyle) {
  if (!bullets.length) return ''
  const marker = bulletStyle === 'dash' ? '–' : '•'
  return `<ul style="margin:4px 0 0 16px;padding:0;list-style:none;">
    ${bullets.map((b) => `<li style="margin-bottom:2px;">${marker} ${esc(b)}</li>`).join('')}
  </ul>`
}

function renderSectionLabel(label, t) {
  const { colors, typography } = t
  return `<div style="
    font-family:${typography.sectionLabelFont};
    font-size:${typography.sectionLabelSize};
    font-weight:${t.sections.labelWeight || 'bold'};
    text-transform:${typography.sectionLabelStyle};
    letter-spacing:${typography.sectionLabelSpacing};
    color:${colors.headingText};
    border-bottom:${t.sections.dividerStyle === 'none' ? 'none' : `1px solid ${colors.dividerColor}`};
    margin-bottom:6px;padding-bottom:3px;margin-top:14px;
  ">${esc(label)}</div>`
}

function renderExperience(entries, t) {
  if (!entries.length) return ''
  return renderSectionLabel('Experience', t) + entries.map((e) => `
    <div style="margin-bottom:${t.layout.itemSpacing};">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(e.role)}${e.role && e.company ? ' — ' : ''}${esc(e.company)}</span>
        <span style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.startDate)}${e.startDate ? ' – ' : ''}${esc(e.current ? 'Present' : e.endDate)}</span>
      </div>
      ${e.location ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.location)}</div>` : ''}
      ${renderBullets(e.bullets, t.sections.bulletStyle)}
    </div>`).join('')
}

function renderEducation(entries, t) {
  if (!entries.length) return ''
  return renderSectionLabel('Education', t) + entries.map((e) => `
    <div style="margin-bottom:${t.layout.itemSpacing};">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(e.degree)} ${esc(e.field)}</span>
        <span style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.endDate)}</span>
      </div>
      <div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(e.institution)}</div>
      ${e.gpa ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('')
}

function renderSkills(skills, t) {
  if (!skills.length) return ''
  return renderSectionLabel('Skills', t) + skills.map((s) => `
    <div style="margin-bottom:6px;">
      ${s.category ? `<span style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(s.category)}: </span>` : ''}
      <span style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${s.items.map(esc).join(', ')}</span>
    </div>`).join('')
}

function renderProjects(projects, t) {
  if (!projects.length) return ''
  return renderSectionLabel('Projects', t) + projects.map((p) => `
    <div style="margin-bottom:${t.layout.itemSpacing};">
      <div style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(p.name)}${p.url ? ` — <a href="${esc(p.url)}" style="color:${t.colors.accentColor};">${esc(p.url)}</a>` : ''}</div>
      ${p.description ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(p.description)}</div>` : ''}
      ${renderBullets(p.bullets, t.sections.bulletStyle)}
    </div>`).join('')
}

function renderCertifications(certs, t) {
  if (!certs.length) return ''
  return renderSectionLabel('Certifications', t) + certs.map((c) => `
    <div style="margin-bottom:4px;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">
      <strong>${esc(c.name)}</strong>${c.issuer ? ` — ${esc(c.issuer)}` : ''}${c.date ? `, ${esc(c.date)}` : ''}
    </div>`).join('')
}

function renderLanguages(langs, t) {
  if (!langs.length) return ''
  return renderSectionLabel('Languages', t) + langs.map((l) => `
    <div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(l.language)}${l.proficiency ? ` — ${esc(l.proficiency)}` : ''}</div>`).join('')
}

function renderAwards(awards, t) {
  if (!awards.length) return ''
  return renderSectionLabel('Awards', t) + awards.map((a) => `
    <div style="margin-bottom:4px;">
      <div style="font-weight:bold;font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(a.title)}${a.issuer ? ` — ${esc(a.issuer)}` : ''}</div>
      ${a.description ? `<div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mutedText};">${esc(a.description)}</div>` : ''}
    </div>`).join('')
}

function renderCustom(items, t) {
  if (!items.length) return ''
  const label = items[0]?.label || 'Other'
  return renderSectionLabel(label, t) + items.map((i) => `
    <div style="font-size:${t.typography.bodyFontSize};color:${t.colors.mainText};">${esc(i.content)}</div>`).join('')
}

function renderSection(key, content, t) {
  switch (key) {
    case 'experience':     return renderExperience(content.experience, t)
    case 'education':      return renderEducation(content.education, t)
    case 'skills':         return renderSkills(content.skills, t)
    case 'projects':       return renderProjects(content.projects, t)
    case 'certifications': return renderCertifications(content.certifications, t)
    case 'languages':      return renderLanguages(content.languages, t)
    case 'awards':         return renderAwards(content.awards, t)
    case 'custom':         return renderCustom(content.custom, t)
    default:               return ''
  }
}

function renderSingleColumn(content, t) {
  const { personal } = content
  const { colors, typography, header, layout } = t

  const headerHtml = header.placement === 'top-full-bleed'
    ? `<div style="background:${colors.headerBackground};color:${colors.headerText};padding:24px ${layout.contentPaddingSides || '0.75in'};">
        <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};letter-spacing:${typography.nameLetterSpacing || 'normal'};">${esc(personal.name)}</div>
        <div style="font-size:${typography.titleFontSize};color:${colors.headerMuted || colors.headerText};margin-top:4px;">${esc(personal.title)}</div>
        <div style="font-size:11px;margin-top:6px;color:${colors.headerMuted || colors.headerText};">${renderContact(personal)}</div>
      </div>`
    : `<div style="text-align:${header.alignment};padding-bottom:12px;border-bottom:${t.sections.dividerStyle === 'solid-thick' ? '2px' : '1px'} solid ${colors.dividerColor};margin-bottom:14px;">
        <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};color:${colors.headingText};">${esc(personal.name)}</div>
        ${personal.title ? `<div style="font-size:${typography.titleFontSize};color:${colors.mutedText};margin-top:2px;">${esc(personal.title)}</div>` : ''}
        <div style="font-size:11px;color:${colors.mutedText};margin-top:4px;">${renderContact(personal)}</div>
      </div>`

  const contentPad = layout.contentPaddingSides ? `padding:${layout.contentPaddingTop || '0'} ${layout.contentPaddingSides};` : ''

  const sectionsHtml = content.sectionOrder
    .filter((k) => k !== 'personal')
    .map((k) => renderSection(k, content, t))
    .join('')

  const summaryHtml = personal.summary
    ? `<div style="font-size:${typography.bodyFontSize};color:${colors.mainText};font-style:${typography.summaryFontStyle || 'normal'};margin-bottom:12px;">${esc(personal.summary)}</div>`
    : ''

  return `
    ${headerHtml}
    <div style="${contentPad}">
      ${summaryHtml}
      ${sectionsHtml}
    </div>`
}

function renderTwoColumn(content, t) {
  const { personal } = content
  const { colors, typography, header, layout, sections } = t
  const sidebarW = layout.sidebarWidthPercent
  const mainW    = 100 - sidebarW

  const sidebarSections = sections.sidebarSections || []
  const mainSections    = sections.mainSections    || []

  let headerHtml = ''
  if (header.placement === 'top-full-bleed-gradient') {
    headerHtml = `<div style="background:linear-gradient(135deg,${colors.headerGradientStart},${colors.headerGradientEnd});color:#fff;padding:20px 24px;">
      <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};">${esc(personal.name)}</div>
      <div style="font-size:${typography.titleFontSize};opacity:0.9;margin-top:3px;">${esc(personal.title)}</div>
    </div>`
  }

  const sidebarHeader = header.placement === 'sidebar-top'
    ? `<div style="text-align:${header.alignment};margin-bottom:14px;">
        <div style="width:${header.avatarSizePx || 56}px;height:${header.avatarSizePx || 56}px;background:${colors.sidebarAccent};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:#fff;margin:0 auto 8px;">${esc((personal.name || '?')[0])}</div>
        <div style="font-family:${typography.nameFont};font-size:${typography.nameFontSize};font-weight:${typography.nameFontWeight};color:${colors.sidebarText};">${esc(personal.name)}</div>
        <div style="font-size:${typography.titleFontSize};color:${colors.sidebarAccent};margin-top:3px;">${esc(personal.title)}</div>
      </div>`
    : ''

  const sidebarContactHtml = `<div style="font-size:10px;color:${colors.sidebarText || '#fff'};margin-bottom:12px;">
    ${[personal.email, personal.phone, personal.location].filter(Boolean).map((v) => `<div>${esc(v)}</div>`).join('')}
  </div>`

  const sidebarBody = sidebarSections.map((key) => {
    if (key === 'personal-contact') return sidebarContactHtml
    return renderSection(key, content, { ...t, colors: { ...t.colors, mainText: colors.sidebarText, headingText: colors.sidebarAccent, mutedText: colors.sidebarText, dividerColor: colors.sidebarAccent } })
  }).join('')

  const mainBody = content.sectionOrder
    .filter((k) => k !== 'personal' && mainSections.includes(k))
    .map((k) => renderSection(k, content, t))
    .join('')

  return `
    ${headerHtml}
    <div style="display:flex;min-height:100%;" class="two-column-body">
      <div class="sidebar" style="width:${sidebarW}%;background:${colors.sidebarBackground};color:${colors.sidebarText};padding:20px 16px;box-sizing:border-box;">
        ${sidebarHeader}
        ${sidebarBody}
      </div>
      <div style="width:${mainW}%;background:${colors.mainBackground};color:${colors.mainText};padding:20px 20px;box-sizing:border-box;">
        ${personal.summary ? `<div style="font-size:${typography.bodyFontSize};margin-bottom:12px;">${esc(personal.summary)}</div>` : ''}
        ${mainBody}
      </div>
    </div>`
}

function renderToHtml(content, templateId) {
  const t = loadTemplate(templateId)
  const { colors, typography, layout } = t

  const body = layout.type === 'two-column'
    ? renderTwoColumn(content, t)
    : renderSingleColumn(content, t)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${typography.bodyFont};
      font-size: ${typography.bodyFontSize};
      line-height: ${typography.bodyLineHeight};
      background: ${colors.mainBackground};
      color: ${colors.mainText};
      width: 8.5in;
      min-height: 11in;
    }
    .resume-wrap {
      margin: ${layout.pageMarginTop} ${layout.pageMarginSides};
    }
    ul { list-style: none; }
    a  { text-decoration: none; }
    .two-column-body { min-height: 11in; }
  </style>
</head>
<body>
  <div class="${layout.type === 'two-column' ? '' : 'resume-wrap'}">
    ${body}
  </div>
</body>
</html>`
}

module.exports = { renderToHtml }
