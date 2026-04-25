const { normalizeLlmContent } = require('../services/parser/llmContentMapper')

describe('normalizeLlmContent', () => {
  test('adds meta and _raw', () => {
    const result = normalizeLlmContent({}, 'raw text')
    expect(result.meta.version).toBe('1.0')
    expect(result._raw).toBe('raw text')
  })

  test('fills missing personal fields with empty strings', () => {
    const result = normalizeLlmContent({ personal: { name: 'Jane' } }, '')
    expect(result.personal.name).toBe('Jane')
    expect(result.personal.email).toBe('')
    expect(result.personal.summary).toBe('')
  })

  test('adds uuid id to each experience entry', () => {
    const result = normalizeLlmContent({
      experience: [{ company: 'Acme', role: 'Eng', location: '', startDate: '', endDate: '', current: false, bullets: [] }]
    }, '')
    expect(result.experience[0].id).toBeTruthy()
    expect(result.experience[0].company).toBe('Acme')
  })

  test('ensures bullets is an array (null → [])', () => {
    const result = normalizeLlmContent({
      experience: [{ company: 'X', role: 'Y', bullets: null }]
    }, '')
    expect(Array.isArray(result.experience[0].bullets)).toBe(true)
  })

  test('adds uuid id to each education entry', () => {
    const result = normalizeLlmContent({
      education: [{ institution: 'MIT', degree: 'B.S.', field: 'CS', startDate: '2018', endDate: '2022', gpa: '3.9' }]
    }, '')
    expect(result.education[0].id).toBeTruthy()
  })

  test('adds uuid id to each skills group and ensures items is array', () => {
    const result = normalizeLlmContent({
      skills: [{ category: 'Languages', items: ['JS', 'Python'] }]
    }, '')
    expect(result.skills[0].id).toBeTruthy()
    expect(result.skills[0].items).toEqual(['JS', 'Python'])
  })

  test('builds sectionOrder from populated arrays', () => {
    const result = normalizeLlmContent({
      personal: { name: 'Jane' },
      experience: [{ company: 'Acme', role: 'Eng', bullets: [] }],
      education: [],
      skills: [{ category: 'X', items: ['Y'] }]
    }, '')
    expect(result.sectionOrder).toContain('personal')
    expect(result.sectionOrder).toContain('experience')
    expect(result.sectionOrder).toContain('skills')
    expect(result.sectionOrder).not.toContain('education')
  })

  test('handles completely empty LLM output without throwing', () => {
    expect(() => normalizeLlmContent(null, '')).not.toThrow()
    expect(() => normalizeLlmContent(undefined, '')).not.toThrow()
  })

  test('handles items being a string (comma-split it)', () => {
    const result = normalizeLlmContent({
      skills: [{ category: 'Tech', items: 'React, Node.js, TypeScript' }]
    }, '')
    expect(result.skills[0].items).toEqual(['React', 'Node.js', 'TypeScript'])
  })

  test('adds uuid id to certifications, awards, projects, custom entries', () => {
    const result = normalizeLlmContent({
      certifications: [{ name: 'AWS', issuer: 'Amazon', date: '2023' }],
      awards: [{ title: 'Hack winner', issuer: 'MIT', date: '2022' }],
      projects: [{ title: 'MyApp', description: 'Cool app', url: '' }],
      custom: [{ title: 'Volunteer', description: 'Food bank' }]
    }, '')
    expect(result.certifications[0].id).toBeTruthy()
    expect(result.awards[0].id).toBeTruthy()
    expect(result.projects[0].id).toBeTruthy()
    expect(result.custom[0].id).toBeTruthy()
  })
})
