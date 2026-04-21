const { v4: uuid } = require('uuid')

const SECTION_PATTERNS = [
  { key: 'experience',     regex: /^(experience|work experience|employment|work history|career history)/i },
  { key: 'education',      regex: /^(education|academic|qualifications)/i },
  { key: 'skills',         regex: /^(skills|technical skills|core competencies|competencies)/i },
  { key: 'projects',       regex: /^(projects|personal projects|notable projects)/i },
  { key: 'certifications', regex: /^(certifications?|licenses?|credentials)/i },
  { key: 'languages',      regex: /^(languages)/i },
  { key: 'awards',         regex: /^(awards?|honors?|achievements?|accomplishments?)/i },
  { key: 'custom',         regex: /^(volunteer|publications?|references?|interests?|hobbies)/i },
]

const EMAIL_RE    = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i
const PHONE_RE    = /(\+?[(]?[\d][\d\s\-().]{6,}\d)/
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i
const WEBSITE_RE  = /https?:\/\/[^\s|·,]+/i
const DATE_RE     = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4})\s*(–|-|to)\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4}|present|current)/i

function extractPersonal(lines) {
  const personal = { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' }
  const contactLine = lines.slice(0, 6).join(' ')

  const emailMatch    = contactLine.match(EMAIL_RE)
  const phoneMatch    = contactLine.match(PHONE_RE)
  const linkedinMatch = contactLine.match(LINKEDIN_RE)
  const websiteMatch  = contactLine.match(WEBSITE_RE)

  if (emailMatch)    personal.email    = emailMatch[0].trim()
  if (phoneMatch)    personal.phone    = phoneMatch[0].trim()
  if (linkedinMatch) personal.linkedin = linkedinMatch[0].trim()
  if (websiteMatch && !linkedinMatch)  personal.website = websiteMatch[0].trim()

  for (const line of lines) {
    const clean = line.trim()
    if (clean && !EMAIL_RE.test(clean) && !PHONE_RE.test(clean) && clean.length < 60) {
      personal.name = clean
      break
    }
  }

  return personal
}

function splitIntoSections(lines) {
  const sections = [{ key: 'header', lines: [] }]
  let current = sections[0]

  for (const line of lines) {
    const trimmed = line.trim()
    const matched = SECTION_PATTERNS.find(({ regex }) => regex.test(trimmed) && trimmed.length < 50)
    if (matched) {
      current = { key: matched.key, lines: [] }
      sections.push(current)
    } else {
      current.lines.push(line)
    }
  }

  return sections
}

function parseExperience(lines) {
  const entries = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dateMatch = trimmed.match(DATE_RE)
    if (dateMatch) {
      if (current) {
        current.startDate = dateMatch[1] || ''
        current.endDate   = dateMatch[4] || ''
        current.current   = /present|current/i.test(dateMatch[4] || '')
      }
      continue
    }

    if (trimmed.match(/^[•\-–*]\s+/) && current) {
      current.bullets.push(trimmed.replace(/^[•\-–*]\s+/, ''))
      continue
    }

    if (/—|–|-|@|\bat\b/.test(trimmed) && trimmed.length < 100 && !trimmed.startsWith('•')) {
      const parts = trimmed.split(/\s*[—–]\s*|\s+at\s+|\s*-\s*/)
      current = {
        id: uuid(), role: (parts[0] || '').trim(), company: (parts[1] || '').trim(),
        location: '', startDate: '', endDate: '', current: false, bullets: []
      }
      entries.push(current)
    } else if (!current || (current.role && !dateMatch)) {
      current = {
        id: uuid(), role: '', company: trimmed,
        location: '', startDate: '', endDate: '', current: false, bullets: []
      }
      entries.push(current)
    }
  }

  return entries
}

function parseEducation(lines) {
  const entries = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dateMatch = trimmed.match(/\d{4}/)
    if (dateMatch && current) {
      current.endDate = dateMatch[0]
      continue
    }

    if (/^(b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|ph\.?d\.?|bachelor|master|doctor|associate)/i.test(trimmed)) {
      current = { id: uuid(), institution: '', degree: trimmed, field: '', startDate: '', endDate: '', gpa: '' }
      entries.push(current)
    } else if (current && !current.institution) {
      current.institution = trimmed
    } else {
      current = { id: uuid(), institution: trimmed, degree: '', field: '', startDate: '', endDate: '', gpa: '' }
      entries.push(current)
    }
  }

  return entries
}

function parseSkills(lines) {
  const allItems = lines
    .join(', ')
    .split(/[,|•\n]/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!allItems.length) return []
  return [{ id: uuid(), category: 'Skills', items: allItems }]
}

function parseCertifications(lines) {
  return lines
    .filter((l) => l.trim())
    .map((l) => {
      const parts = l.trim().split(/\s*[—–,]\s*/)
      return { id: uuid(), name: parts[0] || '', issuer: parts[1] || '', date: parts[2] || '', url: '' }
    })
}

function mapToContent(rawText) {
  const lines = rawText.split('\n').map((l) => l.trimEnd())
  const sections = splitIntoSections(lines)

  const headerSection = sections.find((s) => s.key === 'header') || { lines: [] }
  const personal      = extractPersonal(headerSection.lines)

  const content = {
    meta: { version: '1.0', updatedAt: new Date().toISOString() },
    personal,
    experience:     [],
    education:      [],
    skills:         [],
    projects:       [],
    certifications: [],
    languages:      [],
    awards:         [],
    custom:         [],
    sectionOrder:   ['personal'],
    _raw:           rawText
  }

  const sectionOrder = ['personal']

  for (const section of sections) {
    if (section.key === 'header') continue
    sectionOrder.push(section.key)

    switch (section.key) {
      case 'experience':     content.experience     = parseExperience(section.lines);     break
      case 'education':      content.education      = parseEducation(section.lines);      break
      case 'skills':         content.skills         = parseSkills(section.lines);         break
      case 'certifications': content.certifications = parseCertifications(section.lines); break
      default:
        content[section.key] = section.lines
          .filter((l) => l.trim())
          .map((l) => ({ id: uuid(), label: section.key, content: l.trim() }))
    }
  }

  content.sectionOrder = [...new Set(sectionOrder)]
  return content
}

module.exports = { mapToContent }
