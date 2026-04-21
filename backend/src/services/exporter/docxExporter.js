const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType
} = require('docx')
const fs   = require('fs')
const path = require('path')

function loadTemplate(templateId) {
  const file = path.join(__dirname, '../../templates', `${templateId}.json`)
  if (!fs.existsSync(file)) throw new Error(`Unknown template: ${templateId}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function hexToRgb(hex) {
  const clean = (hex || '#000000').replace('#', '')
  return clean.length === 6 ? clean.toUpperCase() : '000000'
}

function sectionHeading(label, t) {
  return new Paragraph({
    text: label.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: hexToRgb(t.colors.dividerColor) } },
    run: { font: t.typography.sectionLabelFont?.split(',')[0].trim().replace(/['"]/g, '') || 'Arial', size: 20, bold: true, color: hexToRgb(t.colors.headingText) }
  })
}

function text(str, opts = {}) {
  return new TextRun({ text: String(str || ''), ...opts })
}

function buildPersonalSection(personal, t) {
  const font = t.typography.nameFont?.split(',')[0].trim().replace(/['"]/g, '') || 'Arial'
  const paras = [
    new Paragraph({
      alignment: t.header.alignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [text(personal.name, { font, size: 48, bold: true, color: hexToRgb(t.colors.headingText) })]
    })
  ]
  if (personal.title) {
    paras.push(new Paragraph({
      alignment: t.header.alignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [text(personal.title, { font, size: 24, color: hexToRgb(t.colors.mutedText) })]
    }))
  }
  const contact = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).join('  ·  ')
  if (contact) {
    paras.push(new Paragraph({
      alignment: t.header.alignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 160 },
      children: [text(contact, { size: 18, color: hexToRgb(t.colors.mutedText) })]
    }))
  }
  if (personal.summary) {
    paras.push(new Paragraph({ children: [text(personal.summary, { size: 20 })], spacing: { after: 120 } }))
  }
  return paras
}

function buildExperienceSection(experience, t) {
  if (!experience.length) return []
  const paras = [sectionHeading('Experience', t)]
  for (const e of experience) {
    paras.push(new Paragraph({
      children: [
        text(`${e.role}${e.role && e.company ? ' — ' : ''}${e.company}`, { bold: true, size: 20 }),
        text(`   ${e.current ? 'Present' : e.endDate}${e.startDate ? ` (${e.startDate})` : ''}`, { size: 18, color: hexToRgb(t.colors.mutedText) })
      ],
      spacing: { before: 100 }
    }))
    if (e.location) paras.push(new Paragraph({ children: [text(e.location, { size: 18, color: hexToRgb(t.colors.mutedText) })] }))
    for (const b of (e.bullets || [])) {
      if (b) paras.push(new Paragraph({ bullet: { level: 0 }, children: [text(b, { size: 18 })], spacing: { after: 40 } }))
    }
  }
  return paras
}

function buildEducationSection(education, t) {
  if (!education.length) return []
  const paras = [sectionHeading('Education', t)]
  for (const e of education) {
    paras.push(new Paragraph({
      children: [
        text(`${e.degree} ${e.field}`.trim(), { bold: true, size: 20 }),
        text(`   ${e.endDate}`, { size: 18, color: hexToRgb(t.colors.mutedText) })
      ],
      spacing: { before: 100 }
    }))
    paras.push(new Paragraph({ children: [text(e.institution, { size: 18, color: hexToRgb(t.colors.mutedText) })], spacing: { after: 80 } }))
    if (e.gpa) paras.push(new Paragraph({ children: [text(`GPA: ${e.gpa}`, { size: 18 })] }))
  }
  return paras
}

function buildSkillsSection(skills, t) {
  if (!skills.length) return []
  const paras = [sectionHeading('Skills', t)]
  for (const s of skills) {
    paras.push(new Paragraph({
      children: [
        s.category ? text(`${s.category}: `, { bold: true, size: 18 }) : null,
        text(s.items.join(', '), { size: 18 })
      ].filter(Boolean),
      spacing: { after: 60 }
    }))
  }
  return paras
}

function buildCertificationsSection(certs, t) {
  if (!certs.length) return []
  const paras = [sectionHeading('Certifications', t)]
  for (const c of certs) {
    paras.push(new Paragraph({
      children: [
        text(c.name, { bold: true, size: 18 }),
        c.issuer ? text(` — ${c.issuer}`, { size: 18 }) : null,
        c.date   ? text(`, ${c.date}`, { size: 18, color: hexToRgb(t.colors.mutedText) }) : null
      ].filter(Boolean),
      spacing: { after: 60 }
    }))
  }
  return paras
}

function buildGenericSection(label, items, t) {
  if (!items.length) return []
  const paras = [sectionHeading(label, t)]
  for (const item of items) {
    const body = item.content || item.name || item.language || item.title || ''
    if (body) paras.push(new Paragraph({ children: [text(body, { size: 18 })], spacing: { after: 60 } }))
  }
  return paras
}

function buildSection(key, content, t) {
  switch (key) {
    case 'experience':     return buildExperienceSection(content.experience, t)
    case 'education':      return buildEducationSection(content.education, t)
    case 'skills':         return buildSkillsSection(content.skills, t)
    case 'certifications': return buildCertificationsSection(content.certifications, t)
    case 'projects':       return buildGenericSection('Projects', content.projects, t)
    case 'languages':      return buildGenericSection('Languages', content.languages, t)
    case 'awards':         return buildGenericSection('Awards', content.awards, t)
    case 'custom':         return buildGenericSection(content.custom[0]?.label || 'Other', content.custom, t)
    default: return []
  }
}

async function exportToDocx(content, templateId) {
  const t = loadTemplate(templateId)

  const children = [
    ...buildPersonalSection(content.personal, t),
    ...content.sectionOrder
      .filter((k) => k !== 'personal')
      .flatMap((k) => buildSection(k, content, t))
  ]

  const doc = new Document({
    sections: [{ properties: {}, children }]
  })

  return await Packer.toBuffer(doc)
}

module.exports = { exportToDocx }
