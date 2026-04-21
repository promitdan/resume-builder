const express = require('express')
const { exportToPdf }  = require('../services/exporter/pdfExporter')
const { exportToDocx } = require('../services/exporter/docxExporter')

const router = express.Router()

const VALID_TEMPLATES = ['classic', 'modern', 'minimal', 'executive', 'creative']

function validateBody(req, res) {
  if (!req.body.content)    { res.status(400).json({ error: 'content is required', code: 'MISSING_CONTENT' }); return false }
  if (!req.body.templateId) { res.status(400).json({ error: 'templateId is required', code: 'MISSING_TEMPLATE' }); return false }
  if (!VALID_TEMPLATES.includes(req.body.templateId)) {
    res.status(400).json({ error: `Unknown template: ${req.body.templateId}`, code: 'INVALID_TEMPLATE' })
    return false
  }
  return true
}

router.post('/pdf', async (req, res) => {
  if (!validateBody(req, res)) return
  try {
    const { content, templateId } = req.body
    const pdf = await exportToPdf(content, templateId)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume.pdf"`,
      'Content-Length': pdf.length
    })
    res.end(pdf)
  } catch (err) {
    console.error('PDF export error:', err)
    res.status(500).json({ error: 'PDF generation failed', code: 'PDF_ERROR' })
  }
})

router.post('/docx', async (req, res) => {
  if (!validateBody(req, res)) return
  try {
    const { content, templateId } = req.body
    const buf = await exportToDocx(content, templateId)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="resume.docx"`,
      'Content-Length': buf.length
    })
    res.end(buf)
  } catch (err) {
    console.error('DOCX export error:', err)
    res.status(500).json({ error: 'DOCX generation failed', code: 'DOCX_ERROR' })
  }
})

module.exports = router
