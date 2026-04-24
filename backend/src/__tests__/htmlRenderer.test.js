const { renderToHtml } = require('../services/renderer/htmlRenderer')

const sampleContent = {
  meta: { version: '1.0', updatedAt: '' },
  personal: { name: 'Jane Doe', title: 'Engineer', email: 'jane@test.com', phone: '555-0000', location: 'NYC', linkedin: '', website: '', summary: 'Experienced engineer.' },
  experience: [{ id: '1', company: 'Acme', role: 'Senior Engineer', location: 'NYC', startDate: 'Jan 2022', endDate: 'Present', current: true, bullets: ['Led a team', 'Shipped product'] }],
  education: [{ id: '2', institution: 'State U', degree: 'B.S.', field: 'CS', startDate: '2015', endDate: '2019', gpa: '' }],
  skills: [{ id: '3', category: 'Languages', items: ['JavaScript', 'Python'] }],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
}

describe('renderToHtml', () => {
  test('returns a string', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(typeof html).toBe('string')
  })

  test('output starts with <!DOCTYPE html>', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/i)
  })

  test('includes the candidate name', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('Jane Doe')
  })

  test('includes experience company name', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('Acme')
  })

  test('includes education institution', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('State U')
  })

  test('includes skill items', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('JavaScript')
  })

  test('works with modern (two-column) template', () => {
    const html = renderToHtml(sampleContent, 'modern')
    expect(html).toContain('Jane Doe')
    expect(html).toContain('sidebar')
  })

  test('throws for unknown templateId', () => {
    expect(() => renderToHtml(sampleContent, 'nonexistent')).toThrow()
  })

  test.each(['classic', 'modern', 'minimal', 'executive', 'creative'])(
    '%s template includes name, company, institution, and skill',
    (templateId) => {
      const html = renderToHtml(sampleContent, templateId)
      expect(html).toContain('Jane Doe')
      expect(html).toContain('Acme')
      expect(html).toContain('State U')
      expect(html).toContain('JavaScript')
    }
  )

  test('modern template output contains sidebar element', () => {
    const html = renderToHtml(sampleContent, 'modern')
    expect(html).toContain('sidebar')
  })

  test('executive template skills appear as badge spans', () => {
    const html = renderToHtml(sampleContent, 'executive')
    expect(html).toContain('JavaScript')
    expect(html).toContain('border-radius:3px')
  })

  test('creative template skills appear as rounded pill spans', () => {
    const html = renderToHtml(sampleContent, 'creative')
    expect(html).toContain('JavaScript')
    expect(html).toContain('border-radius:20px')
  })

  test('classic template skills appear as pill spans', () => {
    const html = renderToHtml(sampleContent, 'classic')
    expect(html).toContain('JavaScript')
    expect(html).toContain('border-radius:3px')
  })
})
