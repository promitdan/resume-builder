const mammoth = require('mammoth')

async function extractTextFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

module.exports = { extractTextFromDocx }
