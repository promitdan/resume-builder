const pdfParse = require('pdf-parse')

async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer)
  return data.text || ''
}

module.exports = { extractTextFromPdf }
