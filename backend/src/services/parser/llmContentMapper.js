const { v4: uuid } = require('uuid')

function str(v) { return (v != null && v !== false) ? String(v) : '' }
function arr(v) { return Array.isArray(v) ? v : [] }

function normalizePersonal(p) {
  p = p || {}
  return {
    name:     str(p.name),
    title:    str(p.title),
    email:    str(p.email),
    phone:    str(p.phone),
    location: str(p.location),
    linkedin: str(p.linkedin),
    website:  str(p.website),
    summary:  str(p.summary)
  }
}

function normalizeExperience(list) {
  return arr(list).map(e => ({
    id:        uuid(),
    company:   str(e.company),
    role:      str(e.role),
    location:  str(e.location),
    startDate: str(e.startDate),
    endDate:   str(e.endDate),
    current:   e.current === true,
    bullets:   arr(e.bullets).map(str).filter(Boolean)
  }))
}

function normalizeEducation(list) {
  return arr(list).map(e => ({
    id:          uuid(),
    institution: str(e.institution),
    degree:      str(e.degree),
    field:       str(e.field),
    startDate:   str(e.startDate),
    endDate:     str(e.endDate),
    gpa:         str(e.gpa)
  }))
}

function normalizeSkills(list) {
  return arr(list).map(sk => {
    let items = sk.items
    if (typeof items === 'string') {
      items = items.split(',').map(s => s.trim()).filter(Boolean)
    } else {
      items = arr(items).map(str).filter(Boolean)
    }
    return { id: uuid(), category: str(sk.category), items }
  })
}

function normalizeCertifications(list) {
  return arr(list).map(c => ({ id: uuid(), name: str(c.name), issuer: str(c.issuer), date: str(c.date) }))
}

function normalizeLanguages(list) {
  return arr(list).map(l => ({ id: uuid(), language: str(l.language), proficiency: str(l.proficiency) || 'Professional' }))
}

function normalizeAwards(list) {
  return arr(list).map(a => ({ id: uuid(), title: str(a.title), issuer: str(a.issuer), date: str(a.date) }))
}

function normalizeProjects(list) {
  return arr(list).map(p => ({ id: uuid(), title: str(p.title), description: str(p.description), url: str(p.url) }))
}

const EXPERIENCE_HEADINGS = /^(experience|experiences|work experience|professional experience|internship|work history|employment)$/i

function normalizeCustom(list) {
  return arr(list)
    .filter(c => !EXPERIENCE_HEADINGS.test(str(c.title).trim()))
    .map(c => {
      const bullets = Array.isArray(c.bullets) ? c.bullets.map(str).filter(Boolean) : []
      const description = bullets.length > 0 ? bullets.join('\n') : str(c.description)
      return { id: uuid(), title: str(c.title), description }
    })
}

function normalizeLlmContent(raw, rawText) {
  const llm = raw || {}

  const personal       = normalizePersonal(llm.personal)
  const experience     = normalizeExperience(llm.experience)
  const education      = normalizeEducation(llm.education)
  const skills         = normalizeSkills(llm.skills)
  const projects       = normalizeProjects(llm.projects)
  const certifications = normalizeCertifications(llm.certifications)
  const languages      = normalizeLanguages(llm.languages)
  const awards         = normalizeAwards(llm.awards)
  const custom         = normalizeCustom(llm.custom)

  const sectionOrder = ['personal']
  if (experience.length)     sectionOrder.push('experience')
  if (skills.length)         sectionOrder.push('skills')
  if (education.length)      sectionOrder.push('education')
  if (projects.length)       sectionOrder.push('projects')
  if (certifications.length) sectionOrder.push('certifications')
  if (languages.length)      sectionOrder.push('languages')
  if (awards.length)         sectionOrder.push('awards')
  if (custom.length)         sectionOrder.push('custom')

  return {
    meta: { version: '1.0', updatedAt: new Date().toISOString() },
    personal,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    awards,
    custom,
    sectionOrder,
    _raw: rawText || ''
  }
}

module.exports = { normalizeLlmContent }
