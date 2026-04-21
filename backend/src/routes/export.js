const express = require('express')
const router = express.Router()

router.post('/pdf',  (req, res) => res.status(501).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' }))
router.post('/docx', (req, res) => res.status(501).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' }))

module.exports = router
