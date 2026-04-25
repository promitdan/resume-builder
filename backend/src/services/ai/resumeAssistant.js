const fetch = require('node-fetch')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
const TIMEOUT_MS = 30_000

const SYSTEM_PROMPTS = {
  improve: 'Rewrite this resume bullet or summary to be more impactful and professional. Use strong action verbs. Return only the improved text, no explanation.',
  concise: 'Shorten this to one tight, punchy sentence. Keep the key achievement. Return only the result, no explanation.',
  grammar: 'Fix any grammar, spelling, or punctuation errors. Return only the corrected text, no explanation.',
}

class AiUnavailableError extends Error {
  constructor(msg) { super(msg); this.name = 'AiUnavailableError' }
}

async function assistWithGroq(text, action) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[action] },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: controller.signal,
    })
    if (!res.ok) throw new AiUnavailableError(`Groq responded with ${res.status}`)
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new AiUnavailableError('Groq returned an empty response')
    return content.trim()
  } catch (err) {
    if (err.name === 'AiUnavailableError') throw err
    throw new AiUnavailableError(err.message)
  } finally {
    clearTimeout(timer)
  }
}

async function assistWithOllama(text, action) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const prompt = `${SYSTEM_PROMPTS[action]}\n\n${text}`
    const res = await fetch(
      `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt,
          stream: false,
        }),
        signal: controller.signal,
      }
    )
    if (!res.ok) throw new AiUnavailableError(`Ollama responded with ${res.status}`)
    const data = await res.json()
    return data.response.trim()
  } catch (err) {
    if (err.name === 'AiUnavailableError') throw err
    throw new AiUnavailableError(err.message)
  } finally {
    clearTimeout(timer)
  }
}

async function assist(text, action) {
  if (!SYSTEM_PROMPTS[action]) throw new Error(`Unknown action: ${action}`)
  try {
    return await assistWithGroq(text, action)
  } catch {
    return await assistWithOllama(text, action)
  }
}

module.exports = { assist }
