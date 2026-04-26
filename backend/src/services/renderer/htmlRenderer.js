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

/* ─── DISPATCH ────────────────────────────────────────────────────── */
const RENDERERS = { classic: renderClassic, modern: renderModern, minimal: renderMinimal, executive: renderExecutive, creative: renderCreative }

function renderToHtml(content, templateId) {
  const t = loadTemplate(templateId)
  const fn = RENDERERS[templateId]
  if (!fn) throw new Error(`Unknown template: ${templateId}`)
  return fn(content, t)
}

module.exports = { renderToHtml }
