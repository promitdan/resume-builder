const express = require('express')
const { assist } = require('../services/ai/resumeAssistant')

const router = express.Router()

router.post('/', async (req, res) => {
  const { text, action } = req.body
  if (!text || !action) {
    return res.status(400).json({ error: 'text and action are required' })
  }
  try {
    const result = await assist(text, action)
    res.json({ result })
  } catch {
    res.status(503).json({ error: 'AI service unavailable' })
  }
})

module.exports = router
