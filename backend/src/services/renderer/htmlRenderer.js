const fs   = require('fs')
const path = require('path')

function loadTemplate(templateId) {
  const file = path.join(__dirname, '../../templates', `${templateId}.json`)
  if (!fs.existsSync(file)) throw new Error(`Unknown template: ${templateId}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderBullets(bullets = []) {
  const items = bullets.filter(Boolean)
  if (!items.length) return ''
  return items.map(b => `<div style="margin-bottom:3px;">• ${esc(b)}</div>`).join('')
}

function renderDescriptionBullets(description = '') {
  const lines = description.split('\n').filter(Boolean)
  if (!lines.length) return ''
  return lines.map(l => `<div style="margin-bottom:3px;">• ${esc(l)}</div>`).join('')
}

function renderContact(personal) {
  return [personal.email, personal.phone, personal.location, personal.linkedin, personal.website]
    .filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')
}

function wrapHtml(fontLink, bodyFont, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${fontLink}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${bodyFont}; background: #fff; width: 8.5in; }
    ul { list-style: none; }
    a { text-decoration: none; }
  </style>
</head>
<body>${body}</body>
</html>`
}

const INTER_FONT   = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">`
const CLASSIC_FONT = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">`

/* ─── CLASSIC ─────────────────────────────────────────────────────── */
function renderClassic(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) =>
    `<div style="font-family:'Playfair Display',Georgia,serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${c.headingText};border-bottom:1.5px solid ${c.dividerColor};padding-bottom:4px;margin-bottom:10px;margin-top:18px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const sectionMap = {
    skills: allSkillItems.length > 0 ? `
      ${label('Core Competencies')}
      <div style="display:flex;flex-wrap:wrap;gap:5px;">
        ${allSkillItems.map(item => `<span style="display:inline-block;background:#f2f2f2;border:1px solid ${c.dividerColor};border-radius:3px;padding:4px 12px;font-size:13px;color:#333;">${esc(item)}</span>`).join('')}
      </div>` : '',

    experience: experience.length > 0 ? `
      ${label('Work History')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
            <div style="font-size:13px;color:${c.mutedText};font-style:italic;">${[esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' – ')}</div>
          </div>
          ${(e.role || e.location) ? `<div style="font-size:${ty.bodyFontSize};font-style:italic;color:${c.mainText};margin:2px 0 5px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:1.6;color:#333;">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${label('Education')}
      ${education.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(e.institution)}</div>
            ${e.endDate ? `<div style="font-size:13px;color:${c.mutedText};font-style:italic;">${esc(e.endDate)}</div>` : ''}
          </div>
          <div style="font-size:${ty.bodyFontSize};font-style:italic;color:${c.mainText};">${esc([e.degree, e.field].filter(Boolean).join(' '))}</div>
          ${e.gpa ? `<div style="font-size:13px;color:${c.mutedText};">GPA: ${esc(e.gpa)}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${label('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <span style="font-size:14px;font-weight:600;color:${c.headingText};">${esc(cert.name)}</span>
            ${cert.issuer ? `<span style="font-size:13px;font-style:italic;color:${c.mainText};"> · ${esc(cert.issuer)}</span>` : ''}
          </div>
          ${cert.date ? `<span style="font-size:13px;color:${c.mutedText};font-style:italic;">${esc(cert.date)}</span>` : ''}
        </div>`).join('')}` : '',

    languages: languages.length > 0 ? `
      ${label('Languages')}
      <div style="display:flex;flex-wrap:wrap;gap:5px;">
        ${languages.map(lang => `<span style="display:inline-block;background:#f2f2f2;border:1px solid ${c.dividerColor};border-radius:3px;padding:4px 12px;font-size:13px;color:#333;">${esc(lang.language)}${lang.proficiency ? ` — ${esc(lang.proficiency)}` : ''}</span>`).join('')}
      </div>` : '',

    awards: awards.length > 0 ? `
      ${label('Awards &amp; Recognition')}
      ${awards.map(aw => `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <span style="font-size:14px;font-weight:600;color:${c.headingText};">${esc(aw.title)}</span>
            ${aw.issuer ? `<span style="font-size:13px;font-style:italic;color:${c.mainText};"> · ${esc(aw.issuer)}</span>` : ''}
          </div>
          ${aw.date ? `<span style="font-size:13px;color:${c.mutedText};font-style:italic;">${esc(aw.date)}</span>` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${label('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(proj.title)}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:1.6;color:#333;margin-top:2px;">${esc(proj.description)}</div>` : ''}
          ${proj.url ? `<div style="font-size:13px;color:${c.mutedText};">${esc(proj.url)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${label(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.6;color:#333;">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${label('Professional Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:${c.mainText};text-align:justify;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => sectionMap[key] || '').join('')

  const header = `<div style="text-align:center;padding:36px 56px 18px;border-bottom:2px solid ${c.dividerColor};">
    <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};letter-spacing:3px;text-transform:uppercase;color:${c.headingText};">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-family:${ty.titleFont};font-style:italic;font-size:${ty.titleFontSize};color:${c.mutedText};margin-top:6px;">${esc(personal.title)}</div>` : ''}
    <div style="font-size:13px;color:${c.mutedText};margin-top:8px;">${renderContact(personal)}</div>
  </div>`

  const body = `${header}<div style="padding:22px 56px 40px;">${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml(CLASSIC_FONT, `'Lora', Georgia, serif`, body)
}

/* ─── MODERN ──────────────────────────────────────────────────────── */
function renderModern(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) =>
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${c.sidebarAccent};border-bottom:1px solid #2d5080;padding-bottom:4px;margin-bottom:10px;margin-top:18px;">${esc(text)}</div>`
  const mainLabel = (text) =>
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${c.headingText};border-bottom:2px solid ${c.sidebarAccent};padding-bottom:4px;margin-bottom:14px;margin-top:20px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const skillPills = allSkillItems.length > 0 ? `
    ${sidebarLabel('Skills')}
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">
      ${allSkillItems.map(item => `<span style="background:#1a4d7a;border:1px solid #2d6a9f;color:#cce4ff;font-size:12px;padding:4px 10px;border-radius:12px;">${esc(item)}</span>`).join('')}
    </div>` : ''

  const eduSidebar = education.length > 0 ? `
    ${sidebarLabel('Education')}
    ${education.map(e => `
      <div style="margin-bottom:10px;font-size:13px;line-height:1.7;">
        <div style="font-weight:600;color:#fff;">${esc(e.institution)}</div>
        <div style="color:#90b8e0;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</div>
        ${e.endDate ? `<div style="color:#7aa0c0;">${esc(e.endDate)}</div>` : ''}
      </div>`).join('')}` : ''

  const sidebarHtml = `
    <div style="width:${l.sidebarWidthPercent}%;background:${c.sidebarBackground};color:${c.sidebarText};padding:32px 20px;box-sizing:border-box;flex-shrink:0;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:72px;height:72px;background:${c.sidebarAccent};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;color:#fff;margin:0 auto 12px;">${esc((personal.name || '?')[0])}</div>
        <div style="font-size:${ty.nameFontSize};font-weight:700;color:#fff;">${esc(personal.name)}</div>
        ${personal.title ? `<div style="font-size:${ty.titleFontSize};color:#90b8e0;margin-top:4px;">${esc(personal.title)}</div>` : ''}
      </div>
      ${sidebarLabel('Contact')}
      <div style="font-size:13px;line-height:1.7;word-break:break-word;margin-bottom:4px;">
        ${[personal.email, personal.phone, personal.location].filter(Boolean).map(v => `<div>${esc(v)}</div>`).join('')}
      </div>
      ${skillPills}
      ${eduSidebar}
    </div>`

  const mainSectionMap = {
    experience: experience.length > 0 ? `
      ${mainLabel('Work History')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
            <div style="font-size:13px;color:#888;">${[esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' – ')}</div>
          </div>
          ${(e.role || e.location) ? `<div style="font-size:14px;font-weight:600;color:${c.sidebarAccent};margin:2px 0 5px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#333;">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${mainLabel('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <span style="font-size:14px;font-weight:600;color:${c.headingText};">${esc(cert.name)}</span>
            ${cert.issuer ? `<span style="font-size:13px;color:#555;font-style:italic;"> · ${esc(cert.issuer)}</span>` : ''}
          </div>
          ${cert.date ? `<span style="font-size:13px;color:#888;">${esc(cert.date)}</span>` : ''}
        </div>`).join('')}` : '',

    languages: languages.length > 0 ? `
      ${mainLabel('Languages')}
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${languages.map(lang => `<span style="background:#f1f5f9;border:1px solid #e2e8f0;color:#64748b;font-size:13px;padding:4px 12px;border-radius:12px;">${esc(lang.language)}${lang.proficiency ? ` — ${esc(lang.proficiency)}` : ''}</span>`).join('')}
      </div>` : '',

    awards: awards.length > 0 ? `
      ${mainLabel('Awards &amp; Recognition')}
      ${awards.map(aw => `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <span style="font-size:14px;font-weight:600;color:${c.headingText};">${esc(aw.title)}</span>
            ${aw.issuer ? `<span style="font-size:13px;color:#555;font-style:italic;"> · ${esc(aw.issuer)}</span>` : ''}
          </div>
          ${aw.date ? `<span style="font-size:13px;color:#888;">${esc(aw.date)}</span>` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${mainLabel('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(proj.title)}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#333;margin-top:2px;">${esc(proj.description)}</div>` : ''}
          ${proj.url ? `<div style="font-size:13px;color:#888;margin-top:2px;">${esc(proj.url)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${mainLabel(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#333;">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${mainLabel('Professional Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#333;margin-bottom:4px;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder
    .filter(k => k !== 'personal' && k !== 'education' && k !== 'skills')
    .map(key => mainSectionMap[key] || '').join('')

  const mainHtml = `<div style="flex:1;background:${c.mainBackground};color:${c.mainText};padding:32px 28px;box-sizing:border-box;">${summaryHtml}${sectionsHtml}</div>`
  const body = `<div style="display:flex;min-height:11in;">${sidebarHtml}${mainHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── MINIMAL ─────────────────────────────────────────────────────── */
function renderMinimal(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) =>
    `<div style="font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin-bottom:10px;margin-top:32px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const sectionMap = {
    skills: allSkillItems.length > 0 ? `
      ${label('Skills')}
      <div style="font-size:14px;color:#555;line-height:2;">${allSkillItems.map(esc).join(' · ')}</div>` : '',

    experience: experience.length > 0 ? `
      ${label('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
            <div style="font-size:16px;font-weight:600;color:${c.headingText};">${esc(e.company)}</div>
            <div style="font-size:13px;color:#999;">${[esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' – ')}</div>
          </div>
          ${(e.role || e.location) ? `<div style="font-size:14px;color:#666;margin-bottom:8px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${label('Education')}
      <div style="display:flex;gap:40px;flex-wrap:wrap;">
        ${education.map(e => `
          <div>
            <div style="font-size:15px;font-weight:600;color:${c.headingText};">${esc(e.institution)}</div>
            <div style="font-size:14px;color:#666;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</div>
            ${e.endDate ? `<div style="font-size:13px;color:#999;">${esc(e.endDate)}</div>` : ''}
          </div>`).join('')}
      </div>` : '',

    certifications: certifications.length > 0 ? `
      ${label('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <span style="font-size:15px;font-weight:600;color:${c.headingText};">${esc(cert.name)}</span>
            ${cert.issuer ? `<span style="font-size:14px;color:#666;"> · ${esc(cert.issuer)}</span>` : ''}
          </div>
          ${cert.date ? `<span style="font-size:13px;color:#999;">${esc(cert.date)}</span>` : ''}
        </div>`).join('')}` : '',

    languages: languages.length > 0 ? `
      ${label('Languages')}
      <div style="font-size:14px;color:#555;line-height:2;">
        ${languages.map(lang => esc(lang.language) + (lang.proficiency ? ` (${esc(lang.proficiency)})` : '')).join(' · ')}
      </div>` : '',

    awards: awards.length > 0 ? `
      ${label('Awards &amp; Recognition')}
      ${awards.map(aw => `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <span style="font-size:15px;font-weight:600;color:${c.headingText};">${esc(aw.title)}</span>
            ${aw.issuer ? `<span style="font-size:14px;color:#666;"> · ${esc(aw.issuer)}</span>` : ''}
          </div>
          ${aw.date ? `<span style="font-size:13px;color:#999;">${esc(aw.date)}</span>` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${label('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-size:16px;font-weight:600;color:${c.headingText};">${esc(proj.title)}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;margin-top:2px;">${esc(proj.description)}</div>` : ''}
          ${proj.url ? `<div style="font-size:13px;color:#999;margin-top:2px;">${esc(proj.url)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${label(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${label('Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;max-width:580px;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => sectionMap[key] || '').join('')

  const header = `<div style="margin-bottom:36px;">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};letter-spacing:-0.5px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:${ty.titleFontSize};font-weight:400;color:#666;margin-top:4px;">${esc(personal.title)}</div>` : ''}
    <div style="font-size:13px;color:#999;margin-top:8px;">${renderContact(personal)}</div>
  </div>`

  const body = `<div style="padding:52px 64px;">${header}${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── EXECUTIVE ───────────────────────────────────────────────────── */
function renderExecutive(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) =>
    `<div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${c.headingText};border-left:3px solid ${c.headingText};padding-left:10px;margin-bottom:12px;margin-top:24px;">${esc(text)}</div>`

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const skillsBar = allSkillItems.length > 0 ? `
    <div style="background:#f7f7fa;padding:16px 52px;border-bottom:1px solid #e2e8f0;">
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${allSkillItems.map(item => `<span style="background:${c.headingText};color:#e0e0f0;font-size:12px;font-weight:500;padding:5px 12px;border-radius:3px;">${esc(item)}</span>`).join('')}
      </div>
    </div>` : ''

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${label('Work History')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-size:16px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
            <div style="font-size:13px;color:#888;font-weight:500;">${[esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' – ')}</div>
          </div>
          ${(e.role || e.location) ? `<div style="font-size:13px;font-weight:600;color:#4a5568;margin:2px 0 6px;text-transform:uppercase;letter-spacing:0.5px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#444;">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${label('Education')}
      ${education.map(e => `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <div>
            <span style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(e.institution)}</span>
            <span style="font-size:14px;color:#555;margin-left:10px;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</span>
          </div>
          ${e.endDate ? `<div style="font-size:13px;color:#888;">${esc(e.endDate)}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${label('Certifications')}
      ${certifications.map(cert => `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <div>
            <span style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(cert.name)}</span>
            ${cert.issuer ? `<span style="font-size:14px;color:#555;margin-left:8px;">${esc(cert.issuer)}</span>` : ''}
          </div>
          ${cert.date ? `<div style="font-size:13px;color:#888;">${esc(cert.date)}</div>` : ''}
        </div>`).join('')}` : '',

    languages: languages.length > 0 ? `
      ${label('Languages')}
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${languages.map(lang => `<span style="background:#f1f5f9;border:1px solid #e2e8f0;color:#64748b;font-size:12px;font-weight:400;padding:5px 12px;border-radius:3px;">${esc(lang.language)}${lang.proficiency ? ` — ${esc(lang.proficiency)}` : ''}</span>`).join('')}
      </div>` : '',

    awards: awards.length > 0 ? `
      ${label('Awards &amp; Recognition')}
      ${awards.map(aw => `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <div>
            <span style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(aw.title)}</span>
            ${aw.issuer ? `<span style="font-size:14px;color:#555;margin-left:8px;">${esc(aw.issuer)}</span>` : ''}
          </div>
          ${aw.date ? `<div style="font-size:13px;color:#888;">${esc(aw.date)}</div>` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${label('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-size:16px;font-weight:700;color:${c.headingText};">${esc(proj.title)}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#444;margin-top:4px;">${esc(proj.description)}</div>` : ''}
          ${proj.url ? `<div style="font-size:13px;color:#888;margin-top:2px;">${esc(proj.url)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${label(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#333;">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${label('Professional Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#333;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => sectionMap[key] || '').join('')

  const header = `<div style="background:${c.headerBackground};color:${c.headerText};padding:40px 52px 32px;">
    <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};letter-spacing:${ty.nameLetterSpacing || '1px'};text-transform:uppercase;color:#fff;margin-bottom:6px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:${ty.titleFontSize};font-weight:400;color:${c.headerMuted};letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;">${esc(personal.title)}</div>` : ''}
    <div style="display:flex;gap:24px;font-size:13px;color:#cbd5e0;flex-wrap:wrap;">
      ${[personal.email, personal.phone, personal.location].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('')}
    </div>
  </div>`

  const body = `${header}${skillsBar}<div style="padding:28px 52px 40px;">${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── CREATIVE ────────────────────────────────────────────────────── */
function renderCreative(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const gradient = `linear-gradient(90deg,${c.accentStart},${c.accentEnd})`
  const borderColors = [c.accentStart, c.accentEnd]
  const pillColors = [
    { bg: '#ede9fe', color: '#5b21b6' },
    { bg: '#fce7f3', color: '#9d174d' },
  ]

  const label = (text) => `
    <div style="margin-bottom:14px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${c.accentStart};margin-bottom:4px;">${esc(text)}</div>
      <div style="height:2px;background:${gradient};border-radius:1px;"></div>
    </div>`

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const skillsHtml = allSkillItems.length > 0 ? `
    ${label('Skills')}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px;">
      ${allSkillItems.map((item, i) => {
        const p = pillColors[i % 2]
        return `<span style="background:${p.bg};color:${p.color};font-size:13px;font-weight:500;padding:5px 13px;border-radius:20px;">${esc(item)}</span>`
      }).join('')}
    </div>` : ''

  const sectionMap = {
    experience: experience.length > 0 ? `
      <div style="margin-bottom:24px;">
        ${label('Experience')}
        ${experience.map((e, idx) => {
          const bc = borderColors[idx % 2]
          return `<div style="margin-bottom:${l.itemSpacing};padding-left:14px;border-left:3px solid ${bc};">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(e.company)}</div>
              <div style="font-size:13px;color:#888;">${[esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' – ')}</div>
            </div>
            ${(e.role || e.location) ? `<div style="font-size:14px;font-weight:600;color:${bc};margin:2px 0 6px;">${esc(e.role)}${e.role && e.location ? ' · ' : ''}${esc(e.location)}</div>` : ''}
            <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#444;">${renderBullets(e.bullets)}</div>
          </div>`
        }).join('')}
      </div>` : '',

    education: education.length > 0 ? `
      <div style="margin-bottom:24px;">
        ${label('Education')}
        <div style="display:flex;gap:32px;flex-wrap:wrap;">
          ${education.map((e, idx) => {
            const bc = borderColors[idx % 2]
            return `<div style="padding-left:14px;border-left:3px solid ${bc};">
              <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(e.institution)}</div>
              <div style="font-size:14px;color:#555;">${esc([e.degree, e.field].filter(Boolean).join(': '))}</div>
              ${e.endDate ? `<div style="font-size:13px;color:#999;">${esc(e.endDate)}</div>` : ''}
            </div>`
          }).join('')}
        </div>
      </div>` : '',

    certifications: certifications.length > 0 ? `
      <div style="margin-bottom:24px;">
        ${label('Certifications')}
        ${certifications.map((cert, i) => `
          <div style="margin-bottom:8px;padding-left:14px;border-left:3px solid ${borderColors[i % 2]};">
            <div style="font-size:14px;font-weight:700;color:${c.headingText};">${esc(cert.name)}</div>
            ${cert.issuer ? `<div style="font-size:14px;color:#555;">${esc(cert.issuer)}</div>` : ''}
            ${cert.date ? `<div style="font-size:13px;color:#999;">${esc(cert.date)}</div>` : ''}
          </div>`).join('')}
      </div>` : '',

    languages: languages.length > 0 ? `
      <div style="margin-bottom:24px;">
        ${label('Languages')}
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${languages.map(lang => `<span style="background:#f1f5f9;border:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:400;padding:5px 13px;border-radius:20px;">${esc(lang.language)}${lang.proficiency ? ` — ${esc(lang.proficiency)}` : ''}</span>`).join('')}
        </div>
      </div>` : '',

    awards: awards.length > 0 ? `
      <div style="margin-bottom:24px;">
        ${label('Awards &amp; Recognition')}
        ${awards.map((aw, i) => `
          <div style="margin-bottom:8px;padding-left:14px;border-left:3px solid ${borderColors[i % 2]};">
            <div style="font-size:14px;font-weight:700;color:${c.headingText};">${esc(aw.title)}</div>
            ${aw.issuer ? `<div style="font-size:14px;color:#555;">${esc(aw.issuer)}</div>` : ''}
            ${aw.date ? `<div style="font-size:13px;color:#999;">${esc(aw.date)}</div>` : ''}
          </div>`).join('')}
      </div>` : '',

    projects: projects.length > 0 ? `
      <div style="margin-bottom:24px;">
        ${label('Projects')}
        ${projects.map((proj, i) => {
          const bc = borderColors[i % 2]
          return `<div style="margin-bottom:${l.itemSpacing};padding-left:14px;border-left:3px solid ${bc};">
            <div style="font-size:15px;font-weight:700;color:${c.headingText};">${esc(proj.title)}</div>
            ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#444;margin-top:2px;">${esc(proj.description)}</div>` : ''}
            ${proj.url ? `<div style="font-size:13px;color:#999;margin-top:2px;">${esc(proj.url)}</div>` : ''}
          </div>`
        }).join('')}
      </div>` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        <div style="margin-bottom:24px;">
          ${label(sec.title || 'Other')}
          <div style="font-size:${ty.bodyFontSize};line-height:1.65;color:#444;">${renderDescriptionBullets(sec.description)}</div>
        </div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    <div style="margin-bottom:24px;">
      ${label('About')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.7;color:#444;">${esc(personal.summary)}</div>
    </div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal' && k !== 'skills').map(key => sectionMap[key] || '').join('')

  const header = `<div style="background:linear-gradient(135deg,${c.accentStart},#7c3aed,${c.accentEnd});color:#fff;padding:40px 52px 32px;">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:#fff;letter-spacing:-0.5px;margin-bottom:4px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:${ty.titleFontSize};font-weight:400;color:#e0d9ff;letter-spacing:1px;margin-bottom:18px;">${esc(personal.title)}</div>` : ''}
    <div style="display:flex;gap:20px;font-size:13px;color:#d1c4ff;flex-wrap:wrap;">
      ${personal.email ? `<span>&#9993; ${esc(personal.email)}</span>` : ''}
      ${personal.phone ? `<span>${esc(personal.phone)}</span>` : ''}
      ${personal.location ? `<span>${esc(personal.location)}</span>` : ''}
    </div>
  </div>`

  const body = `${header}<div style="padding:28px 52px 40px;">${summaryHtml}${skillsHtml}${sectionsHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── MODERN SIDEBAR ─────────────────────────────────────────────── */
function renderModernSidebar(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) =>
    `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${c.sidebarMuted};margin-bottom:8px;margin-top:20px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.12);">${esc(text)}</div>`

  const mainLabel = (text) =>
    `<div style="margin-bottom:10px;margin-top:20px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${c.headingText};margin-bottom:6px;">${esc(text)}</div>
      <div style="height:1px;background:${c.dividerColor};"></div>
    </div>`

  const dateStr = (e) => [esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' — ')
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const sidebarHtml = `
    <div style="width:${l.sidebarWidthPercent}%;background:${c.sidebarBg};color:${c.sidebarText};padding:32px 22px;box-sizing:border-box;flex-shrink:0;">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:#fff;text-transform:uppercase;letter-spacing:0.5px;line-height:1.2;margin-bottom:4px;">${esc(personal.name)}</div>
      ${personal.title ? `<div style="font-size:12px;color:${c.sidebarMuted};margin-bottom:20px;">${esc(personal.title)}</div>` : ''}
      ${(personal.email || personal.phone || personal.location) ? `
        ${sidebarLabel('Details')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
          ${personal.email ? `<div>${esc(personal.email)}</div>` : ''}
          ${personal.phone ? `<div>${esc(personal.phone)}</div>` : ''}
          ${personal.location ? `<div>${esc(personal.location)}</div>` : ''}
        </div>` : ''}
      ${allSkillItems.length > 0 ? `
        ${sidebarLabel('Skills')}
        <ul style="list-style:none;padding:0;margin:0;font-size:${ty.bodyFontSize};line-height:1.8;">
          ${allSkillItems.map(item => `<li style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:${c.sidebarMuted};">·</span>${esc(item)}</li>`).join('')}
        </ul>` : ''}
      ${(personal.linkedin || personal.website) ? `
        ${sidebarLabel('Social Links')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
          ${personal.linkedin ? `<div><span style="color:${c.sidebarMuted};">LinkedIn: </span>${esc(personal.linkedin)}</div>` : ''}
          ${personal.website ? `<div><span style="color:${c.sidebarMuted};">Website: </span>${esc(personal.website)}</div>` : ''}
        </div>` : ''}
      ${languages.length > 0 ? `
        ${sidebarLabel('Languages')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
          ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` — ${esc(lang.proficiency)}` : ''}</div>`).join('')}
        </div>` : ''}
    </div>`

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${mainLabel('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-size:11px;color:${c.mutedText};margin-bottom:2px;">${dateStr(e)}</div>
          <div style="font-weight:700;font-size:${ty.bodyFontSize};margin-bottom:1px;">${esc(e.role)}</div>
          ${e.company ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:5px;">${esc(e.company)}${e.location ? ' · ' + esc(e.location) : ''}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${mainLabel('Education')}
      ${education.map(e => `
        <div style="margin-bottom:12px;">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.institution)}</div>
          ${(e.degree || e.field) ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">${esc([e.degree, e.field].filter(Boolean).join(', '))}</div>` : ''}
          <div style="font-size:12px;color:${c.mutedText};">${[esc(e.startDate), esc(e.endDate)].filter(Boolean).join(' — ')}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${mainLabel('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` · ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:3px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${mainLabel('Certifications')}
      ${certifications.map(cert => `<div style="margin-bottom:8px;font-size:${ty.bodyFontSize};"><span style="font-weight:700;">${esc(cert.name)}</span>${cert.issuer ? ` · ${esc(cert.issuer)}` : ''}${cert.date ? ` · ${esc(cert.date)}` : ''}</div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${mainLabel('Achievements')}
      ${awards.map(aw => `<div style="margin-bottom:8px;font-size:${ty.bodyFontSize};">${aw.title ? `<span style="font-weight:700;">${esc(aw.title)}</span>` : ''}${aw.issuer ? ` · ${esc(aw.issuer)}` : ''}${aw.date ? ` · ${esc(aw.date)}` : ''}</div>`).join('')}` : '',

    custom: custom.length > 0 ? custom.map(sec => `
      ${mainLabel(sec.title || 'Other')}
      <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `${mainLabel('Summary')}<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>` : ''
  const sectionsHtml = sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k)).map(key => sectionMap[key] || '').join('')
  const mainHtml = `<div style="flex:1;background:${c.mainBg};color:${c.mainText};padding:32px 28px;box-sizing:border-box;">${summaryHtml}${sectionsHtml}</div>`

  const body = `<div style="display:flex;min-height:11in;font-family:${ty.bodyFont};font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${sidebarHtml}${mainHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── MODERN BANNER ──────────────────────────────────────────────── */
function renderModernBanner(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const leftLabel = (text) =>
    `<div style="margin-bottom:8px;margin-top:18px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${c.headingText};margin-bottom:5px;">${esc(text)}</div>
      <div style="height:1px;background:${c.dividerColor};"></div>
    </div>`

  const rightLabel = (text) =>
    `<div style="margin-bottom:10px;margin-top:20px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${c.headingText};margin-bottom:6px;">${esc(text)}</div>
      <div style="height:1px;background:${c.dividerColor};"></div>
    </div>`

  const dateStr = (e) => [esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  const header = `<div style="background:${c.bannerBg};color:${c.bannerText};padding:28px 32px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:#fff;letter-spacing:-0.3px;">${esc(personal.name)}</div>
      ${personal.title ? `<div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">${esc(personal.title)}</div>` : ''}
    </div>
    <div style="font-size:13px;color:rgba(255,255,255,0.9);line-height:1.9;text-align:right;">
      ${personal.email ? `<div>${esc(personal.email)}</div>` : ''}
      ${personal.phone ? `<div>${esc(personal.phone)}</div>` : ''}
      ${personal.location ? `<div>${esc(personal.location)}</div>` : ''}
    </div>
  </div>`

  const leftSectionMap = {
    education: education.length > 0 ? `
      ${leftLabel('Education')}
      ${education.map(e => `
        <div style="margin-bottom:12px;font-size:${ty.bodyFontSize};">
          <div style="font-weight:700;">${esc(e.institution)}</div>
          ${e.location ? `<div style="color:${c.mutedText};font-size:12px;font-style:italic;">${esc(e.location)}${(e.startDate || e.endDate) ? ' · ' + [esc(e.startDate), esc(e.endDate)].filter(Boolean).join(' - ') : ''}</div>` : ''}
          ${(e.degree || e.field) ? `<div style="font-weight:700;margin-top:2px;">${esc([e.degree, e.field].filter(Boolean).join(' '))}</div>` : ''}
          ${e.gpa ? `<div style="color:${c.mutedText};font-size:12px;">GPA: ${esc(e.gpa)}</div>` : ''}
        </div>`).join('')}` : '',

    skills: hasSkills ? `
      ${leftLabel('Skills')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
        ${skills.filter(sk => (sk.items ?? []).length > 0).flatMap(sk => sk.items ?? []).map(item => `<div>${esc(item)}</div>`).join('')}
      </div>` : '',

    languages: languages.length > 0 ? `
      ${leftLabel('Languages')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
        ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` (${esc(lang.proficiency)})` : ''}</div>`).join('')}
      </div>` : '',
  }

  const socialHtml = (personal.linkedin || personal.website) ? `
    ${leftLabel('Websites &amp; Social Links')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
      ${personal.linkedin ? `<div><strong>LinkedIn:</strong> ${esc(personal.linkedin)}</div>` : ''}
      ${personal.website ? `<div><strong>Website:</strong> ${esc(personal.website)}</div>` : ''}
    </div>` : ''

  const leftColSections = sectionOrder.filter(k => ['education', 'skills', 'languages'].includes(k)).map(k => leftSectionMap[k] || '').join('')

  const leftCol = `<div style="width:${l.sidebarWidthPercent}%;background:${c.sidebarBg};padding:20px 22px;box-sizing:border-box;flex-shrink:0;border-right:1px solid ${c.dividerColor};">${leftColSections}${socialHtml}</div>`

  const rightSectionMap = {
    experience: experience.length > 0 ? `
      ${rightLabel('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? ` - ${esc(e.company)}` : ''}</div>
          <div style="font-size:12px;color:${c.accentColor};font-style:italic;margin-bottom:4px;">${dateStr(e)}${e.location ? ` · ${esc(e.location)}` : ''}</div>
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${rightLabel('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` · ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:3px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${rightLabel('Certifications')}
      ${certifications.map(cert => `<div style="margin-bottom:8px;font-size:${ty.bodyFontSize};"><span style="font-weight:700;">${esc(cert.name)}</span>${cert.issuer ? ` · ${esc(cert.issuer)}` : ''}${cert.date ? ` · ${esc(cert.date)}` : ''}</div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${rightLabel('Achievements')}
      ${awards.map(aw => `<div style="margin-bottom:8px;font-size:${ty.bodyFontSize};">${aw.title ? `<span style="font-weight:700;">${esc(aw.title)}</span>` : ''}${aw.issuer ? ` · ${esc(aw.issuer)}` : ''}${aw.date ? ` · ${esc(aw.date)}` : ''}</div>`).join('')}` : '',

    custom: custom.length > 0 ? custom.map(sec => `
      ${rightLabel(sec.title || 'Other')}
      <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `${rightLabel('Summary')}<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>` : ''
  const rightSections = sectionOrder.filter(k => !['personal', 'education', 'skills', 'languages'].includes(k)).map(k => rightSectionMap[k] || '').join('')
  const rightCol = `<div style="flex:1;background:${c.mainBg};padding:20px 26px;box-sizing:border-box;">${summaryHtml}${rightSections}</div>`

  const body = `<div style="font-family:${ty.bodyFont};font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};min-height:11in;">
    ${header}
    <div style="display:flex;">${leftCol}${rightCol}</div>
  </div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── MODERN SPLIT ───────────────────────────────────────────────── */
function renderModernSplit(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sidebarLabel = (text) =>
    `<div style="margin-bottom:8px;margin-top:20px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${c.headingText};margin-bottom:5px;">${esc(text)}</div>
      <div style="height:1px;background:${c.dividerColor};"></div>
    </div>`

  const mainLabel = (text) =>
    `<div style="margin-bottom:10px;margin-top:20px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${c.headingText};margin-bottom:6px;">${esc(text)}</div>
      <div style="height:1px;background:${c.dividerColor};"></div>
    </div>`

  const dateStr = (e) => [esc(e.startDate), e.current ? 'Present' : esc(e.endDate)].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const sidebarHtml = `
    <div style="width:${l.sidebarWidthPercent}%;background:${c.sidebarBg};padding:28px 20px;box-sizing:border-box;flex-shrink:0;">
      ${hasSkills ? `
        ${sidebarLabel('Skills')}
        <ul style="list-style:none;padding:0;margin:0;font-size:${ty.bodyFontSize};line-height:1.9;">
          ${allSkillItems.map(item => `<li style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;">•</span>${esc(item)}</li>`).join('')}
        </ul>` : ''}
      ${languages.length > 0 ? `
        ${sidebarLabel('Languages')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
          ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` (${esc(lang.proficiency)})` : ''}</div>`).join('')}
        </div>` : ''}
      ${(personal.linkedin || personal.website) ? `
        ${sidebarLabel('Websites &amp; Social Links')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
          ${personal.linkedin ? `<div><strong>LinkedIn:</strong> ${esc(personal.linkedin)}</div>` : ''}
          ${personal.website ? `<div><strong>Website:</strong> ${esc(personal.website)}</div>` : ''}
        </div>` : ''}
    </div>`

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${mainLabel('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? `, ${esc(e.company)}` : ''}</div>
          <div style="font-size:12px;color:${c.accentColor};font-style:italic;margin-bottom:5px;">${dateStr(e)}${e.location ? ` · ${esc(e.location)}` : ''}</div>
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${mainLabel('Education')}
      ${education.map(e => `
        <div style="margin-bottom:12px;font-size:${ty.bodyFontSize};">
          <div style="font-weight:700;">${esc([e.degree, e.field, e.institution, e.location].filter(Boolean).join(', '))}</div>
          <div style="color:${c.mutedText};font-size:12px;">${[esc(e.startDate), esc(e.endDate)].filter(Boolean).join(' — ')}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${mainLabel('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` · ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:3px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${mainLabel('Certifications')}
      ${certifications.map(cert => `<div style="margin-bottom:8px;font-size:${ty.bodyFontSize};"><span style="font-weight:700;">${esc(cert.name)}</span>${cert.issuer ? ` · ${esc(cert.issuer)}` : ''}${cert.date ? ` · ${esc(cert.date)}` : ''}</div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${mainLabel('Achievements')}
      ${awards.map(aw => `<div style="margin-bottom:8px;font-size:${ty.bodyFontSize};">${aw.title ? `<span style="font-weight:700;">${esc(aw.title)}</span>` : ''}${aw.issuer ? ` · ${esc(aw.issuer)}` : ''}${aw.date ? ` · ${esc(aw.date)}` : ''}</div>`).join('')}` : '',

    custom: custom.length > 0 ? custom.map(sec => `
      ${mainLabel(sec.title || 'Other')}
      <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const headerHtml = `
    <div style="margin-bottom:16px;">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};text-transform:uppercase;letter-spacing:-0.5px;line-height:1.1;margin-bottom:10px;">${esc(personal.name)}</div>
      ${personal.title ? `<div style="font-size:14px;color:${c.mutedText};margin-bottom:8px;">${esc(personal.title)}</div>` : ''}
      <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px;margin-bottom:12px;">
        ${personal.email ? `<span>&#9993; ${esc(personal.email)}</span>` : ''}
        ${personal.location ? `<span>&#8857; ${esc(personal.location)}</span>` : ''}
        ${personal.phone ? `<span>&#9990; ${esc(personal.phone)}</span>` : ''}
      </div>
      <div style="height:1px;background:${c.dividerColor};"></div>
    </div>`

  const summaryHtml = personal.summary ? `${mainLabel('Summary')}<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>` : ''
  const sectionsHtml = sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k)).map(k => sectionMap[k] || '').join('')
  const mainHtml = `<div style="flex:1;background:${c.mainBg};padding:28px 28px;box-sizing:border-box;">${headerHtml}${summaryHtml}${sectionsHtml}</div>`

  const body = `<div style="display:flex;min-height:11in;font-family:${ty.bodyFont};font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${sidebarHtml}${mainHtml}</div>`
  return wrapHtml(INTER_FONT, 'Inter, sans-serif', body)
}

/* ─── CLASSIC ACADEMIC ────────────────────────────────────────────── */
const GEORGIA_FONT = `<link href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">`

function renderClassicAcademic(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const band = (text) =>
    `<div style="background:${c.sectionBandBg};border-top:1px solid ${c.sectionBandBorder};border-bottom:1px solid ${c.sectionBandBorder};text-align:center;padding:4px 0;margin:14px 0 10px;">
      <span style="font-family:${ty.sectionLabelFont};font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-decoration:underline;color:${c.headingText};">${esc(text)}</span>
    </div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${band('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};padding-left:24px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-weight:700;font-size:${ty.bodyFontSize};">&#10022; ${esc(e.role)}</div>
            <div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">${dateStr(e)}</div>
          </div>
          ${e.company ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:4px;">${esc(e.company)}${e.location ? ' &middot; ' + esc(e.location) : ''}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${band('Education')}
      ${education.map(e => `
        <div style="margin-bottom:10px;padding-left:24px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-weight:700;font-size:${ty.bodyFontSize};">&#10022; ${esc(e.institution)}</div>
            <div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">${[e.startDate, e.endDate].filter(Boolean).join(' — ')}</div>
          </div>
          <div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">${esc([e.degree, e.field].filter(Boolean).join(', '))}${e.gpa ? ' &middot; GPA: ' + esc(e.gpa) : ''}</div>
        </div>`).join('')}` : '',

    skills: allSkillItems.length > 0 ? `
      ${band('Skills')}
      <div style="padding-left:24px;display:flex;flex-wrap:wrap;gap:0 32px;">
        ${skills.filter(sk => (sk.items ?? []).length > 0).map(sk => `
          <div style="font-size:${ty.bodyFontSize};margin-bottom:4px;min-width:200px;">
            ${sk.category ? `<span style="font-weight:700;">${esc(sk.category)}:</span> ` : ''}${(sk.items ?? []).map(esc).join(', ')}
          </div>`).join('')}
      </div>` : '',

    certifications: certifications.length > 0 ? `
      ${band('Certifications')}
      <div style="padding-left:24px;">
        ${certifications.map(cert => `
          <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
            <span style="font-weight:700;">${esc(cert.name)}</span>
            ${cert.issuer ? `<span style="color:${c.mutedText};"> | ${esc(cert.issuer)}</span>` : ''}
            ${cert.date ? `<span style="color:${c.mutedText};"> | ${esc(cert.date)}</span>` : ''}
          </div>`).join('')}
      </div>` : '',

    languages: languages.length > 0 ? `
      ${band('Languages')}
      <div style="padding-left:24px;font-size:${ty.bodyFontSize};">
        ${languages.map(lang => esc(lang.language) + (lang.proficiency ? ` (${esc(lang.proficiency)})` : '')).join(' &middot; ')}
      </div>` : '',

    awards: awards.length > 0 ? `
      ${band('Achievements')}
      <div style="padding-left:24px;">
        ${awards.map(aw => `
          <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
            ${aw.title ? `<span style="font-weight:700;">${esc(aw.title)}</span>` : ''}
            ${aw.issuer ? `<span style="color:${c.mutedText};"> &middot; ${esc(aw.issuer)}</span>` : ''}
            ${aw.date ? `<span style="color:${c.mutedText};"> &middot; ${esc(aw.date)}</span>` : ''}
          </div>`).join('')}
      </div>` : '',

    projects: projects.length > 0 ? `
      ${band('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};padding-left:24px;">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};text-transform:uppercase;letter-spacing:0.4px;">&#10022; ${esc(proj.title)}${proj.url ? ` <span style="font-weight:400;text-transform:none;"> | ${esc(proj.url)}</span>` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:3px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ? custom.map(sec => `
      ${band(sec.title || 'Other')}
      <div style="padding-left:24px;font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${band('Summary')}
    <div style="padding-left:24px;font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => sectionMap[key] || '').join('')

  const header = `<div style="text-align:center;padding:32px ${l.sidePadding} 0;font-family:${ty.nameFont};">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};letter-spacing:2px;">${esc(personal.name)}</div>
    ${personal.location ? `<div style="font-size:13px;color:${c.mutedText};margin-top:4px;">${esc(personal.location)}</div>` : ''}
    ${personal.title ? `<div style="font-size:14px;font-style:italic;color:${c.mutedText};margin-top:2px;">${esc(personal.title)}</div>` : ''}
    <div style="font-size:13px;color:${c.mainText};margin-top:6px;">${renderContact(personal)}</div>
    <div style="border-top:1px solid ${c.dividerColor};margin-top:10px;"></div>
  </div>`

  const body = `${header}<div style="padding:0 ${l.sidePadding} 40px;">${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml('', `${ty.bodyFont}`, body)
}

/* ─── CLASSIC FORMAL ──────────────────────────────────────────────── */
function renderClassicFormal(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const label = (text) =>
    `<div style="font-family:${ty.sectionLabelFont};font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${c.headingText};margin-bottom:8px;margin-top:${l.sectionSpacing};">${esc(text)}</div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')

  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${label('Experience')}
      ${experience.map(e => `
        <div style="padding-left:${l.contentIndent};margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};margin-bottom:2px;">
            <span style="text-transform:uppercase;letter-spacing:0.4px;">${esc(e.role)}</span>
            ${e.role && dateStr(e) ? `<span style="font-weight:400;text-transform:none;"> | ${dateStr(e)}</span>` : ''}
          </div>
          ${e.company ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:4px;">${esc(e.company)}${e.location ? ' &middot; ' + esc(e.location) : ''}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${label('Education')}
      ${education.map(e => `
        <div style="padding-left:${l.contentIndent};margin-bottom:10px;">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">
            ${esc(e.institution)}
            ${e.location ? `<span style="font-weight:400;"> - ${esc(e.location)}</span>` : ''}
            ${e.degree ? ` | ${esc(e.degree)}` : ''}
          </div>
          <div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">
            ${e.field ? esc(e.field) : ''}${(e.field && (e.startDate || e.endDate)) ? ' | ' : ''}${[e.startDate, e.endDate].filter(Boolean).join(' - ')}${e.gpa ? ' &middot; GPA: ' + esc(e.gpa) : ''}
          </div>
        </div>`).join('')}` : '',

    skills: allSkillItems.length > 0 ? `
      ${label('Skills')}
      <div style="padding-left:${l.contentIndent};">
        ${skills.filter(sk => (sk.items ?? []).length > 0).map(sk => `
          <div style="margin-bottom:4px;font-size:${ty.bodyFontSize};">
            ${sk.category ? `<span style="font-weight:700;">${esc(sk.category)}: </span>` : ''}<span>${(sk.items ?? []).map(esc).join(', ')}</span>
          </div>`).join('')}
      </div>` : '',

    certifications: certifications.length > 0 ? `
      ${label('Certifications')}
      <div style="padding-left:${l.contentIndent};">
        ${certifications.map(cert => `
          <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
            <span style="font-weight:700;">${esc(cert.name)}</span>
            ${cert.issuer ? `<span style="color:${c.mutedText};"> | ${esc(cert.issuer)}</span>` : ''}
            ${cert.date ? `<span style="color:${c.mutedText};"> | ${esc(cert.date)}</span>` : ''}
          </div>`).join('')}
      </div>` : '',

    languages: languages.length > 0 ? `
      ${label('Languages')}
      <div style="padding-left:${l.contentIndent};font-size:${ty.bodyFontSize};">
        ${languages.map(lang => esc(lang.language) + (lang.proficiency ? ` (${esc(lang.proficiency)})` : '')).join(' &middot; ')}
      </div>` : '',

    awards: awards.length > 0 ? `
      ${label('Achievements')}
      <div style="padding-left:${l.contentIndent};">
        ${awards.map(aw => `
          <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
            ${aw.title ? `<span style="font-weight:700;">${esc(aw.title)}</span>` : ''}
            ${aw.issuer ? `<span style="color:${c.mutedText};"> &middot; ${esc(aw.issuer)}</span>` : ''}
            ${aw.date ? `<span style="color:${c.mutedText};"> &middot; ${esc(aw.date)}</span>` : ''}
          </div>`).join('')}
      </div>` : '',

    projects: projects.length > 0 ? `
      ${label('Projects')}
      ${projects.map(proj => `
        <div style="padding-left:${l.contentIndent};margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;text-transform:uppercase;letter-spacing:0.4px;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` <span style="font-weight:400;text-transform:none;"> | ${esc(proj.url)}</span>` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:3px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ? custom.map(sec => `
      ${label(sec.title || 'Other')}
      <div style="padding-left:${l.contentIndent};font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderDescriptionBullets(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${label('Summary')}
    <div style="padding-left:${l.contentIndent};font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-bottom:4px;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => sectionMap[key] || '').join('')

  const header = `<div style="text-align:center;padding:32px 56px 0;font-family:${ty.nameFont};">
    <div style="font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};letter-spacing:0.5px;">${esc(personal.name)}</div>
    ${personal.location ? `<div style="font-size:13px;color:${c.mutedText};margin-top:4px;">${esc(personal.location)}</div>` : ''}
    ${personal.title ? `<div style="font-size:14px;font-style:italic;color:${c.mutedText};margin-top:2px;">${esc(personal.title)}</div>` : ''}
    <div style="display:flex;justify-content:center;gap:32px;font-size:13px;color:${c.mainText};margin-bottom:14px;margin-top:6px;">
      ${[personal.email, personal.phone, personal.linkedin, personal.website].filter(Boolean).map(esc).join(' &nbsp; ')}
    </div>
    <div style="border-top:1px dotted ${c.dividerColor};margin-bottom:4px;"></div>
  </div>`

  const body = `${header}<div style="padding:0 56px 40px;">${summaryHtml}${sectionsHtml}</div>`
  return wrapHtml('', `${ty.bodyFont}`, body)
}

/* ─── MINIMAL COLUMNS ────────────────────────────────────────────── */
function renderMinimalColumns(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const bar = `<div style="width:32px;height:3px;background:${c.headingText};margin:4px 0 10px;"></div>`

  const sectionHeader = (text) =>
    `<div style="margin-bottom:10px;margin-top:20px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${c.headingText};">${esc(text)}</div>
      ${bar}
    </div>`

  const contactLabel = (text) =>
    `<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:${c.headingText};margin-top:10px;margin-bottom:2px;">${esc(text)}</div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' - ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  const leftHtml = `
    <div style="width:${l.sidebarWidthPercent}%;padding:28px 24px 40px 32px;box-sizing:border-box;flex-shrink:0;border-right:1px solid ${c.dividerColor};font-family:${ty.bodyFont};">
      ${sectionHeader('Details')}
      ${personal.location ? `${contactLabel('Address')}<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.location)}</div>` : ''}
      ${personal.phone ? `${contactLabel('Phone')}<div style="font-size:${ty.bodyFontSize};">${esc(personal.phone)}</div>` : ''}
      ${personal.email ? `${contactLabel('Email')}<div style="font-size:${ty.bodyFontSize};word-break:break-all;">${esc(personal.email)}</div>` : ''}
      ${(personal.linkedin || personal.website) ? `
        ${sectionHeader('Websites &amp; Social Links')}
        ${personal.linkedin ? `<div style="font-size:${ty.bodyFontSize};margin-bottom:4px;"><strong>LinkedIn:</strong> ${esc(personal.linkedin)}</div>` : ''}
        ${personal.website ? `<div style="font-size:${ty.bodyFontSize};margin-bottom:4px;"><strong>Website:</strong> ${esc(personal.website)}</div>` : ''}` : ''}
      ${hasSkills ? `
        ${sectionHeader('Skills')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
          ${skills.filter(sk => (sk.items ?? []).length > 0).map(sk =>
            `<div style="margin-bottom:4px;">${(sk.items ?? []).map(esc).join(', ')}</div>`
          ).join('')}
        </div>` : ''}
      ${languages.length > 0 ? `
        ${sectionHeader('Languages')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
          ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` (${esc(lang.proficiency)})` : ''}</div>`).join('')}
        </div>` : ''}
    </div>`

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${sectionHeader('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? `, ${esc(e.company)}` : ''}</div>
          ${dateStr(e) ? `<div style="font-weight:700;font-size:${ty.bodyFontSize};margin-bottom:4px;">${dateStr(e)}</div>` : ''}
          ${e.location ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:3px;">${esc(e.location)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${sectionHeader('Education')}
      ${education.map(e => `
        <div style="margin-bottom:12px;font-size:${ty.bodyFontSize};">
          <div style="font-weight:700;">
            ${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}${e.degree ? `, ${esc(e.degree)}` : ''}${e.field ? `, ${esc(e.field)}` : ''}
          </div>
          <div style="color:${c.mutedText};">${[e.startDate, e.endDate].filter(Boolean).join(' - ')}${e.gpa ? ` &middot; GPA: ${esc(e.gpa)}` : ''}</div>
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${sectionHeader('Certifications and Licenses')}
      ${certifications.map(cert => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
          ${esc(cert.name)}${cert.issuer ? ` &middot; ${esc(cert.issuer)}` : ''}${cert.date ? ` &middot; ${esc(cert.date)}` : ''}
        </div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${sectionHeader('Achievements')}
      ${awards.map(aw => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
          ${aw.title ? `<strong>${esc(aw.title)}</strong>` : ''}${aw.issuer ? ` &middot; ${esc(aw.issuer)}` : ''}${aw.date ? ` &middot; ${esc(aw.date)}` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${sectionHeader('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` &middot; ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:3px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${sectionHeader(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${sectionHeader('Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-bottom:4px;">${esc(personal.summary)}</div>` : ''

  const rightSections = sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k))
  const rightHtml = `<div style="flex:1;padding:28px 32px 40px 28px;box-sizing:border-box;font-family:${ty.bodyFont};">${summaryHtml}${rightSections.map(k => sectionMap[k] || '').join('')}</div>`

  const nameHeader = `
    <div style="padding:36px 32px 20px;">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};line-height:1.05;letter-spacing:-0.5px;">${esc(personal.name)}</div>
      ${personal.title ? `<div style="font-size:14px;color:${c.mutedText};margin-top:6px;">${esc(personal.title)}</div>` : ''}
    </div>
    <div style="height:1px;background:${c.dividerColor};margin:0 32px;"></div>`

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;">
    ${nameHeader}
    <div style="display:flex;align-items:flex-start;">${leftHtml}${rightHtml}</div>
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── MINIMAL BOXED ──────────────────────────────────────────────── */
function renderMinimalBoxed(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const rule = `<div style="height:1px;background:${c.dividerColor};margin:6px 0 10px;"></div>`

  const sectionHeader = (text) =>
    `<div style="margin-bottom:2px;margin-top:18px;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:${c.headingText};">${esc(text)}</div>
      ${rule}
    </div>`

  const contactLabel = (text) =>
    `<div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:${c.mutedText};margin-top:8px;margin-bottom:1px;">${esc(text)}</div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  const leftHtml = `
    <div style="width:${l.sidebarWidthPercent}%;padding:24px 20px 40px 28px;box-sizing:border-box;flex-shrink:0;border-right:1px solid ${c.dividerColor};font-family:${ty.bodyFont};">
      ${sectionHeader('Contact')}
      ${personal.email ? `${contactLabel('Email')}<div style="font-size:${ty.bodyFontSize};word-break:break-all;">${esc(personal.email)}</div>` : ''}
      ${personal.phone ? `${contactLabel('Phone')}<div style="font-size:${ty.bodyFontSize};">${esc(personal.phone)}</div>` : ''}
      ${personal.location ? `${contactLabel('Location')}<div style="font-size:${ty.bodyFontSize};">${esc(personal.location)}</div>` : ''}
      ${personal.linkedin ? `${contactLabel('LinkedIn')}<div style="font-size:${ty.bodyFontSize};word-break:break-all;">${esc(personal.linkedin)}</div>` : ''}
      ${personal.website ? `${contactLabel('Website')}<div style="font-size:${ty.bodyFontSize};word-break:break-all;">${esc(personal.website)}</div>` : ''}
      ${hasSkills ? `
        ${sectionHeader('Skills')}
        ${skills.filter(sk => (sk.items ?? []).length > 0).map(sk =>
          `<div style="margin-bottom:4px;">${sk.label ? `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:${c.mutedText};margin-bottom:2px;">${esc(sk.label)}</div>` : ''}<div style="font-size:${ty.bodyFontSize};line-height:1.7;">${(sk.items ?? []).map(esc).join(', ')}</div></div>`
        ).join('')}` : ''}
      ${languages.length > 0 ? `
        ${sectionHeader('Languages')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
          ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` – ${esc(lang.proficiency)}` : ''}</div>`).join('')}
        </div>` : ''}
      ${awards.length > 0 ? `
        ${sectionHeader('Awards')}
        ${awards.map(aw => `
          <div style="margin-bottom:8px;font-size:${ty.bodyFontSize};">
            ${aw.title ? `<div style="font-weight:700;">${esc(aw.title)}</div>` : ''}
            ${aw.issuer ? `<div style="color:${c.mutedText};">${esc(aw.issuer)}</div>` : ''}
            ${aw.date ? `<div style="color:${c.mutedText};">${esc(aw.date)}</div>` : ''}
          </div>`).join('')}` : ''}
    </div>`

  const rightSectionMap = {
    experience: experience.length > 0 ? `
      ${sectionHeader('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? `, <span style="font-weight:400;">${esc(e.company)}</span>` : ''}</div>
            ${dateStr(e) ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};white-space:nowrap;margin-left:8px;">${dateStr(e)}</div>` : ''}
          </div>
          ${e.location ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:3px;">${esc(e.location)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${sectionHeader('Education')}
      ${education.map(e => `
        <div style="margin-bottom:10px;font-size:${ty.bodyFontSize};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-weight:700;">${esc(e.institution)}${e.degree ? `, ${esc(e.degree)}` : ''}${e.field ? `, ${esc(e.field)}` : ''}</div>
            ${(e.startDate || e.endDate) ? `<div style="color:${c.mutedText};white-space:nowrap;margin-left:8px;">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</div>` : ''}
          </div>
          ${e.location ? `<div style="color:${c.mutedText};">${esc(e.location)}</div>` : ''}
          ${e.gpa ? `<div style="color:${c.mutedText};">GPA: ${esc(e.gpa)}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${sectionHeader('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};display:flex;justify-content:space-between;align-items:baseline;">
          <div><strong>${esc(cert.name)}</strong>${cert.issuer ? ` &middot; ${esc(cert.issuer)}` : ''}</div>
          ${cert.date ? `<span style="color:${c.mutedText};white-space:nowrap;margin-left:8px;">${esc(cert.date)}</span>` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${sectionHeader('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` &middot; ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:2px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${sectionHeader(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${sectionHeader('Profile')}
    <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>` : ''

  const rightSections = sectionOrder.filter(k => !['personal', 'skills', 'languages', 'awards'].includes(k))
  const rightHtml = `<div style="flex:1;padding:24px 28px 40px 20px;box-sizing:border-box;font-family:${ty.bodyFont};">${summaryHtml}${rightSections.map(k => rightSectionMap[k] || '').join('')}</div>`

  const nameHeader = `
    <div style="padding:20px 28px;border-bottom:2px solid ${c.mainText};">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};letter-spacing:-0.3px;">${esc(personal.name)}</div>
      ${personal.title ? `<div style="font-size:13px;color:${c.mutedText};margin-top:3px;">${esc(personal.title)}</div>` : ''}
    </div>`

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;">
    ${nameHeader}
    <div style="display:flex;align-items:flex-start;">${leftHtml}${rightHtml}</div>
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── MINIMAL SERIF ──────────────────────────────────────────────── */
function renderMinimalSerif(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const bar = `<div style="width:36px;height:1px;background:${c.headingText};margin:6px auto 12px;"></div>`

  const sectionHeader = (text) =>
    `<div style="margin-bottom:12px;margin-top:28px;text-align:center;">
      <div style="font-size:${ty.sectionLabelSize};font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${c.headingText};">${esc(text)}</div>
      ${bar}
    </div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  const contactFields = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${sectionHeader('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1px;">
            <div style="font-weight:700;font-size:${ty.bodyFontSize};font-style:italic;">${esc(e.role)}</div>
            ${dateStr(e) ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">${dateStr(e)}</div>` : ''}
          </div>
          <div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:4px;">${esc(e.company)}${e.company && e.location ? ', ' : ''}${esc(e.location)}</div>
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${sectionHeader('Education')}
      ${education.map(e => `
        <div style="margin-bottom:12px;text-align:center;">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.institution)}</div>
          <div style="font-size:${ty.bodyFontSize};font-style:italic;color:${c.mutedText};">
            ${[e.degree, e.field].filter(Boolean).join(', ')}${(e.degree || e.field) && (e.startDate || e.endDate) ? ' ' : ''}${(e.startDate || e.endDate) ? `(${[e.startDate, e.endDate].filter(Boolean).join(' – ')})` : ''}
          </div>
          ${e.gpa ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">GPA: ${esc(e.gpa)}</div>` : ''}
        </div>`).join('')}` : '',

    skills: hasSkills ? `
      ${sectionHeader('Skills')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.9;text-align:center;">
        ${skills.filter(sk => (sk.items ?? []).length > 0).flatMap(sk => sk.items ?? []).map(esc).join(' &middot; ')}
      </div>` : '',

    languages: languages.length > 0 ? `
      ${sectionHeader('Languages')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.9;text-align:center;">
        ${languages.map(lang => esc(lang.language) + (lang.proficiency ? ` (${esc(lang.proficiency)})` : '')).join(' &middot; ')}
      </div>` : '',

    certifications: certifications.length > 0 ? `
      ${sectionHeader('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};display:flex;justify-content:space-between;align-items:baseline;">
          <div><strong>${esc(cert.name)}</strong>${cert.issuer ? ` &middot; <em>${esc(cert.issuer)}</em>` : ''}</div>
          ${cert.date ? `<span style="color:${c.mutedText};">${esc(cert.date)}</span>` : ''}
        </div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${sectionHeader('Awards')}
      ${awards.map(aw => `
        <div style="margin-bottom:8px;font-size:${ty.bodyFontSize};display:flex;justify-content:space-between;align-items:baseline;">
          <div>${aw.title ? `<strong>${esc(aw.title)}</strong>` : ''}${aw.issuer ? ` &middot; <em>${esc(aw.issuer)}</em>` : ''}</div>
          ${aw.date ? `<span style="color:${c.mutedText};">${esc(aw.date)}</span>` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${sectionHeader('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};font-style:italic;">${esc(proj.title)}${proj.url ? ` &middot; <span style="font-style:normal;font-weight:400;">${esc(proj.url)}</span>` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:2px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${sectionHeader(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${sectionHeader('Profile')}
    <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};text-align:justify;">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(key => sectionMap[key] || '').join('')

  const header = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};letter-spacing:0.5px;">${esc(personal.name)}</div>
      ${personal.title ? `<div style="font-size:13px;color:${c.mutedText};margin-top:6px;font-style:italic;">${esc(personal.title)}</div>` : ''}
      ${contactFields.length > 0 ? `<div style="font-size:12px;color:${c.mutedText};margin-top:8px;">${contactFields.map(esc).join(' | ')}</div>` : ''}
    </div>
    <div style="height:1px;background:${c.dividerColor};margin-bottom:4px;"></div>`

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;padding:48px 56px;">
    ${header}${summaryHtml}${sectionsHtml}
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── CREATIVE STAR ──────────────────────────────────────────────── */
function renderCreativeStar(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const star = `<svg width="18" height="18" viewBox="0 0 18 18" fill="${c.headingText}"><path d="M9 0l1.5 6.5L17 9l-6.5 1.5L9 18l-1.5-6.5L1 9l6.5-1.5z"/></svg>`

  const sectionHeader = (text) =>
    `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;margin-top:28px;">
      <div style="font-family:${ty.sectionLabelFont};font-size:${ty.sectionLabelSize};font-weight:${ty.sectionLabelWeight};color:${c.headingText};">${esc(text)}</div>
      ${star}
    </div>
    <div style="height:1px;background:${c.dividerColor};margin-bottom:14px;"></div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' · ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const nameParts = (personal.name || '').split(' ')
  const firstName = nameParts[0] || ''
  const lastName  = nameParts.slice(1).join(' ') || ''

  const detailRows = [
    personal.phone    && { label: 'Phone',    val: personal.phone    },
    personal.email    && { label: 'Email',    val: personal.email    },
    personal.location && { label: 'Location', val: personal.location },
  ].filter(Boolean)

  const headerHtml = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};line-height:1.0;">
        <div>${esc(firstName)}</div>
        ${lastName ? `<div>${esc(lastName)}</div>` : ''}
        ${personal.title ? `<div style="font-size:13px;font-family:${ty.bodyFont};font-weight:400;color:${c.mutedText};margin-top:10px;">${esc(personal.title)}</div>` : ''}
      </div>
      ${detailRows.length > 0 ? `
        <div style="min-width:260px;max-width:340px;">
          <div style="font-size:15px;font-weight:700;color:${c.headingText};margin-bottom:6px;">Details</div>
          ${detailRows.map((row, i) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;font-size:${ty.bodyFontSize};">
              <span style="color:${c.tableLabel};">${esc(row.label)}</span>
              <span style="font-weight:700;color:${c.tableValue};margin-left:16px;text-align:right;word-break:break-all;">${esc(row.val)}</span>
            </div>
            ${i < detailRows.length - 1 ? `<div style="height:1px;background:${c.dividerColor};"></div>` : ''}`).join('')}
        </div>` : ''}
    </div>
    <div style="height:1px;background:${c.dividerColor};margin-bottom:4px;"></div>`

  const sectionMap = {
    experience: experience.length > 0 ? `
      ${sectionHeader('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          ${dateStr(e) ? `<div style="font-size:12px;color:${c.mutedText};margin-bottom:2px;">${dateStr(e)}</div>` : ''}
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.company)}</div>
          ${e.role ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};">${esc(e.role)}${e.location ? `, ${esc(e.location)}` : ''}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:4px;">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${sectionHeader('Education')}
      ${education.map(e => `
        <div style="margin-bottom:12px;font-size:${ty.bodyFontSize};">
          ${(e.startDate || e.endDate) ? `<div style="font-size:12px;color:${c.mutedText};margin-bottom:2px;">${[e.startDate, e.endDate].filter(Boolean).join(' · ')}</div>` : ''}
          <div style="font-weight:700;">${esc(e.institution)}</div>
          <div style="color:${c.mutedText};">${esc([e.degree, e.field].filter(Boolean).join(', '))}</div>
        </div>`).join('')}` : '',

    skills: hasSkills ? `
      ${sectionHeader('Skills')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.9;">${allSkillItems.map(esc).join(' · ')}</div>` : '',

    languages: languages.length > 0 ? `
      ${sectionHeader('Languages')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
        ${languages.map(lang => esc(lang.language) + (lang.proficiency ? ` (${esc(lang.proficiency)})` : '')).join(' · ')}
      </div>` : '',

    certifications: certifications.length > 0 ? `
      ${sectionHeader('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:8px;font-size:${ty.bodyFontSize};">
          <div style="font-weight:700;">${esc(cert.name)}</div>
          ${cert.issuer ? `<div style="color:${c.mutedText};">${esc(cert.issuer)}</div>` : ''}
          ${cert.date ? `<div style="font-size:12px;color:${c.mutedText};">${esc(cert.date)}</div>` : ''}
        </div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${sectionHeader('Achievements')}
      ${awards.map(aw => `
        <div style="margin-bottom:8px;font-size:${ty.bodyFontSize};">
          ${aw.title ? `<strong>${esc(aw.title)}</strong>` : ''}${aw.issuer ? ` &middot; ${esc(aw.issuer)}` : ''}${aw.date ? ` &middot; ${esc(aw.date)}` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${sectionHeader('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` &middot; ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:2px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${sectionHeader(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`).join('') : '',
  }

  const socialHtml = (personal.linkedin || personal.website) ? `
    ${sectionHeader('Websites and Social Links')}
    <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
      ${personal.linkedin ? `<div><strong>LinkedIn:</strong> ${esc(personal.linkedin)}</div>` : ''}
      ${personal.website  ? `<div><strong>GitHub:</strong> ${esc(personal.website)}</div>` : ''}
    </div>` : ''

  const summaryHtml = personal.summary ? `
    ${sectionHeader('Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>` : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(k => sectionMap[k] || '').join('')

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;padding:44px 44px 52px;">
    ${headerHtml}${socialHtml}${summaryHtml}${sectionsHtml}
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── CREATIVE MINIMAL ───────────────────────────────────────────── */
function renderCreativeMinimal(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const labelW = `${l.labelWidthPercent}%`
  const LABEL_STYLE = `font-size:${ty.sectionLabelSize};font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${c.labelColor};font-family:Arial,Helvetica,sans-serif;`

  const row = (label, contentHtml) =>
    `<div style="display:flex;align-items:flex-start;margin-bottom:20px;">
      <div style="width:${labelW};flex-shrink:0;padding-top:1px;"><span style="${LABEL_STYLE}">${esc(label)}</span></div>
      <div style="flex:1;min-width:0;">${contentHtml}</div>
    </div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const contactFields = [personal.phone, personal.email, personal.location, personal.linkedin, personal.website].filter(Boolean)

  const headerHtml = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
      <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.headingText};line-height:1.15;">
        ${esc(personal.name)}
        ${personal.title ? `<div style="font-size:13px;font-family:Arial,Helvetica,sans-serif;font-weight:400;color:${c.mutedText};margin-top:6px;">${esc(personal.title)}</div>` : ''}
      </div>
      ${contactFields.length > 0 ? `<div style="text-align:right;font-size:${ty.bodyFontSize};line-height:1.9;color:${c.mainText};">
        ${contactFields.map(f => `<div>${esc(f)}</div>`).join('')}
      </div>` : ''}
    </div>
    <div style="height:1px;background:${c.dividerColor};margin-bottom:24px;"></div>`

  const sectionMap = {
    experience: experience.length > 0 ? row('Experience', experience.map(e => `
      <div style="margin-bottom:${l.itemSpacing};">
        <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? `, ${esc(e.company)}` : ''}</div>
        ${dateStr(e) ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:3px;">${dateStr(e)}</div>` : ''}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
      </div>`).join('')) : '',

    education: education.length > 0 ? row('Education', education.map(e => `
      <div style="margin-bottom:10px;font-size:${ty.bodyFontSize};">
        <div style="font-weight:700;">${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}${e.degree ? `, ${esc(e.degree)}` : ''}${e.field ? `, ${esc(e.field)}` : ''}</div>
        ${(e.startDate || e.endDate) ? `<div style="color:${c.mutedText};">${[e.startDate, e.endDate].filter(Boolean).join(' — ')}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>` : ''}
      </div>`).join('')) : '',

    skills: hasSkills ? row('Skills',
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;">
        ${allSkillItems.map(item => `<div style="font-size:${ty.bodyFontSize};display:flex;gap:6px;"><span>•</span><span>${esc(item)}</span></div>`).join('')}
      </div>`) : '',

    languages: languages.length > 0 ? row('Languages',
      `<div style="font-size:${ty.bodyFontSize};line-height:1.9;">
        ${languages.map(lang => esc(lang.language) + (lang.proficiency ? ` (${esc(lang.proficiency)})` : '')).join(' · ')}
      </div>`) : '',

    certifications: certifications.length > 0 ? row('Certifications', certifications.map(cert => `
      <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
        <strong>${esc(cert.name)}</strong>${cert.issuer ? ` &middot; ${esc(cert.issuer)}` : ''}${cert.date ? ` &middot; ${esc(cert.date)}` : ''}
      </div>`).join('')) : '',

    awards: awards.length > 0 ? row('Achievements', awards.map(aw => `
      <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
        ${aw.title ? `<strong>${esc(aw.title)}</strong>` : ''}${aw.issuer ? ` &middot; ${esc(aw.issuer)}` : ''}${aw.date ? ` &middot; ${esc(aw.date)}` : ''}
      </div>`).join('')) : '',

    projects: projects.length > 0 ? row('Projects', projects.map(proj => `
      <div style="margin-bottom:${l.itemSpacing};">
        <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` &middot; ${esc(proj.url)}` : ''}</div>
        ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:2px;">${esc(proj.description)}</div>` : ''}
      </div>`).join('')) : '',

    custom: custom.length > 0 ?
      custom.map(sec => row(sec.title || 'Other', `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`)).join('') : '',
  }

  const summaryHtml = personal.summary ? row('Summary', `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(personal.summary)}</div>`) : ''

  const sectionsHtml = sectionOrder.filter(k => k !== 'personal').map(k => sectionMap[k] || '').join('')

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;padding:44px 44px 52px;">
    ${headerHtml}${summaryHtml}${sectionsHtml}
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── EXECUTIVE BAND ─────────────────────────────────────────────── */
function renderExecutiveBand(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const badge = (text) =>
    `<div style="display:inline-block;background:${c.labelBg};color:${c.labelText};font-size:${ty.sectionLabelSize};font-weight:800;text-transform:uppercase;letter-spacing:1.2px;padding:3px 8px;margin-bottom:10px;margin-top:18px;">${esc(text)}</div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)

  const leftHtml = `
    <div style="width:${l.sidebarWidthPercent}%;padding:24px 20px 40px 28px;box-sizing:border-box;flex-shrink:0;border-right:1px solid ${c.dividerColor};font-family:${ty.bodyFont};">
      ${badge('Details')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
        ${personal.location ? `<div>${esc(personal.location)}</div>` : ''}
        ${personal.phone    ? `<div>${esc(personal.phone)}</div>` : ''}
        ${personal.email    ? `<div style="word-break:break-all;">${esc(personal.email)}</div>` : ''}
      </div>
      ${(personal.linkedin || personal.website) ? `
        ${badge('Websites &amp; Social Links')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
          ${personal.linkedin ? `<div><strong>LinkedIn:</strong> ${esc(personal.linkedin)}</div>` : ''}
          ${personal.website  ? `<div><strong>GitHub:</strong> ${esc(personal.website)}</div>` : ''}
        </div>` : ''}
      ${hasSkills ? `
        ${badge('Skills')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
          ${skills.filter(sk => (sk.items ?? []).length > 0).map(sk =>
            `<div>${(sk.items ?? []).map(esc).join(', ')}</div>`
          ).join('')}
        </div>` : ''}
      ${languages.length > 0 ? `
        ${badge('Languages')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.8;">
          ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` (${esc(lang.proficiency)})` : ''}</div>`).join('')}
        </div>` : ''}
    </div>`

  const rightSectionMap = {
    experience: experience.length > 0 ? `
      ${badge('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? `, ${esc(e.company)}` : ''}${e.location ? `, <span style="font-weight:400;color:${c.mutedText};">${esc(e.location)}</span>` : ''}</div>
          ${dateStr(e) ? `<div style="font-size:${ty.bodyFontSize};color:${c.dateMuted};font-weight:600;text-transform:uppercase;letter-spacing:0.3px;margin:2px 0 4px;">${dateStr(e)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${badge('Education')}
      ${education.map(e => `
        <div style="margin-bottom:10px;font-size:${ty.bodyFontSize};">
          <div style="font-weight:700;">${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</div>
          <div style="color:${c.mutedText};">${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}</div>
          ${(e.startDate || e.endDate) ? `<div style="color:${c.mutedText};">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${badge('Certifications')}
      ${certifications.map(cert => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
          <strong>${esc(cert.name)}</strong>${cert.issuer ? ` &middot; ${esc(cert.issuer)}` : ''}${cert.date ? ` &middot; ${esc(cert.date)}` : ''}
        </div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${badge('Achievements')}
      ${awards.map(aw => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
          ${aw.title ? `<strong>${esc(aw.title)}</strong>` : ''}${aw.issuer ? ` &middot; ${esc(aw.issuer)}` : ''}${aw.date ? ` &middot; ${esc(aw.date)}` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${badge('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` &middot; ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:2px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${badge(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${badge('Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-bottom:4px;">${esc(personal.summary)}</div>` : ''

  const rightSections = sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k))
  const rightHtml = `<div style="flex:1;padding:8px 28px 40px 20px;box-sizing:border-box;font-family:${ty.bodyFont};">${summaryHtml}${rightSections.map(k => rightSectionMap[k] || '').join('')}</div>`

  const nameHeader = `<div style="background:${c.bannerBg};padding:28px 28px 22px;">
    <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.bannerText};line-height:1.1;letter-spacing:-0.5px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:13px;color:${c.bannerText};opacity:0.75;margin-top:5px;">${esc(personal.title)}</div>` : ''}
  </div>`

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;">
    ${nameHeader}
    <div style="display:flex;align-items:flex-start;">${leftHtml}${rightHtml}</div>
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── EXECUTIVE SIDEBAR ──────────────────────────────────────────── */
function renderExecutiveSidebar(content, t) {
  const { personal = {}, experience = [], education = [], skills = [],
          projects = [], certifications = [], languages = [], awards = [], custom = [],
          sectionOrder = [] } = content
  const c = t.colors, ty = t.typography, l = t.layout

  const sectionHeader = (text) =>
    `<div style="font-size:${ty.sectionLabelSize};font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${c.headingText};margin-bottom:8px;margin-top:20px;padding-bottom:4px;border-bottom:1.5px solid ${c.dividerColor};">${esc(text)}</div>`

  const sidebarLabel = (text) =>
    `<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${c.sidebarMuted};margin-bottom:8px;margin-top:18px;">${esc(text)}</div>`

  const dateStr = (e) => [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
  const hasSkills = skills.some(sk => (sk.items ?? []).length > 0)
  const allSkillItems = skills.flatMap(sk => sk.items ?? [])

  const leftHtml = `
    <div style="width:${l.sidebarWidthPercent}%;background:${c.sidebarBg};padding:24px 20px 40px 24px;box-sizing:border-box;flex-shrink:0;font-family:${ty.bodyFont};">
      ${sidebarLabel('Details')}
      <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
        ${personal.email    ? `<div style="word-break:break-all;">${esc(personal.email)}</div>` : ''}
        ${personal.location ? `<div>${esc(personal.location)}</div>` : ''}
        ${personal.phone    ? `<div>${esc(personal.phone)}</div>` : ''}
        ${personal.linkedin ? `<div style="word-break:break-all;">${esc(personal.linkedin)}</div>` : ''}
        ${personal.website  ? `<div style="word-break:break-all;">${esc(personal.website)}</div>` : ''}
      </div>
      ${hasSkills ? `
        <div style="height:1px;background:${c.dividerColor};margin:16px 0;"></div>
        ${sidebarLabel('Skills')}
        <ul style="list-style:none;padding:0;margin:0;font-size:${ty.bodyFontSize};line-height:1.9;">
          ${allSkillItems.map(item => `<li style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;">•</span>${esc(item)}</li>`).join('')}
        </ul>` : ''}
      ${languages.length > 0 ? `
        <div style="height:1px;background:${c.dividerColor};margin:16px 0;"></div>
        ${sidebarLabel('Languages')}
        <div style="font-size:${ty.bodyFontSize};line-height:1.9;">
          ${languages.map(lang => `<div>${esc(lang.language)}${lang.proficiency ? ` — ${esc(lang.proficiency)}` : ''}</div>`).join('')}
        </div>` : ''}
    </div>`

  const rightSectionMap = {
    experience: experience.length > 0 ? `
      ${sectionHeader('Experience')}
      ${experience.map(e => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(e.role)}${e.company ? `, ${esc(e.company)}` : ''}</div>
          ${dateStr(e) ? `<div style="font-size:${ty.bodyFontSize};color:${c.mutedText};margin-bottom:3px;">${dateStr(e)}</div>` : ''}
          <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${renderBullets(e.bullets)}</div>
        </div>`).join('')}` : '',

    education: education.length > 0 ? `
      ${sectionHeader('Education')}
      ${education.map(e => `
        <div style="margin-bottom:10px;font-size:${ty.bodyFontSize};">
          <div style="font-weight:700;">${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}${e.location ? `, <span style="font-weight:400;color:${c.mutedText};">${esc(e.location)}</span>` : ''}</div>
          <div>${esc(e.institution)}</div>
          ${(e.startDate || e.endDate) ? `<div style="color:${c.mutedText};">${[e.startDate, e.endDate].filter(Boolean).join(' — ')}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>` : ''}
        </div>`).join('')}` : '',

    certifications: certifications.length > 0 ? `
      ${sectionHeader('Certifications and Licenses')}
      ${certifications.map(cert => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
          ${esc(cert.name)}${cert.issuer ? ` &middot; ${esc(cert.issuer)}` : ''}${cert.date ? ` &middot; ${esc(cert.date)}` : ''}
        </div>`).join('')}` : '',

    awards: awards.length > 0 ? `
      ${sectionHeader('Achievements')}
      ${awards.map(aw => `
        <div style="margin-bottom:6px;font-size:${ty.bodyFontSize};">
          ${aw.title ? `<strong>${esc(aw.title)}</strong>` : ''}${aw.issuer ? ` &middot; ${esc(aw.issuer)}` : ''}${aw.date ? ` &middot; ${esc(aw.date)}` : ''}
        </div>`).join('')}` : '',

    projects: projects.length > 0 ? `
      ${sectionHeader('Projects')}
      ${projects.map(proj => `
        <div style="margin-bottom:${l.itemSpacing};">
          <div style="font-weight:700;font-size:${ty.bodyFontSize};">${esc(proj.title)}${proj.url ? ` &middot; ${esc(proj.url)}` : ''}</div>
          ${proj.description ? `<div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-top:2px;">${esc(proj.description)}</div>` : ''}
        </div>`).join('')}` : '',

    custom: custom.length > 0 ?
      custom.map(sec => `
        ${sectionHeader(sec.title || 'Other')}
        <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};">${esc(sec.description)}</div>`).join('') : '',
  }

  const summaryHtml = personal.summary ? `
    ${sectionHeader('Summary')}
    <div style="font-size:${ty.bodyFontSize};line-height:${ty.bodyLineHeight};margin-bottom:4px;">${esc(personal.summary)}</div>` : ''

  const rightSections = sectionOrder.filter(k => !['personal', 'skills', 'languages'].includes(k))
  const rightHtml = `<div style="flex:1;padding:24px 28px 40px 24px;box-sizing:border-box;font-family:${ty.bodyFont};">${summaryHtml}${rightSections.map(k => rightSectionMap[k] || '').join('')}</div>`

  const nameHeader = `<div style="background:${c.bannerBg};padding:22px 24px 18px;">
    <div style="font-family:${ty.nameFont};font-size:${ty.nameFontSize};font-weight:${ty.nameFontWeight};color:${c.bannerText};letter-spacing:0.3px;">${esc(personal.name)}</div>
    ${personal.title ? `<div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px;">${esc(personal.title)}</div>` : ''}
  </div>`

  const body = `<div style="font-family:${ty.bodyFont};color:${c.mainText};background:${c.mainBg};min-height:11in;">
    ${nameHeader}
    <div style="display:flex;align-items:flex-start;">${leftHtml}${rightHtml}</div>
  </div>`
  return wrapHtml('', ty.bodyFont, body)
}

/* ─── DISPATCH ────────────────────────────────────────────────────── */
const RENDERERS = {
  'classic':              renderClassic,
  'classic-traditional':  renderClassic,
  'classic-academic':     renderClassicAcademic,
  'classic-formal':       renderClassicFormal,
  'modern':               renderModern,
  'modern-sidebar':       renderModernSidebar,
  'modern-banner':        renderModernBanner,
  'modern-split':         renderModernSplit,
  'minimal':              renderMinimal,
  'minimal-columns':      renderMinimalColumns,
  'minimal-boxed':        renderMinimalBoxed,
  'minimal-serif':        renderMinimalSerif,
  'executive':            renderExecutive,
  'executive-band':       renderExecutiveBand,
  'executive-sidebar':    renderExecutiveSidebar,
  'creative':             renderCreative,
  'creative-star':        renderCreativeStar,
  'creative-minimal':     renderCreativeMinimal,
}

function renderToHtml(content, templateId) {
  const t = loadTemplate(templateId)
  const fn = RENDERERS[templateId]
  if (!fn) throw new Error(`Unknown template: ${templateId}`)
  return fn(content, t)
}

module.exports = { renderToHtml }
