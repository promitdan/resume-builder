const express  = require('express')
const multer   = require('multer')
const { extractTextFromPdf }    = require('../services/parser/pdfParser')
const { extractTextFromDocx }   = require('../services/parser/docxParser')
const { mapToContent }          = require('../services/parser/contentMapper')
const { parseWithGroq, GroqUnavailableError } = require('../services/parser/groqParser')
const { normalizeLlmContent }   = require('../services/parser/llmContentMapper')

const router  = express.Router()

const URL_RE = /https?:\/\/[^\s<>"]+/g

function linkifyContent(content) {
  const linkify = (text) => {
    if (!text || typeof text !== 'string' || text.includes('<')) return text
    return text.replace(URL_RE, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
  }
  if (content.personal?.summary) content.personal.summary = linkify(content.personal.summary)
  content.experience?.forEach(exp => { exp.bullets = exp.bullets?.map(linkify) ?? [] })
  content.projects?.forEach(proj => {
    if (proj.description) proj.description = linkify(proj.description)
    proj.bullets = proj.bullets?.map(linkify) ?? []
  })
  return content
}
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const extAllowed = /\.(pdf|docx)$/i.test(file.originalname)
    if (allowed.includes(file.mimetype) || extAllowed) {
      cb(null, true)
    } else {
      const err = new Error('Unsupported file type')
      err.code  = 'UNSUPPORTED_FILE_TYPE'
      cb(err, false)
    }
  }
})

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'UNSUPPORTED_FILE_TYPE') return res.status(400).json({ error: err.message, code: err.code })
      if (err.code === 'LIMIT_FILE_SIZE')       return res.status(413).json({ error: 'File too large (max 10MB)', code: 'FILE_TOO_LARGE' })
      return res.status(400).json({ error: err.message, code: 'UPLOAD_ERROR' })
    }
    next()
  })
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided', code: 'NO_FILE' })

  try {
    const isPdf  = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(req.file.originalname)
    const rawText = isPdf
      ? await extractTextFromPdf(req.file.buffer)
      : await extractTextFromDocx(req.file.buffer)

    let content, parseMethod

    try {
      const llmRaw = await parseWithGroq(rawText)
      console.log('[groq] result:', JSON.stringify(llmRaw, null, 2))
      content     = normalizeLlmContent(llmRaw, rawText)
      parseMethod = 'groq'
    } catch (groqErr) {
      console.warn('[groq] fallback to regex —', groqErr.name + ':', groqErr.message)
      content     = mapToContent(rawText)
      parseMethod = 'regex-fallback'
    }

    res.set('X-Parse-Method', parseMethod)
    return res.json({ content: linkifyContent(content) })
  } catch (err) {
    console.error('Parse error:', err)
    return res.status(422).json({ error: 'Failed to parse file', code: 'PARSE_ERROR' })
  }
})

module.exports = router
