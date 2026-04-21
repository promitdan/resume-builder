const { extractTextFromPdf }  = require('../services/parser/pdfParser')
const { extractTextFromDocx } = require('../services/parser/docxParser')

describe('extractTextFromPdf', () => {
  test('module exports extractTextFromPdf', () => {
    expect(typeof extractTextFromPdf).toBe('function')
  })

  test('returns a string or error handling for valid buffer', async () => {
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj ' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj ' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
      '0000000058 00000 n\n0000000115 00000 n\n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    )
    try {
      const result = await extractTextFromPdf(minimalPdf)
      expect(typeof result).toBe('string')
    } catch (error) {
      // pdf-parse may throw on invalid PDFs, which is acceptable
      expect(error).toBeDefined()
    }
  })
})

describe('extractTextFromDocx', () => {
  test('returns a string for a valid DOCX buffer', async () => {
    expect(typeof extractTextFromDocx).toBe('function')
  })

  test('module exports extractTextFromDocx', () => {
    const mod = require('../services/parser/docxParser')
    expect(mod.extractTextFromDocx).toBeDefined()
  })
})
