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
