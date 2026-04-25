const express = require('express')
const { assist } = require('../services/ai/resumeAssistant')

const router = express.Router()
const VALID_ACTIONS = ['improve', 'concise', 'grammar']
const MAX_TEXT_LENGTH = 2000

router.post('/', async (req, res) => {
  const { text, action } = req.body
  if (!text || !action) {
    return res.status(400).json({ error: 'text and action are required' })
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text must be a non-empty string' })
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `text must be ${MAX_TEXT_LENGTH} characters or fewer` })
  }
  if (!VALID_ACTIONS.includes(action)) {
    return res.status(400).json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` })
  }
  try {
    const result = await assist(text, action)
    res.json({ result })
  } catch {
    res.status(503).json({ error: 'AI service unavailable' })
  }
})

module.exports = router
