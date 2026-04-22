const { mapToContent } = require('../services/parser/contentMapper')

const sampleText = `
John Doe
Software Engineer
john@example.com | (555) 123-4567 | New York, NY | linkedin.com/in/johndoe

EXPERIENCE
Senior Engineer — Acme Corp
Jan 2022 – Present
• Led a team of 5 engineers
• Reduced deployment time by 40%

Junior Engineer — Beta Inc
Jun 2019 – Dec 2021
• Built REST APIs in Node.js

EDUCATION
B.S. Computer Science
State University, 2019

SKILLS
JavaScript, React, Node.js, Python, AWS

CERTIFICATIONS
AWS Solutions Architect — Amazon, 2023
`

describe('mapToContent', () => {
  let content

  beforeAll(() => {
    content = mapToContent(sampleText)
  })

  test('returns an object with required top-level keys', () => {
    expect(content).toHaveProperty('meta')
    expect(content).toHaveProperty('personal')
    expect(content).toHaveProperty('experience')
    expect(content).toHaveProperty('education')
    expect(content).toHaveProperty('skills')
    expect(content).toHaveProperty('sectionOrder')
    expect(content).toHaveProperty('_raw')
  })

  test('extracts name as first non-empty line', () => {
    expect(content.personal.name).toBe('John Doe')
  })

  test('extracts email from contact line', () => {
    expect(content.personal.email).toBe('john@example.com')
  })

  test('extracts phone from contact line', () => {
    expect(content.personal.phone).toBe('(555) 123-4567')
  })

  test('detects experience section and creates entries', () => {
    expect(content.experience.length).toBeGreaterThanOrEqual(1)
    expect(content.experience[0].company).toContain('Acme Corp')
  })

  test('each experience entry has an id', () => {
    content.experience.forEach((e) => expect(e.id).toBeTruthy())
  })

  test('detects education section', () => {
    expect(content.education.length).toBeGreaterThanOrEqual(1)
  })

  test('detects skills section and splits into items', () => {
    expect(content.skills.length).toBeGreaterThanOrEqual(1)
    expect(content.skills[0].items.length).toBeGreaterThan(0)
  })

  test('sectionOrder includes personal, experience, education, skills', () => {
    expect(content.sectionOrder).toContain('personal')
    expect(content.sectionOrder).toContain('experience')
    expect(content.sectionOrder).toContain('education')
    expect(content.sectionOrder).toContain('skills')
  })

  test('handles empty string without throwing', () => {
    expect(() => mapToContent('')).not.toThrow()
  })
})

describe('mapToContent — real-world patterns', () => {
  test('parses numbered bullet points (1. 2. 3.)', () => {
    const text = `
Jane Doe
jane@example.com

EXPERIENCE
Acme Corp, New York — Senior Engineer
Jan 2022 - Present
1. Led a team of 5 engineers
2. Reduced deployment time by 40%
`
    const content = mapToContent(text)
    expect(content.experience[0].bullets.length).toBeGreaterThanOrEqual(2)
    expect(content.experience[0].bullets[0]).toMatch(/Led a team/)
  })

  test('parses Company, Location — Role format correctly', () => {
    const text = `
Jane Doe
jane@example.com

EXPERIENCE
Nutanix, Bengaluru — Member of Technical Staff-4
November 2020 - Present
1. Built networking interfaces
`
    const content = mapToContent(text)
    const exp = content.experience[0]
    expect(exp.company).toBe('Nutanix')
    expect(exp.location).toBe('Bengaluru')
    expect(exp.role).toBe('Member of Technical Staff-4')
  })

  test('detects EXTRA-CURRICULARS section', () => {
    const text = `
Jane Doe
jane@example.com

SKILLS
JavaScript, React

EXTRA-CURRICULARS
Music Production
`
    const content = mapToContent(text)
    expect(content.sectionOrder).toContain('custom')
  })
})
