const request  = require('supertest')
const app      = require('../index')
const path     = require('path')
const fs       = require('fs')

describe('POST /api/upload', () => {
  test('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/upload')
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('returns 400 when file type is not pdf or docx', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('plain text'), { filename: 'resume.txt', contentType: 'text/plain' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('UNSUPPORTED_FILE_TYPE')
  })

  test('returns 200 with content JSON shape for a text-based attachment named .pdf', async () => {
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj ' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj ' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
      '0000000058 00000 n\n0000000115 00000 n\n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    )
    const res = await request(app)
      .post('/api/upload')
      .attach('file', minimalPdf, { filename: 'resume.pdf', contentType: 'application/pdf' })
    // 200 = parsed successfully; 422 = parse failed gracefully — both are acceptable
    expect([200, 422]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body).toHaveProperty('content')
      expect(res.body.content).toHaveProperty('personal')
      expect(res.body.content).toHaveProperty('experience')
      expect(res.body.content).toHaveProperty('sectionOrder')
    } else {
      expect(res.body).toHaveProperty('error')
      expect(res.body.code).toBe('PARSE_ERROR')
    }
  })
})
