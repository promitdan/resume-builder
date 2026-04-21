const request = require('supertest')

jest.mock('../services/parser/pdfParser', () => ({
  extractTextFromPdf: jest.fn().mockResolvedValue(
    'John Doe\nSoftware Engineer\njohn@example.com\n\nEXPERIENCE\nEngineer — Acme Corp\nJan 2022 – Present\n• Built things\n\nSKILLS\nJavaScript, Node.js'
  )
}))

jest.mock('../services/parser/docxParser', () => ({
  extractTextFromDocx: jest.fn().mockResolvedValue(
    'Jane Doe\nDesigner\njane@example.com'
  )
}))

const app = require('../index')

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

  test('returns 200 with content JSON shape for a PDF upload', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('%PDF-1.4'), { filename: 'resume.pdf', contentType: 'application/pdf' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('content')
    expect(res.body.content).toHaveProperty('personal')
    expect(res.body.content).toHaveProperty('experience')
    expect(res.body.content).toHaveProperty('sectionOrder')
  })

  test('returns 200 with content JSON shape for a DOCX upload', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('PK'), { filename: 'resume.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('content')
    expect(res.body.content).toHaveProperty('personal')
  })
})
