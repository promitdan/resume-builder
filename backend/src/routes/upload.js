const express = require('express')
const router = express.Router()

// Implemented in a later task
router.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' })
})

module.exports = router
