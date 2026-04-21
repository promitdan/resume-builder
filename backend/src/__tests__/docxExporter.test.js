const { exportToDocx } = require('../services/exporter/docxExporter')

const sampleContent = {
  meta: { version: '1.0', updatedAt: '' },
  personal: { name: 'Jane Doe', title: 'Engineer', email: 'jane@test.com', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [{ id: '1', company: 'Acme', role: 'Engineer', location: '', startDate: 'Jan 2022', endDate: 'Present', current: true, bullets: ['Did work'] }],
  education: [{ id: '2', institution: 'State U', degree: 'B.S.', field: 'CS', startDate: '', endDate: '2019', gpa: '' }],
  skills: [{ id: '3', category: 'Tech', items: ['JavaScript'] }],
  projects: [], certifications: [], languages: [], awards: [], custom: [],
  sectionOrder: ['personal', 'experience', 'education', 'skills'],
  _raw: ''
}

describe('exportToDocx', () => {
  test('returns a Buffer', async () => {
    const buf = await exportToDocx(sampleContent, 'classic')
    expect(Buffer.isBuffer(buf)).toBe(true)
  }, 15000)

  test('buffer is non-empty', async () => {
    const buf = await exportToDocx(sampleContent, 'classic')
    expect(buf.length).toBeGreaterThan(0)
  }, 15000)

  test('throws for unknown templateId', async () => {
    await expect(exportToDocx(sampleContent, 'nonexistent')).rejects.toThrow()
  })
})
